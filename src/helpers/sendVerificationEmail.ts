import { resend } from "@/lib/resend";
import VerificaitonEmail from "@/emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {

    try {

        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Instant Feedback Verification code',
            react: VerificaitonEmail({username, otp: verifyCode}),
        });

        return { success: true, messagge: "Verification email send successfully." }
    } catch (emailError) {
        console.log("Error sending verification email", emailError);
        return { success: false, messagge: " Failed to send verificaiton email." }
    }

}