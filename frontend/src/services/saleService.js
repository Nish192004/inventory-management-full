import api from "./api";

export const getSales = async (params = {}) => {
  const response = await api.get("/sales", {
    params,
  });

  return response.data;
};

export const getSaleById = async (id) => {
  const response = await api.get(`/sales/${id}`);

  return response.data;
};

export const createSale = async (data) => {
  const response = await api.post(
    "/sales",
    data
  );

  return response.data;
};