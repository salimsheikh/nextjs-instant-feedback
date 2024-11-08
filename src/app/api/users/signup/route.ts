import dbConnect from "@/lib/dbconnect"; // Import database connection helper
import UserModel from "@/model/UserModel"; // Import user model for database operations
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"; // Import helper function to send verification email

// Handler for POST request to register a new user
export async function POST(request: Request) {
    // Establish database connection
    await dbConnect();

    try {
        // Parse and extract username, email, and password from request body
        const { username, email, password } = await request.json();

        // Check if a verified user with the same username already exists
        const existingUserVerifiedByUsername = await UserModel.findOne({ username: username, isVerified: true });
        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username already exists."
            }, { status: 400 }); // Return a 400 error if username is taken
        }

        // Check if a verified user with the same email already exists
        const existingUserVerifiedByEmail = await UserModel.findOne({ email: email, isVerified: true });
        if (existingUserVerifiedByEmail) {
            return Response.json({
                success: false,
                message: "Email already exists with this name."
            }, { status: 400 }); // Return a 400 error if email is taken
        }

        // Generate a 6-digit verification code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Check if a user with this email already exists (whether verified or not)
        const existingUserEmail = await UserModel.findOne({ email: email });

        if (existingUserEmail) {
            // If the user exists and is already verified
            if (existingUserEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "Email already exists with this name."
                }, { status: 400 });
            } else {
                // If the user exists but is not verified, update their details
                const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
                existingUserEmail.password = hashedPassword;
                existingUserEmail.verifyCode = verifyCode;
                existingUserEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // Set code expiry to 1 hour from now
                const updateUser = await existingUserEmail.save(); // Save the updated user

                if (!updateUser) {
                    return Response.json({
                        success: false,
                        message: "Error updating user."
                    }, { status: 400 });
                }
            }
        } else {
            // If no user exists with this email, create a new user
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

            // Set verification code expiry to 1 hour from now
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            // Create a new user instance with provided details and default values
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: true, // Initially set to true; you may want to set this based on actual verification logic
                isAcceptingmessage: true, // Optional flag to accept messages
                messages: [] // Initialize with an empty messages array
            });

            const userCreated = await newUser.save(); // Save the new user

            if (!userCreated) {
                return Response.json({
                    success: false,
                    message: "User not created."
                }, { status: 400 });
            }
        }

        // Send verification email to the user
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        
        // Check if email was sent successfully
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 });
        } else {
            return Response.json({
                success: true,
                message: "User registered successfully. Please verify your email."
            }, { status: 201 }); // Return 201 success status for user registration
        }

    } catch (error: any) {
        // Log any errors during registration process
        console.log("Error registering user", error);

        // Return a 500 error if an exception occurs
        return Response.json({
            success: false,
            message: "Error registering user"
        }, { status: 500 });
    }

}//End of function