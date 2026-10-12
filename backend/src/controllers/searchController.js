import prisma from "../config/prisma.js";

// ======================================================
// GLOBAL SEARCH
// GET /api/search?q=mouse
// ======================================================

export const globalSearch = async (req, res, next) => {
  try {
    const query = req.query.q?.trim();

    // Validate search input
    if (!query) {
      return res.status(200).json({
        success: true,
        results: {
          products: [],
          categories: [],
          suppliers: [],
          customers: [],
        },
      });
    }

    const searchTerm = query.slice(0, 100);

    // Search across available inventory modules
    const [
      products,
      categories,
      suppliers,
      customers,
    ] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              sku: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
        take: 5,
      }),

      prisma.category.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        take: 5,
      }),

      prisma.supplier.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        take: 5,
      }),

      prisma.customer.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        take: 5,
      }),
    ]);

    return res.status(200).json({
      success: true,
      results: {
        products,
        categories,
        suppliers,
        customers,
      },
    });
  } catch (error) {
    next(error);
  }
};