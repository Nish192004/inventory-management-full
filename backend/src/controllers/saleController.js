import prisma from "../config/prisma.js";

const generateInvoiceNumber = () => {
  return `INV-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;
};

const parsePositiveId = (
  value,
  fieldName
) => {
  const id = Number(value);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      `Invalid ${fieldName}.`
    );
  }

  return id;
};

export const createSale = async (
  req,
  res,
  next
) => {
  try {
    const {
      customerId,
      customerName,
      items,
      tax = 0,
      discount = 0,
    } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new Error(
        "At least one product is required."
      );
    }

    const taxAmount = Number(tax || 0);
    const discountAmount =
      Number(discount || 0);

    if (
      !Number.isFinite(taxAmount) ||
      taxAmount < 0
    ) {
      throw new Error(
        "Invalid tax amount."
      );
    }

    if (
      !Number.isFinite(discountAmount) ||
      discountAmount < 0
    ) {
      throw new Error(
        "Invalid discount amount."
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          let subtotal = 0;

          const preparedItems = [];

          for (const item of items) {
            const productId =
              parsePositiveId(
                item.productId,
                "product ID"
              );

            const product =
              await tx.product.findUnique({
                where: {
                  id: productId,
                },
              });

            if (!product) {
              throw new Error(
                `Product ${productId} not found.`
              );
            }

            const quantity =
              Number(item.quantity);

            if (
              !Number.isInteger(quantity) ||
              quantity <= 0
            ) {
              throw new Error(
                `Invalid quantity for ${product.name}.`
              );
            }

            if (
              product.quantity <
              quantity
            ) {
              throw new Error(
                `Insufficient stock for ${product.name}. Available: ${product.quantity}.`
              );
            }

            const price =
              item.price !== undefined &&
              item.price !== ""
                ? Number(item.price)
                : Number(product.price);

            if (
              !Number.isFinite(price) ||
              price < 0
            ) {
              throw new Error(
                `Invalid price for ${product.name}.`
              );
            }

            const total =
              price * quantity;

            subtotal += total;

            preparedItems.push({
              product,
              quantity,
              price,
              total,
            });
          }

          const total =
            subtotal +
            taxAmount -
            discountAmount;

          if (total < 0) {
            throw new Error(
              "Sale total cannot be negative."
            );
          }

          let invoiceNumber =
            generateInvoiceNumber();

          while (
            await tx.sale.findUnique({
              where: {
                invoiceNumber,
              },
            })
          ) {
            invoiceNumber =
              generateInvoiceNumber();
          }

          let validCustomerId = null;

          if (
            customerId !== undefined &&
            customerId !== null &&
            customerId !== ""
          ) {
            const parsedCustomerId =
              parsePositiveId(
                customerId,
                "customer ID"
              );

            const customer =
              await tx.customer.findUnique({
                where: {
                  id: parsedCustomerId,
                },
              });

            if (!customer) {
              throw new Error(
                "Customer not found."
              );
            }

            validCustomerId =
              customer.id;
          }

          const sale =
            await tx.sale.create({
              data: {
                invoiceNumber,
                customerId:
                  validCustomerId,
                customerName:
                  customerName
                    ? String(
                        customerName
                      ).trim()
                    : null,
                subtotal,
                tax: taxAmount,
                discount:
                  discountAmount,
                total,
                status: "COMPLETED",
              },
            });

          for (const item of preparedItems) {
            const before =
              item.product.quantity;

            const after =
              before - item.quantity;

            await tx.saleItem.create({
              data: {
                saleId: sale.id,
                productId:
                  item.product.id,
                quantity:
                  item.quantity,
                price: item.price,
                total: item.total,
              },
            });

            await tx.product.update({
              where: {
                id: item.product.id,
              },
              data: {
                quantity: after,
              },
            });

            await tx.stockMovement.create({
              data: {
                productId:
                  item.product.id,
                type: "SALE",
                quantity:
                  item.quantity,
                before,
                after,
                note: `Sale ${sale.invoiceNumber}`,
              },
            });
          }

          return tx.sale.findUnique({
            where: {
              id: sale.id,
            },
            include: {
              customer: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          });
        }
      );

    res.status(201).json({
      success: true,
      message:
        "Sale created successfully.",
      data: result,
      sale: result,
    });
  } catch (error) {
    console.error(
      "createSale error:",
      error
    );

    next(error);
  }
};

export const getSales = async (
  req,
  res,
  next
) => {
  try {
    const search = String(
      req.query.search || ""
    ).trim();

    const where = search
      ? {
          OR: [
            {
              invoiceNumber: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              customerName: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const sales =
      await prisma.sale.findMany({
        where,
        include: {
          customer: true,
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
      data: sales,
      sales,
    });
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (
  req,
  res,
  next
) => {
  try {
    const id = parsePositiveId(
      req.params.id,
      "sale ID"
    );

    const sale =
      await prisma.sale.findUnique({
        where: {
          id,
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found.",
      });
    }

    res.json({
      success: true,
      data: sale,
      sale,
    });
  } catch (error) {
    next(error);
  }
};