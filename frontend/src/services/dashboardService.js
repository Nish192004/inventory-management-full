import api from "./api";

// =====================================================
// DASHBOARD SUMMARY
// =====================================================

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data;
};


// =====================================================
// SALES ANALYTICS
// =====================================================

export const getSalesAnalytics = async (days = 30) => {
  const response = await api.get("/dashboard/sales", {
    params: {
      days,
    },
  });

  return response.data;
};


// =====================================================
// CATEGORY ANALYTICS
// =====================================================

export const getCategoryAnalytics = async () => {
  const response = await api.get("/dashboard/categories");
  return response.data;
};


// =====================================================
// TOP PRODUCTS
// =====================================================

export const getTopProducts = async () => {
  const response = await api.get("/dashboard/top-products");
  return response.data;
};


// =====================================================
// RECENT ACTIVITY
// =====================================================

export const getRecentActivity = async () => {
  const response = await api.get("/dashboard/recent-activity");
  return response.data;
};


// =====================================================
// READ-ONLY: PRODUCTS DETAILS
// =====================================================

export const getDashboardProducts = async () => {
  const response = await api.get("/dashboard/products");
  return response.data;
};


// =====================================================
// READ-ONLY: STOCK DETAILS
// =====================================================

export const getDashboardStock = async () => {
  const response = await api.get("/dashboard/stock");
  return response.data;
};


// =====================================================
// READ-ONLY: SALES DETAILS
// =====================================================

export const getDashboardSalesDetails = async () => {
  const response = await api.get("/dashboard/sales-details");
  return response.data;
};


// =====================================================
// READ-ONLY: REVENUE DETAILS
// =====================================================

export const getDashboardRevenueDetails = async () => {
  const response = await api.get("/dashboard/revenue-details");
  return response.data;
};