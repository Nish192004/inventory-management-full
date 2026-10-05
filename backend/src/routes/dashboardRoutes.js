import express from "express";

import {
  getDashboardSummary,
  getDashboardProducts,
  getDashboardStock,
  getDashboardSalesDetails,
  getDashboardRevenueDetails,
} from "../controllers/dashboardController.js";

import {
  getSalesAnalytics,
  getCategoryAnalytics,
  getTopProducts,
  getRecentActivity,
} from "../controllers/dashboardAnalyticsController.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();


// =====================================================
// DASHBOARD SUMMARY
// =====================================================

router.get(
  "/summary",
  authenticate,
  getDashboardSummary
);


// =====================================================
// READ-ONLY DASHBOARD DETAIL PAGES
// =====================================================

router.get(
  "/products",
  authenticate,
  getDashboardProducts
);

router.get(
  "/stock",
  authenticate,
  getDashboardStock
);

router.get(
  "/sales-details",
  authenticate,
  getDashboardSalesDetails
);

router.get(
  "/revenue-details",
  authenticate,
  getDashboardRevenueDetails
);


// =====================================================
// EXISTING DASHBOARD ANALYTICS
// =====================================================

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