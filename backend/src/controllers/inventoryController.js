import prisma from "../config/prisma.js";

const parseId = (value, name) => {
  const id = Number(value);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      `Invalid ${name}.`
    );
  }

  return id;
};

const allowedTypes = [
  "PURCHASE",
  "SALE",
  "RETURN",
  "ADJUSTMENT",
  "DAMAGE",
];

export const getInventory = async (
  req,
  res,
  next
) => {
  try {
    const products =
      await prisma.product.findMany({
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
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (
  req,
  res,
  next
) => {
  try {
    const products =
      await prisma.product.findMany({
        where: {
          quantity: {
            gt: 0,
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          quantity: "asc",
        },
      });

    const lowStock =
      products.filter(
        (product) =>
          product.quantity <=
          product.minStock
      );

    res.json({
      success: true,
      data: lowStock,
      products: lowStock,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockMovements =
  async (req, res, next) => {
    try {
      const productId =
        req.query.productId
          ? parseId(
              req.query.productId,
              "product ID"
            )
          : undefined;

      const movements =
        await prisma.stockMovement.findMany({
          where: productId
            ? {
                productId,
              }
            : {},
          include: {
            product: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      res.json({
        success: true,
        data: movements,
        movements,
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

    const parsedProductId =
      parseId(
        productId,
        "product ID"
      );

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        parsedQuantity
      ) ||
      parsedQuantity <= 0
    ) {
      throw new Error(
        "Quantity must be a positive integer."
      );
    }

    if (!allowedTypes.includes(type)) {
      throw new Error(
        `Invalid stock movement type. Allowed values: ${allowedTypes.join(
          ", "
        )}`
      );
    }

    if (type === "SALE") {
      throw new Error(
        "Sales should be created from the Sales module."
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const product =
            await tx.product.findUnique({
              where: {
                id: parsedProductId,
              },
            });

          if (!product) {
            throw new Error(
              "Product not found."
            );
          }

          let after;

          if (
            type === "PURCHASE" ||
            type === "RETURN"
          ) {
            after =
              product.quantity +
              parsedQuantity;
          } else if (
            type === "DAMAGE"
          ) {
            after =
              product.quantity -
              parsedQuantity;
          } else {
            after =
              product.quantity +
              parsedQuantity;
          }

          if (after < 0) {
            throw new Error(
              `Insufficient stock. Available: ${product.quantity}.`
            );
          }

          const updatedProduct =
            await tx.product.update({
              where: {
                id: parsedProductId,
              },
              data: {
                quantity: after,
              },
            });

          const movement =
            await tx.stockMovement.create({
              data: {
                productId:
                  parsedProductId,
                type,
                quantity:
                  parsedQuantity,
                before:
                  product.quantity,
                after,
                note:
                  note ||
                  `Stock ${type.toLowerCase()}`,
              },
            });

          return {
            product: updatedProduct,
            movement,
          };
        }
      );

    res.json({
      success: true,
      message:
        "Stock adjusted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};