import api from "./api";

export const getInventory = async (params = {}) => {
  const response = await api.get("/inventory", {
    params,
  });

  return response.data;
};

export const getLowStock = async () => {
  const response = await api.get(
    "/inventory/low-stock"
  );

  return response.data;
};

export const getStockMovements = async (
  params = {}
) => {
  const response = await api.get(
    "/inventory/movements",
    { params }
  );

  return response.data;
};

export const adjustStock = async (data) => {
  const response = await api.post(
    "/inventory/adjust",
    data
  );

  return response.data;
};