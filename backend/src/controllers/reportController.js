import prisma from "../config/prisma.js";

const toNumber = (value) => Number(value || 0);

// =====================================================
// REPORT DASHBOARD
// =====================================================

export const getReportDashboard = async (
  req,
  res,
  next
) => {
  try {
    const [
      productCount,
      customerCount,
      supplierCount,
      categoryCount,
      sales,
      purchases,
      products,
    ] = await Promise.all([
      prisma.product.count(),

      prisma.customer.count(),

      prisma.supplier.count(),

      prisma.category.count(),

      prisma.sale.findMany({
        where: {
          status: "COMPLETED",
        },
        select: {
          total: true,
        },
      }),

      prisma.purchaseOrder.findMany({
        where: {
          status: "RECEIVED",
        },
        select: {
          total: true,
        },
      }),

      prisma.product.findMany({
        select: {
          quantity: true,
          minStock: true,
          price: true,
          costPrice: true,
        },
      }),
    ]);

    const totalSales = sales.reduce(
      (sum, sale) => sum + toNumber(sale.total),
      0
    );

    const totalPurchases = purchases.reduce(
      (sum, purchase) => sum + toNumber(purchase.total),
      0
    );

    const totalStock = products.reduce(
      (sum, product) =>
        sum + Number(product.quantity || 0),
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

    const profit = totalSales - totalPurchases;

    res.json({
      success: true,

      data: {
        productCount,
        customerCount,
        supplierCount,
        categoryCount,

        totalSales,
        totalPurchases,

        profit,

        totalStock,
        lowStock,
        outOfStock,
      },
    });
  } catch (error) {
    console.error(
      "getReportDashboard error:",
      error
    );

    next(error);
  }
};

// =====================================================
// SALES REPORT
// =====================================================

export const getSalesReport = async (
  req,
  res,
  next
) => {
  try {
    const sales =
      await prisma.sale.findMany({
        where: {
          status: "COMPLETED",
        },

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

    const totalSales = sales.reduce(
      (sum, sale) =>
        sum + toNumber(sale.total),
      0
    );

    res.json({
      success: true,

      data: {
        sales,

        totalSales,

        salesCount: sales.length,
      },
    });
  } catch (error) {
    console.error(
      "getSalesReport error:",
      error
    );

    next(error);
  }
};

// =====================================================
// PURCHASE REPORT
// =====================================================

export const getPurchaseReport = async (
  req,
  res,
  next
) => {
  try {
    const purchases =
      await prisma.purchaseOrder.findMany({
        where: {
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

        orderBy: {
          createdAt: "desc",
        },
      });

    const totalPurchases =
      purchases.reduce(
        (sum, purchase) =>
          sum + toNumber(purchase.total),
        0
      );

    res.json({
      success: true,

      data: {
        purchases,

        totalPurchases,

        purchaseCount:
          purchases.length,
      },
    });
  } catch (error) {
    console.error(
      "getPurchaseReport error:",
      error
    );

    next(error);
  }
};

// =====================================================
// INVENTORY REPORT
// =====================================================

export const getInventoryReport = async (
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

    const stockValue =
      products.reduce(
        (sum, product) =>
          sum +
          Number(product.quantity || 0) *
            toNumber(product.costPrice),
        0
      );

    const totalStock = products.reduce(
      (sum, product) =>
        sum + Number(product.quantity || 0),
      0
    );

    const lowStock = products.filter(
      (product) =>
        product.quantity > 0 &&
        product.quantity <= product.minStock
    ).length;

    const outOfStock = products.filter(
      (product) =>
        product.quantity === 0
    ).length;

    res.json({
      success: true,

      data: {
        products,

        stockValue,

        totalProducts:
          products.length,

        totalStock,

        lowStock,

        outOfStock,
      },
    });
  } catch (error) {
    console.error(
      "getInventoryReport error:",
      error
    );

    next(error);
  }
};

// =====================================================
// PROFIT & LOSS REPORT
// =====================================================

export const getProfitLossReport = async (
  req,
  res,
  next
) => {
  try {
    const [
      sales,
      purchases,
    ] = await Promise.all([
      prisma.sale.findMany({
        where: {
          status: "COMPLETED",
        },

        select: {
          total: true,
        },
      }),

      prisma.purchaseOrder.findMany({
        where: {
          status: "RECEIVED",
        },

        select: {
          total: true,
        },
      }),
    ]);

    const totalSales =
      sales.reduce(
        (sum, sale) =>
          sum + toNumber(sale.total),
        0
      );

    const totalPurchases =
      purchases.reduce(
        (sum, purchase) =>
          sum + toNumber(purchase.total),
        0
      );

    const profit =
      totalSales - totalPurchases;

    res.json({
      success: true,

      data: {
        revenue: totalSales,

        expenses: totalPurchases,

        profit,
      },
    });
  } catch (error) {
    console.error(
      "getProfitLossReport error:",
      error
    );

    next(error);
  }
};