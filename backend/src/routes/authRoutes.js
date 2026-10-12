import { Router } from "express";

import {
  login,
  me,
  register,
  forgotPassword,
  resetPassword,
  updateProfile,
  googleLogin,
} from "../controllers/authController.js";

import { authenticate } from "../middleware/auth.js";

const router = Router();

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Google login (public route, no authenticate middleware)
router.post("/google", googleLogin);

// Get currently logged-in user
router.get("/me", authenticate, me);

// Update currently logged-in user's profile
router.put("/profile", authenticate, updateProfile);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password (public route, uses the emailed token)
router.post("/reset-password", resetPassword);

export default router;