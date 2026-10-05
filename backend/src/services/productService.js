import prisma from "../config/prisma.js";

const toNumber = (value, defaultValue = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : defaultValue;
};

const parseId = (value, fieldName = "ID") => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return id;
};

const validateCategory = async (tx, categoryId) => {
  if (
    categoryId === null ||
    categoryId === undefined ||
    categoryId === ""
  ) {
    return null;
  }

  const id = parseId(categoryId, "category ID");

  const category = await tx.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    throw new Error("Selected category does not exist.");
  }

  return id;
};

export const getProducts = async ({
  search = "",
  categoryId,
  lowStock,
}) => {
  const where = {};

  const searchText = String(search || "").trim();

  if (searchText) {
    where.OR = [
      {
        name: {
          contains: searchText,
          mode: "insensitive",
        },
      },
      {
        sku: {
          contains: searchText,
          mode: "insensitive",
        },
      },
    ];
  }

  if (
    categoryId !== undefined &&
    categoryId !== null &&
    categoryId !== ""
  ) {
    where.categoryId = parseId(
      categoryId,
      "category ID"
    );
  }

  if (lowStock === "true") {
    where.quantity = {
      gt: 0,
    };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (lowStock === "true") {
    return products.filter(
      (product) =>
        product.quantity <= product.minStock
    );
  }

  return products;
};

export const getProductById = async (id) => {
  const productId = parseId(id, "product ID");

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      stockMovements: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
};

export const createProduct = async (data) => {
  const {
    name,
    sku,
    description,
    categoryId,
    quantity = 0,
    price,
    costPrice = 0,
    minStock = 5,
  } = data;

  if (!name || !String(name).trim()) {
    throw new Error("Product name is required.");
  }

  if (!sku || !String(sku).trim()) {
    throw new Error("SKU is required.");
  }

  const parsedQuantity = toNumber(quantity);
  const parsedPrice = toNumber(price);
  const parsedCostPrice = toNumber(costPrice);
  const parsedMinStock = toNumber(minStock, 5);

  if (
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity < 0
  ) {
    throw new Error(
      "Quantity must be a non-negative integer."
    );
  }

  if (parsedPrice < 0) {
    throw new Error(
      "Price cannot be negative."
    );
  }

  if (parsedCostPrice < 0) {
    throw new Error(
      "Cost price cannot be negative."
    );
  }

  if (
    !Number.isInteger(parsedMinStock) ||
    parsedMinStock < 0
  ) {
    throw new Error(
      "Minimum stock must be a non-negative integer."
    );
  }

  const product = await prisma.$transaction(
    async (tx) => {
      const validCategoryId =
        await validateCategory(
          tx,
          categoryId
        );

      const existingProduct =
        await tx.product.findUnique({
          where: {
            sku: String(sku).trim(),
          },
        });

      if (existingProduct) {
        throw new Error(
          "A product with this SKU already exists."
        );
      }

      const createdProduct =
        await tx.product.create({
          data: {
            name: String(name).trim(),
            sku: String(sku).trim(),
            description:
              description
                ? String(description).trim()
                : null,
            categoryId: validCategoryId,
            quantity: parsedQuantity,
            price: parsedPrice,
            costPrice: parsedCostPrice,
            minStock: parsedMinStock,
          },
          include: {
            category: true,
          },
        });

      if (parsedQuantity > 0) {
        await tx.stockMovement.create({
          data: {
            productId: createdProduct.id,
            type: "ADJUSTMENT",
            quantity: parsedQuantity,
            before: 0,
            after: parsedQuantity,
            note: "Initial stock",
          },
        });
      }

      return createdProduct;
    }
  );

  return product;
};

export const updateProduct = async (
  id,
  data
) => {
  const productId = parseId(
    id,
    "product ID"
  );

  const existingProduct =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  const {
    name,
    sku,
    description,
    categoryId,
    quantity,
    price,
    costPrice,
    minStock,
  } = data;

  const result = await prisma.$transaction(
    async (tx) => {
      let validCategoryId =
        existingProduct.categoryId;

      if (
        categoryId !== undefined
      ) {
        validCategoryId =
          await validateCategory(
            tx,
            categoryId
          );
      }

      if (
        sku !== undefined &&
        String(sku).trim() !== existingProduct.sku
      ) {
        const duplicate =
          await tx.product.findFirst({
            where: {
              sku: String(sku).trim(),
              NOT: {
                id: productId,
              },
            },
          });

        if (duplicate) {
          throw new Error(
            "A product with this SKU already exists."
          );
        }
      }

      const updateData = {};

      if (name !== undefined) {
        if (!String(name).trim()) {
          throw new Error(
            "Product name is required."
          );
        }

        updateData.name =
          String(name).trim();
      }

      if (sku !== undefined) {
        if (!String(sku).trim()) {
          throw new Error(
            "SKU is required."
          );
        }

        updateData.sku =
          String(sku).trim();
      }

      if (description !== undefined) {
        updateData.description =
          description
            ? String(description).trim()
            : null;
      }

      if (categoryId !== undefined) {
        updateData.categoryId =
          validCategoryId;
      }

      if (quantity !== undefined) {
        const newQuantity = toNumber(
          quantity
        );

        if (
          !Number.isInteger(newQuantity) ||
          newQuantity < 0
        ) {
          throw new Error(
            "Quantity must be a non-negative integer."
          );
        }

        updateData.quantity =
          newQuantity;
      }

      if (price !== undefined) {
        const newPrice =
          toNumber(price);

        if (newPrice < 0) {
          throw new Error(
            "Price cannot be negative."
          );
        }

        updateData.price =
          newPrice;
      }

      if (costPrice !== undefined) {
        const newCostPrice =
          toNumber(costPrice);

        if (newCostPrice < 0) {
          throw new Error(
            "Cost price cannot be negative."
          );
        }

        updateData.costPrice =
          newCostPrice;
      }

      if (minStock !== undefined) {
        const newMinStock =
          toNumber(minStock);

        if (
          !Number.isInteger(
            newMinStock
          ) ||
          newMinStock < 0
        ) {
          throw new Error(
            "Minimum stock must be a non-negative integer."
          );
        }

        updateData.minStock =
          newMinStock;
      }

      const updatedProduct =
        await tx.product.update({
          where: {
            id: productId,
          },
          data: updateData,
          include: {
            category: true,
          },
        });

      if (
        quantity !== undefined &&
        updatedProduct.quantity !==
          existingProduct.quantity
      ) {
        await tx.stockMovement.create({
          data: {
            productId,
            type: "ADJUSTMENT",
            quantity: Math.abs(
              updatedProduct.quantity -
                existingProduct.quantity
            ),
            before:
              existingProduct.quantity,
            after:
              updatedProduct.quantity,
            note: "Product quantity updated",
          },
        });
      }

      return updatedProduct;
    }
  );

  return result;
};

export const deleteProduct = async (id) => {
  const productId = parseId(
    id,
    "product ID"
  );

  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

  if (!product) {
    throw new Error("Product not found.");
  }

  const saleItems =
    await prisma.saleItem.count({
      where: {
        productId,
      },
    });

  if (saleItems > 0) {
    throw new Error(
      "Cannot delete a product that has sales history."
    );
  }

  const purchaseItems =
    await prisma.purchaseItem.count({
      where: {
        productId,
      },
    });

  if (purchaseItems > 0) {
    throw new Error(
      "Cannot delete a product that has purchase history."
    );
  }

  return prisma.product.delete({
    where: {
      id: productId,
    },
  });
};