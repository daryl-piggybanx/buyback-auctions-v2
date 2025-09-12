import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";
import VerificationCodeEmail from "./VerificationCodeEmail";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    // Generate a cryptographically secure random 8-digit numeric string
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    const randomNumber = array.reduce((acc, byte) => acc * 256 + byte, 0);
    return (randomNumber % 100000000).toString().padStart(8, '0');
  },
  async sendVerificationRequest({
    identifier: email,
    provider,
    token,
    expires,
  }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      // TODO: Update with your app name and email address
      from: process.env.AUTH_EMAIL ?? "My App <onboarding@resend.dev>",
      to: [email],
      // TODO: Update with your app name
      subject: `Sign in to My App`,
      react: VerificationCodeEmail({ code: token, expires }),
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});