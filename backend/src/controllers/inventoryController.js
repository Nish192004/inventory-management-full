import prisma from "../config/prisma.js";

export const getInventory = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    const lowStock = products.filter(
      (product) =>
        product.quantity > 0 &&
        product.quantity <= product.minStock
    );

    res.json({
      success: true,
      data: lowStock,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (
  req,
  res,
  next
) => {
  try {
    const movements =
      await prisma.stockMovement.findMany({
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

    res.json({
      success: true,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (
  req,
  res,
  next
) => {
  try {
    const {
      productId,
      quantity,
      type = "ADJUSTMENT",
      note,
    } = req.body;

    const adjustment = Number(quantity);

    if (!Number.isInteger(adjustment)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be an integer.",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const product =
          await tx.product.findUnique({
            where: {
              id: Number(productId),
            },
          });

        if (!product) {
          throw new Error("Product not found.");
        }

        const before = product.quantity;
        const after = before + adjustment;

        if (after < 0) {
          throw new Error(
            "Stock cannot become negative."
          );
        }

        const updated =
          await tx.product.update({
            where: {
              id: product.id,
            },
            data: {
              quantity: after,
            },
          });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type,
            quantity: Math.abs(adjustment),
            before,
            after,
            note: note || "Manual stock adjustment",
          },
        });

        return updated;
      }
    );

    res.json({
      success: true,
      message: "Stock updated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
