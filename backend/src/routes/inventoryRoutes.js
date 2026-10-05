import express from "express";

import {
  getInventory,
  getLowStock,
  getStockMovements,
  adjustStock,
} from "../controllers/inventoryController.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  getInventory
);

router.get(
  "/low-stock",
  getLowStock
);

router.get(
  "/movements",
  getStockMovements
);

router.post(
  "/adjust",
  adjustStock
);

export default router;