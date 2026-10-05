import { Router } from "express";
import { addProduct, editProduct, getOneProduct, getProducts, removeProduct } from "../controllers/productController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/", getProducts);
router.get("/:id", getOneProduct);
router.post("/", addProduct);
router.put("/:id", editProduct);
router.delete("/:id", removeProduct);
export default router;
