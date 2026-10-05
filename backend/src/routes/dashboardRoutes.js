import express from "express";

import {
  getDashboardSummary,
} from "../controllers/dashboardController.js";

import {
  getSalesAnalytics,
  getCategoryAnalytics,
  getTopProducts,
  getRecentActivity,
} from "../controllers/dashboardAnalyticsController.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/summary",
  authenticate,
  getDashboardSummary
);

router.get(
  "/sales",
  authenticate,
  getSalesAnalytics
);

router.get(
  "/categories",
  authenticate,
  getCategoryAnalytics
);

router.get(
  "/top-products",
  authenticate,
  getTopProducts
);

router.get(
  "/recent-activity",
  authenticate,
  getRecentActivity
);

export default router;