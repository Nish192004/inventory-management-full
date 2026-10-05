import api from "./api";

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data;
};

export const getSalesAnalytics = async (days = 30) => {
  const response = await api.get("/dashboard/sales", {
    params: { days },
  });

  return response.data;
};

export const getCategoryAnalytics = async () => {
  const response = await api.get("/dashboard/categories");
  return response.data;
};

export const getTopProducts = async () => {
  const response = await api.get("/dashboard/top-products");
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await api.get("/dashboard/recent-activity");
  return response.data;
};