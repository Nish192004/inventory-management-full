import prisma from "../config/prisma.js";

/**
 * GET /api/inventory
 */
export const getInventory = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};

/**
 * GET /api/inventory/low-stock
 */
export const getLowStock = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        quantity: "asc",
      },
    });

    const lowStockProducts = products.filter(
      (product) => product.quantity <= product.minStock
    );

    return res.status(200).json({
      success: true,
      data: lowStockProducts,
    });
  } catch (error) {
    console.error("Get low stock error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch low stock products",
      error: error.message,
    });
  }
};

/**
 * GET /api/inventory/movements
 */
export const getStockMovements = async (req, res) => {
  try {
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

    return res.status(200).json({
      success: true,
      data: movements,
    });
  } catch (error) {
    console.error("Get stock movements error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
      error: error.message,
    });
  }
};

/**
 * POST /api/inventory/adjust
 *
 * Frontend sends:
 *
 * {
 *   productId,
 *   quantity,
 *   type: "IN" | "OUT",
 *   note
 * }
 *
 * IN  = increase stock
 * OUT = decrease stock
 */
export const adjustStock = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      type,
      note,
    } = req.body;

    console.log("Stock adjustment request:", {
      productId,
      quantity,
      type,
      note,
    });

    // -----------------------------
    // Validate product ID
    // -----------------------------

    const parsedProductId = Number(productId);

    if (
      !Number.isInteger(parsedProductId) ||
      parsedProductId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // -----------------------------
    // Validate quantity
    // -----------------------------

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    // -----------------------------
    // Validate adjustment type
    // -----------------------------

    if (type !== "IN" && type !== "OUT") {
      return res.status(400).json({
        success: false,
        message: "Adjustment type must be IN or OUT",
      });
    }

    // -----------------------------
    // Find product
    // -----------------------------

    const product = await prisma.product.findUnique({
      where: {
        id: parsedProductId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -----------------------------
    // Calculate new stock
    // -----------------------------

    const before = product.quantity;

    let after;

    if (type === "IN") {
      after = before + parsedQuantity;
    } else {
      after = before - parsedQuantity;
    }

    // -----------------------------
    // Prevent negative stock
    // -----------------------------

    if (after < 0) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available stock: ${before}`,
      });
    }

    // -----------------------------
    // Database transaction
    // -----------------------------

    const result = await prisma.$transaction(async (tx) => {
      // Update product quantity
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

      // Create stock movement
      const movement = await tx.stockMovement.create({
        data: {
          productId: parsedProductId,

          // Manual stock changes are recorded as ADJUSTMENT
          type: "ADJUSTMENT",

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

    // -----------------------------
    // Success
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Stock adjustment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to adjust stock",
      error: error.message,
    });
  }
};