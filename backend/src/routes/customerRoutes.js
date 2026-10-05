import express from "express";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  getCustomers
);

router.get(
  "/:id",
  getCustomerById
);

router.post(
  "/",
  createCustomer
);

router.put(
  "/:id",
  updateCustomer
);

router.delete(
  "/:id",
  deleteCustomer
);

export default router;