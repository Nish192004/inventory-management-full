import api from "./api";

export const getPurchases = async (params = {}) => {
  const response = await api.get("/purchases", {
    params,
  });

  return response.data;
};

export const getPurchaseById = async (id) => {
  const response = await api.get(`/purchases/${id}`);

  return response.data;
};

export const createPurchase = async (data) => {
  const response = await api.post("/purchases", data);

  return response.data;
};

export const receivePurchase = async (id) => {
  const response = await api.patch(
    `/purchases/${id}/receive`
  );

  return response.data;
};

export const cancelPurchase = async (id) => {
  const response = await api.patch(
    `/purchases/${id}/cancel`
  );

  return response.data;
};

export const deletePurchase = async (id) => {
  const response = await api.delete(
    `/purchases/${id}`
  );

  return response.data;
};