import api from "./api";

export const getReportDashboard = async () => {
  const response = await api.get("/reports/dashboard");

  return response.data;
};

export const getSalesReport = async (params = {}) => {
  const response = await api.get("/reports/sales", {
    params,
  });

  return response.data;
};

export const getPurchaseReport = async (params = {}) => {
  const response = await api.get("/reports/purchases", {
    params,
  });

  return response.data;
};

export const getInventoryReport = async (params = {}) => {
  const response = await api.get("/reports/inventory", {
    params,
  });

  return response.data;
};

export const getProfitLossReport = async (params = {}) => {
  const response = await api.get("/reports/profit-loss", {
    params,
  });

  return response.data;
};