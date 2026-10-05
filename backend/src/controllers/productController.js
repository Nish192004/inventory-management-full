import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService.js";

export const listProducts = async (
  req,
  res,
  next
) => {
  try {
    const products =
      await getProducts(req.query);

    res.json({
      success: true,
      data: products,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await getProductById(
        req.params.id
      );

    res.json({
      success: true,
      data: product,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const addProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await createProduct(req.body);

    res.status(201).json({
      success: true,
      message:
        "Product created successfully.",
      data: product,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const editProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await updateProduct(
        req.params.id,
        req.body
      );

    res.json({
      success: true,
      message:
        "Product updated successfully.",
      data: product,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const removeProduct = async (
  req,
  res,
  next
) => {
  try {
    await deleteProduct(
      req.params.id
    );

    res.json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};