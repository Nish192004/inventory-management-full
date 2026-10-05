import express from "express";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  getCategories
);

router.get(
  "/:id",
  getCategoryById
);

router.post(
  "/",
  createCategory
);

router.put(
  "/:id",
  updateCategory
);

router.delete(
  "/:id",
  deleteCategory
);

export default router;