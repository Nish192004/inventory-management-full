import express from "express";

import {
  getReportDashboard,
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getProfitLossReport,
} from "../controllers/reportController.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Protect all report routes
router.use(authenticate);

// Dashboard report
router.get(
  "/dashboard",
  getReportDashboard
);

// Sales report
router.get(
  "/sales",
  getSalesReport
);

// Purchase report
router.get(
  "/purchases",
  getPurchaseReport
);

// Inventory report
router.get(
  "/inventory",
  getInventoryReport
);

// Profit & Loss report
router.get(
  "/profit-loss",
  getProfitLossReport
);

export default router;