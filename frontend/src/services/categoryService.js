import api from "./api";

// =====================================================
// GET ALL CATEGORIES
// =====================================================

export const getCategories = async (params = {}) => {
  const response = await api.get("/categories", {
    params,
  });

  return response.data;
};

// =====================================================
// GET CATEGORY BY ID
// =====================================================

export const getCategoryById = async (id) => {
  if (!id) {
    throw new Error("Category ID is required.");
  }

  const response = await api.get(`/categories/${id}`);

  return response.data;
};

// =====================================================
// CREATE CATEGORY
// =====================================================

export const createCategory = async (data) => {
  if (!data?.name?.trim()) {
    throw new Error("Category name is required.");
  }

  const payload = {
    name: data.name.trim(),
  };

  const response = await api.post(
    "/categories",
    payload
  );

  return response.data;
};

// =====================================================
// UPDATE CATEGORY
// =====================================================

export const updateCategory = async (id, data) => {
  if (!id) {
    throw new Error("Category ID is required.");
  }

  if (!data?.name?.trim()) {
    throw new Error("Category name is required.");
  }

  const payload = {
    name: data.name.trim(),
  };

  const response = await api.put(
    `/categories/${id}`,
    payload
  );

  return response.data;
};

// =====================================================
// DELETE CATEGORY
// =====================================================

export const deleteCategory = async (id) => {
  if (!id) {
    throw new Error("Category ID is required.");
  }

  const response = await api.delete(
    `/categories/${id}`
  );

  return response.data;
};