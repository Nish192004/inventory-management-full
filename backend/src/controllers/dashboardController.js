import prisma from "../config/prisma.js";

const toNumber = (value) => Number(value || 0);

// =====================================================
// DASHBOARD SUMMARY
// =====================================================

export const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      productCount,
      products,
      sales,
      purchases,
      outOfStockProducts,
    ] = await Promise.all([
      prisma.product.count(),

      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
          minStock: true,
          price: true,
          costPrice: true,
        },
      }),

      prisma.sale.findMany({
        where: {
          status: "COMPLETED",
        },
        select: {
          id: true,
          total: true,
          createdAt: true,
        },
      }),

      prisma.purchaseOrder.findMany({
        where: {
          status: "RECEIVED",
        },
        select: {
          id: true,
          total: true,
          createdAt: true,
        },
      }),

      prisma.product.count({
        where: {
          quantity: 0,
        },
      }),
    ]);

    const totalStock = products.reduce(
      (sum, product) => sum + Number(product.quantity || 0),
      0
    );

    const lowStock = products.filter(
      (product) =>
        product.quantity > 0 &&
        product.quantity <= product.minStock
    ).length;

    const totalSales = sales.reduce(
      (sum, sale) => sum + toNumber(sale.total),
      0
    );

    const totalPurchases = purchases.reduce(
      (sum, purchase) => sum + toNumber(purchase.total),
      0
    );

    const revenue = totalSales;

    const estimatedProfit = totalSales - totalPurchases;

    res.json({
      success: true,

      data: {
        productCount,
        totalStock,
        totalSales,
        totalPurchases,
        revenue,
        estimatedProfit,
        lowStock,
        outOfStock: outOfStockProducts,
        salesCount: sales.length,
        purchaseCount: purchases.length,
      },
    });
  } catch (error) {
    console.error("getDashboardSummary error:", error);
    next(error);
  }
};


// =====================================================
// TOTAL PRODUCTS DETAILS
// =====================================================

export const getDashboardProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalProducts = products.length;

    const totalUnits = products.reduce(
      (sum, product) => sum + Number(product.quantity || 0),
      0
    );

    res.json({
      success: true,

      data: {
        totalProducts,
        totalUnits,
        products,
      },
    });
  } catch (error) {
    console.error("getDashboardProducts error:", error);
    next(error);
  }
};


// =====================================================
// TOTAL STOCK DETAILS
// =====================================================

export const getDashboardStock = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        quantity: "asc",
      },

      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalStock = products.reduce(
      (sum, product) => sum + Number(product.quantity || 0),
      0
    );

    const totalStockValue = products.reduce(
      (sum, product) =>
        sum +
        Number(product.quantity || 0) *
        Number(product.costPrice || 0),
      0
    );

    const lowStock = products.filter(
      (product) =>
        product.quantity > 0 &&
        product.quantity <= product.minStock
    ).length;

    const outOfStock = products.filter(
      (product) => product.quantity === 0
    ).length;

    res.json({
      success: true,

      data: {
        totalProducts: products.length,
        totalStock,
        totalStockValue,
        lowStock,
        outOfStock,
        products,
      },
    });
  } catch (error) {
    console.error("getDashboardStock error:", error);
    next(error);
  }
};


// =====================================================
// TOTAL SALES DETAILS
// =====================================================

export const getDashboardSalesDetails = async (req, res, next) => {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        status: "COMPLETED",
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    const totalSales = sales.reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0
    );

    const totalItemsSold = sales.reduce(
      (sum, sale) =>
        sum +
        sale.items.reduce(
          (itemSum, item) =>
            itemSum + Number(item.quantity || 0),
          0
        ),
      0
    );

    res.json({
      success: true,

      data: {
        salesCount: sales.length,
        totalItemsSold,
        totalSales,
        sales,
      },
    });
  } catch (error) {
    console.error("getDashboardSalesDetails error:", error);
    next(error);
  }
};


// =====================================================
// REVENUE DETAILS
// =====================================================

export const getDashboardRevenueDetails = async (req, res, next) => {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        status: "COMPLETED",
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        invoiceNumber: true,
        customerName: true,
        subtotal: true,
        tax: true,
        discount: true,
        total: true,
        status: true,
        createdAt: true,

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            total: true,

            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0
    );

    const totalSubtotal = sales.reduce(
      (sum, sale) => sum + Number(sale.subtotal || 0),
      0
    );

    const totalTax = sales.reduce(
      (sum, sale) => sum + Number(sale.tax || 0),
      0
    );

    const totalDiscount = sales.reduce(
      (sum, sale) => sum + Number(sale.discount || 0),
      0
    );

    res.json({
      success: true,

      data: {
        salesCount: sales.length,
        totalRevenue,
        totalSubtotal,
        totalTax,
        totalDiscount,
        sales,
      },
    });
  } catch (error) {
    console.error("getDashboardRevenueDetails error:", error);
    next(error);
  }
};