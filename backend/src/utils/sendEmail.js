
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async (email, resetUrl) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER and SMTP_PASS must be configured in .env");
  }

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Reset your Inventory Management password",
    text: `Use this link to reset your password. It expires in 15 minutes: ${resetUrl}`,
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset for your account.</p>
      <p>This link expires in 15 minutes.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
};
