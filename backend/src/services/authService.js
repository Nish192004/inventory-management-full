
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { randomBytes, createHash } from "node:crypto";
import { sendPasswordResetEmail } from "../utils/sendEmail.js";

// ======================================================
// PUBLIC USER DATA
// ======================================================

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// ======================================================
// GENERATE JWT
// ======================================================

const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );

// ======================================================
// REGISTER USER
// ======================================================

export const registerUser = async ({ name, email, password }) => {
  if (!name?.trim() || !email?.trim() || !password) {
    const error = new Error(
      "Name, email and password are required"
    );
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error(
      "Password must be at least 6 characters"
    );
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "STAFF",
    },
  });

  return {
    token: generateToken(user),
    user: publicUser(user),
  };
};

// ======================================================
// LOGIN USER
// ======================================================

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    const error = new Error(
      "Email and password are required"
    );
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Your account is inactive");
    error.statusCode = 403;
    throw error;
  }

  return {
    token: generateToken(user),
    user: publicUser(user),
  };
};

// ======================================================
// GET CURRENT USER
// ======================================================

export const getMe = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return publicUser(user);
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPasswordUser = async ({ email }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    const error = new Error("Email is required");
    error.statusCode = 400;
    throw error;
  }

  const message =
    "If an account exists with that email, a reset link will be sent.";

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Do not reveal whether an account exists.
  if (!user) {
    return { message };
  }

  // Generate a secure random token.
  const token = randomBytes(32).toString("hex");

  // Store only the hash of the token.
  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  // Token expires after 15 minutes.
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    throw new Error("FRONTEND_URL is not configured");
  }

  const resetUrl =
    `${frontendUrl.replace(/\/+$/, "")}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (error) {
    // Clear the token if the email could not be sent.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    throw error;
  }

  return { message };
};
// ======================================================
// UPDATE CURRENT USER PROFILE
// ======================================================

export const updateProfileUser = async (userId, profileData) => {
  const { name, email } = profileData;

  // Validate name
  if (name !== undefined && !name?.trim()) {
    const error = new Error("Name cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  // Validate email
  if (email !== undefined && !email?.trim()) {
    const error = new Error("Email cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  const data = {};

  // Only allow these fields to be updated.
  if (name !== undefined) {
    data.name = name.trim();
  }

  if (email !== undefined) {
    data.email = email.trim().toLowerCase();
  }

  if (Object.keys(data).length === 0) {
    const error = new Error("No valid profile fields provided");
    error.statusCode = 400;
    throw error;
  }

  // Ensure the user exists.
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent duplicate email addresses.
  if (data.email && data.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      const error = new Error("Email is already registered");
      error.statusCode = 409;
      throw error;
    }
  }

  // Update only the authenticated user's record.
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return publicUser(updatedUser);
};

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPasswordUser = async ({ token, password }) => {
  if (!token || !password) {
    const error = new Error(
      "Token and password are required"
    );
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error(
      "Password must be at least 6 characters"
    );
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    const error = new Error(
      "Invalid or expired reset link"
    );
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  });

  return {
    message: "Password reset successfully",
  };
};
