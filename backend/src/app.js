import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";

import purchaseRoutes from "./routes/purchaseRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",

    credentials: true,
  })
);

app.use(express.json());

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Inventory API is running",
    });
  }
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/sales",
  saleRoutes
);

app.use(
  "/api/inventory",
  inventoryRoutes
);

app.use(
  "/api/purchases",
  purchaseRoutes
);

app.use(
  "/api/suppliers",
  supplierRoutes
);

app.use(
  "/api/customers",
  customerRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  (err, req, res, next) => {
    console.error(
      "API Error:",
      err
    );

    res.status(
      err.statusCode || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal server error",
    });
  }
);

export default app;