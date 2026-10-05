import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from "../services/productService.js";

export const getProducts = async (req, res, next) => {
  try { res.json({ products: await listProducts(req.query) }); } catch (e) { next(e); }
};
export const getOneProduct = async (req, res, next) => {
  try { res.json({ product: await getProduct(req.params.id) }); } catch (e) { next(e); }
};
export const addProduct = async (req, res, next) => {
  try { res.status(201).json({ product: await createProduct(req.body) }); } catch (e) { next(e); }
};
export const editProduct = async (req, res, next) => {
  try { res.json({ product: await updateProduct(req.params.id, req.body) }); } catch (e) { next(e); }
};
export const removeProduct = async (req, res, next) => {
  try { res.json(await deleteProduct(req.params.id)); } catch (e) { next(e); }
};
