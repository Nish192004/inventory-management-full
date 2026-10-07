import prisma from "../config/prisma.js";

/**
 * Get all inventory
 */
export const getInventory = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return products;
};

/**
 * Get low-stock products
 */
export const getLowStock = async () => {
  const products = await prisma.product.findMany({
    where: {
      quantity: {
        lte: prisma.product.fields.minStock,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      quantity: "asc",
    },
  });

  return products;
};

/**
 * Get stock movement history
 */
export const getStockMovements = async () => {
  const movements = await prisma.stockMovement.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return movements;
};

/**
 * Adjust product stock
 */
export const adjustStock = async ({
  productId,
  quantity,
  type,
  note,
}) => {
  const parsedProductId = Number(productId);
  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) {
    throw new Error("Invalid product ID");
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  const allowedTypes = [
    "PURCHASE",
    "SALE",
    "RETURN",
    "ADJUSTMENT",
    "DAMAGE",
  ];

  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid stock movement type");
  }

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: {
        id: parsedProductId,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const before = product.quantity;

    /*
      IN  = increase stock
      OUT = decrease stock
    */

    let after;

    if (type === "SALE" || type === "DAMAGE") {
      after = before - parsedQuantity;
    } else {
      after = before + parsedQuantity;
    }

    if (after < 0) {
      throw new Error(
        `Insufficient stock. Available stock: ${before}`
      );
    }

    const updatedProduct = await tx.product.update({
      where: {
        id: parsedProductId,
      },
      data: {
        quantity: after,
      },
      include: {
        category: true,
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId: parsedProductId,
        type,
        quantity: parsedQuantity,
        before,
        after,
        note: note?.trim() || null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    return {
      product: updatedProduct,
      movement,
    };
  });

  return result;
};