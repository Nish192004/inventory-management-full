import prisma from "../config/prisma.js";

const cleanProduct = (product) => ({
  ...product,
  price: Number(product.price)
});

export const listProducts = async ({ search = "", category = "" }) => {
  const products = await prisma.product.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } }
          ]
        } : {},
        category ? { category } : {}
      ]
    },
    orderBy: { createdAt: "desc" }
  });
  return products.map(cleanProduct);
};

export const getProduct = async (id) => {
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  return cleanProduct(product);
};

export const createProduct = async (data) => {
  const product = await prisma.product.create({
    data: {
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      description: data.description?.trim() || null,
      category: data.category?.trim() || null,
      quantity: Number(data.quantity || 0),
      price: Number(data.price),
      minStock: Number(data.minStock ?? 5)
    }
  });
  return cleanProduct(product);
};

export const updateProduct = async (id, data) => {
  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.sku !== undefined && { sku: data.sku.trim().toUpperCase() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.category !== undefined && { category: data.category?.trim() || null }),
      ...(data.quantity !== undefined && { quantity: Number(data.quantity) }),
      ...(data.price !== undefined && { price: Number(data.price) }),
      ...(data.minStock !== undefined && { minStock: Number(data.minStock) })
    }
  });
  return cleanProduct(product);
};

export const deleteProduct = async (id) => {
  await prisma.product.delete({ where: { id: Number(id) } });
  return { message: "Product deleted successfully" };
};
