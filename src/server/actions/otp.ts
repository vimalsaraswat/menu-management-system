"use server";

import { redis } from "~/lib/redis";
import { sendEmail } from "~/server/actions/mail";

const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 5 * 60; // 5 minutes

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email: string) {
  const attempts = await redis.incr(`rate:${email}`);
  if (attempts === 1) await redis.expire(`rate:${email}`, 60); // 1 min window

  if (attempts > 5) {
    throw new Error("Too many attempts. Try again later.");
  }

  const otp = generateOTP();

  // Store in Redis: key = otp:123456 → email, key = email:otp → 123456
  await redis.set(`otp:${otp}`, email, "EX", OTP_TTL_SECONDS);
  await redis.set(`email:${email}`, otp, "EX", OTP_TTL_SECONDS);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333;">Your Login Code</h2>
      <p>Your verification code is:</p>
      <h1 style="font-size: 36px; letter-spacing: 8px; text-align: center; color: #e11d48;">${otp}</h1>
      <p>This code expires in 5 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  const result = await sendEmail({
    email,
    subject: "Your Verification Code",
    message: html,
  });

  if (!result.success) {
    throw new Error("Failed to send email");
  }

  return { success: true };
}

export async function verifyOtp(email: string, code: string) {
  if (code.length !== OTP_LENGTH) return false;

  const storedEmail = await redis.get(`otp:${code}`);
  if (!storedEmail || storedEmail !== email) {
    return false;
  }

  // Optional: delete after successful verify
  await redis.del(`otp:${code}`);
  await redis.del(`email:${email}`);

  return true;
}
