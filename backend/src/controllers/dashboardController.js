import prisma from "../config/prisma.js";

const toNumber = (value) => Number(value || 0);

export const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      productCount,
      products,
      sales,
      purchases,
      outOfStockProducts,
    ] = await Promise.all([
      // Total products
      prisma.product.count(),

      // Product information
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

      // Completed sales
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

      // Received purchases
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

      // Out of stock
      prisma.product.count({
        where: {
          quantity: 0,
        },
      }),
    ]);

    // Total inventory quantity
    const totalStock = products.reduce(
      (sum, product) => sum + Number(product.quantity || 0),
      0
    );

    // Low stock:
    // quantity > 0 AND quantity <= minStock
    const lowStock = products.filter(
      (product) =>
        product.quantity > 0 &&
        product.quantity <= product.minStock
    ).length;

    // Total sales revenue
    const totalSales = sales.reduce(
      (sum, sale) => sum + toNumber(sale.total),
      0
    );

    // Total purchase value
    const totalPurchases = purchases.reduce(
      (sum, purchase) => sum + toNumber(purchase.total),
      0
    );

    const revenue = totalSales;

    /*
     * Estimated profit.
     *
     * For the current dashboard we calculate:
     * revenue - purchase value.
     *
     * This is an estimated figure because historical
     * product cost per sale is not stored in SaleItem.
     */
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