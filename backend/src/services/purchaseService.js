import prisma from "../config/prisma.js";

const parseId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid ID.");
  }

  return id;
};

export const listPurchases = async (
  query = {}
) => {
  const search = String(
    query.search || ""
  ).trim();

  return prisma.purchaseOrder.findMany({
    where: search
      ? {
          OR: [
            {
              orderNumber: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              supplier: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {},

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
};

export const getPurchase = async (
  idValue
) => {
  const id = parseId(idValue);

  const purchase =
    await prisma.purchaseOrder.findUnique({
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
    const error = new Error(
      "Purchase not found."
    );

    error.statusCode = 404;

    throw error;
  }

  return purchase;
};

export const createPurchase = async (
  data
) => {
  const {
    supplierId,
    items,
    status = "RECEIVED",
  } = data;

  if (!supplierId) {
    throw new Error(
      "Supplier is required."
    );
  }

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "At least one product is required."
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {
        const supplier =
          await tx.supplier.findUnique({
            where: {
              id: Number(supplierId),
            },
          });

        if (!supplier) {
          throw new Error(
            "Supplier not found."
          );
        }

        const preparedItems = [];
        let total = 0;

        for (const item of items) {
          const product =
            await tx.product.findUnique({
              where: {
                id: Number(
                  item.productId
                ),
              },
            });

          if (!product) {
            throw new Error(
              `Product ${item.productId} not found.`
            );
          }

          const quantity =
            Number(item.quantity);

          const costPrice =
            Number(item.costPrice);

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity <= 0
          ) {
            throw new Error(
              `Invalid quantity for ${product.name}.`
            );
          }

          if (
            !Number.isFinite(
              costPrice
            ) ||
            costPrice < 0
          ) {
            throw new Error(
              `Invalid cost price for ${product.name}.`
            );
          }

          const itemTotal =
            quantity * costPrice;

          total += itemTotal;

          preparedItems.push({
            product,
            quantity,
            costPrice,
            itemTotal,
          });
        }

        const orderNumber =
          `PO-${Date.now()}`;

        const purchase =
          await tx.purchaseOrder.create({
            data: {
              supplierId:
                supplier.id,
              orderNumber,
              total,
              status,
            },
          });

        for (const item of preparedItems) {
          await tx.purchaseItem.create({
            data: {
              purchaseOrderId:
                purchase.id,
              productId:
                item.product.id,
              quantity:
                item.quantity,
              costPrice:
                item.costPrice,
              total:
                item.itemTotal,
            },
          });

          if (status === "RECEIVED") {
            const before =
              item.product.quantity;

            const after =
              before + item.quantity;

            await tx.product.update({
              where: {
                id: item.product.id,
              },

              data: {
                quantity: after,
                costPrice:
                  item.costPrice,
              },
            });

            await tx.stockMovement.create({
              data: {
                productId:
                  item.product.id,
                type: "PURCHASE",
                quantity:
                  item.quantity,
                before,
                after,
                note: `Purchase ${orderNumber}`,
              },
            });
          }
        }

        return tx.purchaseOrder.findUnique({
          where: {
            id: purchase.id,
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
      }
    );

  return result;
};

export const updatePurchase = async (
  idValue,
  data
) => {
  const id = parseId(idValue);

  const existing =
    await prisma.purchaseOrder.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    const error = new Error(
      "Purchase not found."
    );

    error.statusCode = 404;

    throw error;
  }

  const updateData = {};

  if (data.status) {
    updateData.status =
      data.status;
  }

  if (data.supplierId) {
    const supplier =
      await prisma.supplier.findUnique({
        where: {
          id: Number(
            data.supplierId
          ),
        },
      });

    if (!supplier) {
      throw new Error(
        "Supplier not found."
      );
    }

    updateData.supplierId =
      supplier.id;
  }

  const updated =
    await prisma.purchaseOrder.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        supplier: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });

  return updated;
};

export const deletePurchase = async (
  idValue
) => {
  const id = parseId(idValue);

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
    const error = new Error(
      "Purchase not found."
    );

    error.statusCode = 404;

    throw error;
  }

  if (
    purchase.status === "RECEIVED"
  ) {
    const error = new Error(
      "Received purchases cannot be deleted because stock has already been added."
    );

    error.statusCode = 409;

    throw error;
  }

  await prisma.purchaseOrder.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message:
      "Purchase deleted successfully.",
  };
};