import express from "express";

import {
  getInventory,
  getLowStock,
  getStockMovements,
  adjustStock,
} from "../controllers/inventoryController.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  getInventory
);

router.get(
  "/low-stock",
  authenticate,
  getLowStock
);

router.get(
  "/movements",
  authenticate,
  getStockMovements
);

router.post(
  "/adjust",
  authenticate,
  adjustStock
);

export default router;