import prisma from "../config/prisma.js";

const generateInvoiceNumber = () => {
  return `INV-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;
};

const parsePositiveId = (value, fieldName) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return id;
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

    // -----------------------------------------
    // Validate items
    // -----------------------------------------

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required.",
      });
    }

    // -----------------------------------------
    // Validate tax
    // -----------------------------------------

    const taxAmount = Number(tax || 0);

    if (!Number.isFinite(taxAmount) || taxAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax amount.",
      });
    }

    // -----------------------------------------
    // Validate discount
    // -----------------------------------------

    const discountAmount = Number(discount || 0);

    if (
      !Number.isFinite(discountAmount) ||
      discountAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount amount.",
      });
    }

    // -----------------------------------------
    // Create sale transaction
    // -----------------------------------------

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;

      const preparedItems = [];

      // -----------------------------------------
      // Validate every product
      // -----------------------------------------

      for (const item of items) {
        const productId = parsePositiveId(
          item.productId,
          "product ID"
        );

        const product = await tx.product.findUnique({
          where: {
            id: productId,
          },
        });

        if (!product) {
          throw new Error(
            `Product ${productId} not found.`
          );
        }

        // ---------------------------------------
        // Validate quantity
        // ---------------------------------------

        const quantity = Number(item.quantity);

        if (
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          throw new Error(
            `Invalid quantity for ${product.name}.`
          );
        }

        // ---------------------------------------
        // Check stock
        // ---------------------------------------

        if (product.quantity < quantity) {
          const error = new Error(
            `Insufficient stock for ${product.name}. Available: ${product.quantity}.`
          );

          error.statusCode = 400;

          throw error;
        }

        // ---------------------------------------
        // Determine price
        // ---------------------------------------

        const price =
          item.price !== undefined &&
          item.price !== ""
            ? Number(item.price)
            : Number(product.price);

        if (!Number.isFinite(price) || price < 0) {
          throw new Error(
            `Invalid price for ${product.name}.`
          );
        }

        // ---------------------------------------
        // Calculate item total
        // ---------------------------------------

        const total = price * quantity;

        subtotal += total;

        preparedItems.push({
          product,
          quantity,
          price,
          total,
        });
      }

      // -----------------------------------------
      // Calculate final sale total
      // -----------------------------------------

      const total =
        subtotal +
        taxAmount -
        discountAmount;

      if (total < 0) {
        throw new Error(
          "Sale total cannot be negative."
        );
      }

      // -----------------------------------------
      // Generate unique invoice number
      // -----------------------------------------

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

      // -----------------------------------------
      // Validate customer
      // -----------------------------------------

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
          const error = new Error(
            "Customer not found."
          );

          error.statusCode = 404;

          throw error;
        }

        validCustomerId = customer.id;
      }

      // -----------------------------------------
      // Create sale
      // -----------------------------------------

      const sale = await tx.sale.create({
        data: {
          invoiceNumber,

          customerId: validCustomerId,

          customerName: customerName
            ? String(customerName).trim()
            : null,

          subtotal,
          tax: taxAmount,
          discount: discountAmount,
          total,

          status: "COMPLETED",
        },
      });

      // -----------------------------------------
      // Create sale items + update inventory
      // -----------------------------------------

      for (const item of preparedItems) {
        const before = item.product.quantity;

        const after =
          before - item.quantity;

        // ---------------------------------------
        // Create SaleItem
        // ---------------------------------------

        await tx.saleItem.create({
          data: {
            saleId: sale.id,

            productId: item.product.id,

            quantity: item.quantity,

            price: item.price,

            total: item.total,
          },
        });

        // ---------------------------------------
        // Update product stock
        // ---------------------------------------

        await tx.product.update({
          where: {
            id: item.product.id,
          },

          data: {
            quantity: after,
          },
        });

        // ---------------------------------------
        // Create stock movement
        // ---------------------------------------

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

      // -----------------------------------------
      // Return complete sale
      // -----------------------------------------

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
    });

    // -----------------------------------------
    // Success response
    // -----------------------------------------

    return res.status(201).json({
      success: true,

      message: "Sale created successfully.",

      data: result,

      sale: result,
    });
  } catch (error) {
    console.error("createSale error:", error);

    // -----------------------------------------
    // Business / validation errors
    // -----------------------------------------

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------
    // Known validation errors
    // -----------------------------------------

    const businessErrors = [
      "At least one product is required.",
      "Invalid tax amount.",
      "Invalid discount amount.",
      "Sale total cannot be negative.",
    ];

    if (
      businessErrors.includes(error.message)
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message?.startsWith(
        "Invalid product ID"
      ) ||
      error.message?.startsWith(
        "Invalid customer ID"
      ) ||
      error.message?.startsWith(
        "Invalid quantity"
      ) ||
      error.message?.startsWith(
        "Invalid price"
      ) ||
      error.message?.startsWith(
        "Insufficient stock"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------
    // Unexpected server error
    // -----------------------------------------

    return res.status(500).json({
      success: false,
      message: "Failed to create sale.",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL SALES
// =====================================================

export const getSales = async (req, res, next) => {
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

    return res.json({
      success: true,
      data: sales,
      sales,
    });
  } catch (error) {
    console.error("getSales error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales.",
      error: error.message,
    });
  }
};

// =====================================================
// GET SALE BY ID
// =====================================================

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

    return res.json({
      success: true,
      data: sale,
      sale,
    });
  } catch (error) {
    console.error("getSaleById error:", error);

    if (
      error.message?.startsWith(
        "Invalid sale ID"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sale.",
      error: error.message,
    });
  }
};