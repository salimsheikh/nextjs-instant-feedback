import { NextAuthOptions } from "next-auth"; // Importing NextAuthOptions type for defining authentication options
import CredentialsProvider from "next-auth/providers/credentials"; // Importing the Credentials Provider for custom authentication
import bcrypt from "bcryptjs"; // Importing bcrypt to handle password comparison
import dbConnect from "@/lib/dbconnect"; // Importing the database connection helper
import UserModel from "@/model/UserModel"; // Importing the User model to interact with the user data

// Define the authentication options for NextAuth
export const authOptions: NextAuthOptions = {
    providers: [
        // Setting up the custom Credentials provider
        CredentialsProvider({
            id: "credentials", // Unique identifier for the provider
            name: 'Credentials', // Display name for the provider on the sign-in page
            credentials: {
                email: { label: "Email", type: "text" }, // Email field for sign-in form
                password: { label: "Password", type: "password" } // Password field for sign-in form
            },
            async authorize(credentials: any): Promise<any> {
                // Connect to the database before finding the user
                await dbConnect();
                try {
                    // Find the user by either email or username
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    });

                    // If no user is found, throw an error
                    if (!user) {
                        throw new Error("No user found with this email.");
                    }

                    // Check if the user's account is verified
                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login.");
                    }

                    // Verify the password by comparing the provided password with the stored hashed password
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    // If password is incorrect, throw an error
                    if (!isPasswordCorrect) {
                        throw new Error("Incorrect password.");
                    }

                    // Return the user object if authentication is successful
                    return user;
                } catch (err: any) {
                    // Throw any encountered error during authorization
                    throw new Error(err);
                }
            }
        })
    ],
    callbacks:{
        async jwt({token, user}){
            if(user){
                token._id = user.id?.toString()
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token
        },
        async session({session, token}){
            if(token){
                session.user._id = token.id?.toString()
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session;
        }
    },
    pages: {
        signIn: '/users/signin' // Redirects to this custom sign-in page if sign-in is required
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
};