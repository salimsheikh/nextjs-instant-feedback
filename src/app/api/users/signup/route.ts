import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/UserModel";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();

    try {

        const {username, email, password} = await request.json();

        const existingUserVerifiedByUsername = await UserModel.findOne({username: username, isVerified: true});

        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "Username already exists."
            },{status: 400});
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        const existingUserVerifiedByEmail = await UserModel.findOne({email: email, isVerified: true});
        

        if(existingUserVerifiedByEmail){
           //
        }else{            
            const hashedPassword = await bcrypt.hash(password,10);

            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel( {
                username,
                email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: true,
                isAcceptingmessage: true,
                messages: []
            });

            await newUser.save();
            
        }

        //send verification email
       const emailResponse = await sendVerificationEmail(email, username, verifyCode)
       if(!emailResponse.success){
        return Response.json({
            success: false,
            message: emailResponse.messagge
        },{status: 500});
       }else{
        return Response.json({
            success: true,
            message: "User registered successfully. Pleas verify your email."
        },{status: 201});
       }

        
    } catch (error: any) {
        console.log("Error registering user", error);

        return Response.json({
            success: false,
            message: "Error registering user"
        },{status: 500})
        
    }
}