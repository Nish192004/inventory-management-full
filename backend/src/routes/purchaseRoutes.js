import express from "express";

import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  receivePurchase,
  cancelPurchase,
  deletePurchase,
} from "../controllers/purchaseController.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  getPurchases
);

router.get(
  "/:id",
  authenticate,
  getPurchaseById
);

router.post(
  "/",
  authenticate,
  createPurchase
);

router.patch(
  "/:id/receive",
  authenticate,
  receivePurchase
);

router.patch(
  "/:id/cancel",
  authenticate,
  cancelPurchase
);

router.delete(
  "/:id",
  authenticate,
  deletePurchase
);

export default router;