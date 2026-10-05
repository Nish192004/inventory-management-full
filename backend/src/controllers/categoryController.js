import prisma from "../config/prisma.js";

export const getCategories = async (
  req,
  res,
  next
) => {
  try {
    const search = String(
      req.query.search || ""
    ).trim();

    const categories =
      await prisma.category.findMany({
        where: search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {},

        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },

        orderBy: {
          name: "asc",
        },
      });

    res.json({
      success: true,
      data: categories,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req,
  res,
  next
) => {
  try {
    const category =
      await prisma.category.findUnique({
        where: {
          id: Number(
            req.params.id
          ),
        },

        include: {
          products: true,
        },
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found.",
      });
    }

    res.json({
      success: true,
      data: category,
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req,
  res,
  next
) => {
  try {
    const { name } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Category name is required.",
      });
    }

    const category =
      await prisma.category.create({
        data: {
          name: String(name).trim(),
        },
      });

    res.status(201).json({
      success: true,
      message:
        "Category created successfully.",
      data: category,
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req,
  res,
  next
) => {
  try {
    const { name } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Category name is required.",
      });
    }

    const category =
      await prisma.category.update({
        where: {
          id: Number(
            req.params.id
          ),
        },

        data: {
          name: String(name).trim(),
        },
      });

    res.json({
      success: true,
      message:
        "Category updated successfully.",
      data: category,
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req,
  res,
  next
) => {
  try {
    const category =
      await prisma.category.findUnique({
        where: {
          id: Number(
            req.params.id
          ),
        },

        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found.",
      });
    }

    if (
      category._count.products > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Category cannot be deleted because products are using it.",
      });
    }

    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });

    res.json({
      success: true,
      message:
        "Category deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};