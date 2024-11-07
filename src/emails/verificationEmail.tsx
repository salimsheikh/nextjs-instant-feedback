import * as React from 'react';


interface VerificationEmailProps {
  username: string,
  otp: string,
}

export default function VerificaitonEmail({ username, otp }: VerificationEmailProps) {

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <p>Your OTP Code is {otp}</p>
    </div>
  );
}
