import { Router } from "express";

import {
  login,
  me,
  register,
  forgotPassword,
  updateProfile,
} from "../controllers/authController.js";

import { authenticate } from "../middleware/auth.js";

const router = Router();

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Get currently logged-in user
router.get("/me", authenticate, me);

// Update currently logged-in user's profile
router.put("/profile", authenticate, updateProfile);

// Forgot password
router.post("/forgot-password", forgotPassword);

export default router;