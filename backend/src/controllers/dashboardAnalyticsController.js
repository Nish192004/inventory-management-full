import prisma from "../config/prisma.js";

const toNumber = (value) => Number(value || 0);

const getLastDays = (days) => {
  const dates = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    dates.push(date);
  }

  return dates;
};

/**
 * SALES ANALYTICS
 * GET /api/dashboard/sales?days=30
 */
export const getSalesAnalytics = async (req, res, next) => {
  try {
    const days = Math.max(Number(req.query.days || 7), 1);

    const startDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));

    const sales = await prisma.sale.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const dates = getLastDays(days);

    const result = dates.map((date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      const daySales = sales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);

        return (
          saleDate.getFullYear() === year &&
          saleDate.getMonth() === month &&
          saleDate.getDate() === day
        );
      });

      const revenue = daySales.reduce(
        (sum, sale) => sum + toNumber(sale.total),
        0
      );

      return {
        date: date.toISOString().split("T")[0],
        name: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        sales: daySales.length,
        revenue,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("getSalesAnalytics error:", error);
    next(error);
  }
};

/**
 * CATEGORY ANALYTICS
 * GET /api/dashboard/categories
 */
export const getCategoryAnalytics = async (req, res, next) => {
  try {
    // Only scalar fields from Product
    const products = await prisma.product.findMany({
      select: {
        id: true,
        categoryId: true,
      },
    });

    // Fetch categories separately
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const categoryMap = new Map(
      categories.map((category) => [category.id, category.name])
    );

    const categoryCounts = {};

    for (const product of products) {
      const categoryName = product.categoryId
        ? categoryMap.get(product.categoryId) || "Uncategorized"
        : "Uncategorized";

      categoryCounts[categoryName] =
        (categoryCounts[categoryName] || 0) + 1;
    }

    const result = Object.entries(categoryCounts).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("getCategoryAnalytics error:", error);
    next(error);
  }
};

/**
 * TOP PRODUCTS
 * GET /api/dashboard/top-products
 */
export const getTopProducts = async (req, res, next) => {
  try {
    // Get sale items without nested product relation
    const items = await prisma.saleItem.findMany({
      select: {
        productId: true,
        quantity: true,
        total: true,
      },
    });

    if (items.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get unique product IDs
    const productIds = [
      ...new Set(items.map((item) => item.productId)),
    ];

    // Fetch products separately
    const productsData = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
      },
    });

    const productMap = new Map(
      productsData.map((product) => [product.id, product])
    );

    const products = {};

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        continue;
      }

      const id = product.id;

      if (!products[id]) {
        products[id] = {
          id: product.id,
          name: product.name,
          sku: product.sku,
          quantity: 0,
          revenue: 0,
        };
      }

      products[id].quantity += item.quantity;
      products[id].revenue += toNumber(item.total);
    }

    const result = Object.values(products)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("getTopProducts error:", error);
    next(error);
  }
};

/**
 * RECENT ACTIVITY
 * GET /api/dashboard/recent-activity
 */
export const getRecentActivity = async (req, res, next) => {
  try {
    // Get movements without nested product relation
    const movements = await prisma.stockMovement.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        productId: true,
        type: true,
        quantity: true,
        before: true,
        after: true,
        note: true,
        createdAt: true,
      },
    });

    if (movements.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const productIds = [
      ...new Set(movements.map((movement) => movement.productId)),
    ];

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
      },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const result = movements.map((movement) => ({
      ...movement,
      product: productMap.get(movement.productId) || null,
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("getRecentActivity error:", error);
    next(error);
  }
};