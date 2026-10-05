import prisma from "../config/prisma.js";

const generateInvoiceNumber = () => {
  const timestamp = Date.now();

  return `INV-${timestamp}`;
};

export const createSale = async (req, res, next) => {
  try {
    const {
      customerId,
      customerName,
      items,
      tax = 0,
      discount = 0,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required.",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        let subtotal = 0;

        const preparedItems = [];

        for (const item of items) {
          const product = await tx.product.findUnique({
            where: {
              id: Number(item.productId),
            },
          });

          if (!product) {
            throw new Error(
              `Product ${item.productId} not found.`
            );
          }

          const quantity = Number(item.quantity);

          if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error(
              `Invalid quantity for ${product.name}.`
            );
          }

          if (product.quantity < quantity) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available: ${product.quantity}.`
            );
          }

          const price = Number(
            item.price ?? product.price
          );

          const total = price * quantity;

          subtotal += total;

          preparedItems.push({
            product,
            quantity,
            price,
            total,
          });
        }

        const taxAmount = Number(tax || 0);
        const discountAmount = Number(discount || 0);

        const total =
          subtotal +
          taxAmount -
          discountAmount;

        const sale = await tx.sale.create({
          data: {
            invoiceNumber: generateInvoiceNumber(),
            customerId: customerId
              ? Number(customerId)
              : null,
            customerName:
              customerName || null,
            subtotal,
            tax: taxAmount,
            discount: discountAmount,
            total,
            status: "COMPLETED",
          },
        });

        for (const item of preparedItems) {
          const before = item.product.quantity;

          const after =
            before - item.quantity;

          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.product.id,
              quantity: item.quantity,
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
              productId: item.product.id,
              type: "SALE",
              quantity: item.quantity,
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
      message: "Sale created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSales = async (req, res, next) => {
  try {
    const sales = await prisma.sale.findMany({
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
    });
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (req, res, next) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: {
        id: Number(req.params.id),
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
    });
  } catch (error) {
    next(error);
  }
};