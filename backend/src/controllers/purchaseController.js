import prisma from "../config/prisma.js";

const toNumber = (value) => Number(value || 0);

const generateOrderNumber = () => {
  const now = new Date();

  const date = now.toISOString().slice(0, 10).replaceAll("-", "");

  const time = now
    .toTimeString()
    .slice(0, 8)
    .replaceAll(":", "");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `PO-${date}-${time}-${random}`;
};

/**
 * GET ALL PURCHASE ORDERS
 */
export const getPurchases = async (req, res, next) => {
  try {
    const purchases = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error("getPurchases error:", error);
    next(error);
  }
};

/**
 * GET SINGLE PURCHASE
 */
export const getPurchaseById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase ID.",
      });
    }

    const purchase = await prisma.purchaseOrder.findUnique({
      where: {
        id,
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found.",
      });
    }

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error("getPurchaseById error:", error);
    next(error);
  }
};

/**
 * CREATE PURCHASE ORDER
 *
 * Creating a purchase does NOT increase stock.
 * Stock increases only when the purchase is RECEIVED.
 */
export const createPurchase = async (req, res, next) => {
  try {
    const {
      supplierId,
      orderNumber,
      items,
    } = req.body;

    const parsedSupplierId = Number(supplierId);

    if (
      !Number.isInteger(parsedSupplierId) ||
      parsedSupplierId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid supplier is required.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one purchase item is required.",
      });
    }

    const cleanedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      costPrice: Number(item.costPrice),
    }));

    for (const item of cleanedItems) {
      if (
        !Number.isInteger(item.productId) ||
        item.productId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID.",
        });
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0.",
        });
      }

      if (
        !Number.isFinite(item.costPrice) ||
        item.costPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Cost price must be 0 or greater.",
        });
      }
    }

    const supplier = await prisma.supplier.findUnique({
      where: {
        id: parsedSupplierId,
      },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    const productIds = cleanedItems.map(
      (item) => item.productId
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));

      const missingId = productIds.find(
        (id) => !foundIds.has(id)
      );

      return res.status(404).json({
        success: false,
        message: `Product ${missingId} not found.`,
      });
    }

    const total = cleanedItems.reduce(
      (sum, item) =>
        sum + item.quantity * item.costPrice,
      0
    );

    let finalOrderNumber =
      String(orderNumber || "").trim();

    if (!finalOrderNumber) {
      finalOrderNumber = generateOrderNumber();
    }

    const existingOrder =
      await prisma.purchaseOrder.findUnique({
        where: {
          orderNumber: finalOrderNumber,
        },
      });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: "Order number already exists.",
      });
    }

    const purchase = await prisma.purchaseOrder.create({
      data: {
        supplierId: parsedSupplierId,
        orderNumber: finalOrderNumber,
        total,
        status: "PENDING",

        items: {
          create: cleanedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            costPrice: item.costPrice,
            total: item.quantity * item.costPrice,
          })),
        },
      },

      include: {
        supplier: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully.",
      data: purchase,
    });
  } catch (error) {
    console.error("createPurchase error:", error);
    next(error);
  }
};

/**
 * RECEIVE PURCHASE
 *
 * This is where inventory stock is increased.
 */
export const receivePurchase = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase ID.",
      });
    }

    const purchase =
      await prisma.purchaseOrder.findUnique({
        where: {
          id,
        },
        include: {
          items: true,
        },
      });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found.",
      });
    }

    if (purchase.status === "RECEIVED") {
      return res.status(400).json({
        success: false,
        message: "Purchase order is already received.",
      });
    }

    if (purchase.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled purchase cannot be received.",
      });
    }

    const updatedPurchase =
      await prisma.$transaction(async (tx) => {
        for (const item of purchase.items) {
          const product = await tx.product.findUnique({
            where: {
              id: item.productId,
            },
          });

          if (!product) {
            throw new Error(
              `Product ${item.productId} not found.`
            );
          }

          const before = product.quantity;
          const after =
            before + Number(item.quantity);

          await tx.product.update({
            where: {
              id: product.id,
            },
            data: {
              quantity: after,

              costPrice: item.costPrice,
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              type: "PURCHASE",
              quantity: Number(item.quantity),
              before,
              after,
              note: `Purchase ${purchase.orderNumber} received`,
            },
          });
        }

        return tx.purchaseOrder.update({
          where: {
            id: purchase.id,
          },

          data: {
            status: "RECEIVED",
          },

          include: {
            supplier: true,

            items: {
              include: {
                product: true,
              },
            },
          },
        });
      });

    res.json({
      success: true,
      message:
        "Purchase received and stock updated successfully.",
      data: updatedPurchase,
    });
  } catch (error) {
    console.error("receivePurchase error:", error);
    next(error);
  }
};

/**
 * CANCEL PURCHASE
 */
export const cancelPurchase = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase ID.",
      });
    }

    const purchase =
      await prisma.purchaseOrder.findUnique({
        where: {
          id,
        },
      });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found.",
      });
    }

    if (purchase.status === "RECEIVED") {
      return res.status(400).json({
        success: false,
        message:
          "Received purchase cannot be cancelled.",
      });
    }

    if (purchase.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Purchase is already cancelled.",
      });
    }

    const updatedPurchase =
      await prisma.purchaseOrder.update({
        where: {
          id,
        },

        data: {
          status: "CANCELLED",
        },

        include: {
          supplier: true,

          items: {
            include: {
              product: true,
            },
          },
        },
      });

    res.json({
      success: true,
      message: "Purchase cancelled successfully.",
      data: updatedPurchase,
    });
  } catch (error) {
    console.error("cancelPurchase error:", error);
    next(error);
  }
};

/**
 * DELETE PENDING PURCHASE
 *
 * Only pending purchase orders can be deleted.
 */
export const deletePurchase = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase ID.",
      });
    }

    const purchase =
      await prisma.purchaseOrder.findUnique({
        where: {
          id,
        },
      });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found.",
      });
    }

    if (purchase.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending purchases can be deleted.",
      });
    }

    await prisma.purchaseOrder.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
      message: "Purchase deleted successfully.",
    });
  } catch (error) {
    console.error("deletePurchase error:", error);
    next(error);
  }
};