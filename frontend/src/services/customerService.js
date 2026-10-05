import api from "./api";

// =====================================================
// GET ALL CUSTOMERS
// =====================================================

export const getCustomers = async (params = {}) => {
  const response = await api.get("/customers", {
    params,
  });

  return response.data;
};

// =====================================================
// GET CUSTOMER BY ID
// =====================================================

export const getCustomerById = async (id) => {
  if (!id) {
    throw new Error("Customer ID is required.");
  }

  const response = await api.get(`/customers/${id}`);

  return response.data;
};

// =====================================================
// CREATE CUSTOMER
// =====================================================

export const createCustomer = async (data) => {
  if (!data?.name?.trim()) {
    throw new Error("Customer name is required.");
  }

  const payload = {
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    address: data.address?.trim() || null,
  };

  const response = await api.post("/customers", payload);

  return response.data;
};

// =====================================================
// UPDATE CUSTOMER
// =====================================================

export const updateCustomer = async (id, data) => {
  if (!id) {
    throw new Error("Customer ID is required.");
  }

  if (!data?.name?.trim()) {
    throw new Error("Customer name is required.");
  }

  const payload = {
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    address: data.address?.trim() || null,
  };

  const response = await api.put(
    `/customers/${id}`,
    payload
  );

  return response.data;
};

// =====================================================
// DELETE CUSTOMER
// =====================================================

export const deleteCustomer = async (id) => {
  if (!id) {
    throw new Error("Customer ID is required.");
  }

  const response = await api.delete(
    `/customers/${id}`
  );

  return response.data;
};

// =====================================================
// SEARCH CUSTOMERS
// =====================================================

export const searchCustomers = async (search) => {
  const response = await api.get("/customers", {
    params: {
      search: search || "",
    },
  });

  return response.data;
};