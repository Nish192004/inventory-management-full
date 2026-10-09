import {
  getMe,
  loginUser,
  registerUser,
  forgotPasswordUser,
  updateProfileUser,
} from "../services/authService.js";

// ======================================================
// REGISTER USER
// ======================================================

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// LOGIN USER
// ======================================================

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body?.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await forgotPasswordUser({ email });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// GET CURRENT LOGGED-IN USER
// ======================================================

export const me = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
      });
    }

    const user = await getMe(req.user.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// UPDATE CURRENT LOGGED-IN USER PROFILE
// ======================================================

export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
      });
    }

    const result = await updateProfileUser(
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result,
    });
  } catch (error) {
    return next(error);
  }
};