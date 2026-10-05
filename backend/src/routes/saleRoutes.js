import express from "express";

import {
  createSale,
  getSales,
  getSaleById,
} from "../controllers/saleController.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  getSales
);

router.get(
  "/:id",
  authenticate,
  getSaleById
);

router.post(
  "/",
  authenticate,
  createSale
);

export default router;