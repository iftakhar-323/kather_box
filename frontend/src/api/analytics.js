import API from "./axios";

// GET /api/analytics/summary?days=30
export const getAnalyticsSummary = (days = 30) =>
  API.get("/analytics/summary", { params: { days } });

// GET /api/analytics/top-customers?limit=10
export const getTopCustomers = (limit = 10) =>
  API.get("/analytics/top-customers", { params: { limit } });

// GET /api/analytics/inventory
export const getInventoryReport = () => API.get("/analytics/inventory");

// GET /api/analytics/traffic?days=30
export const getTrafficReport = (days = 30) =>
  API.get("/analytics/traffic", { params: { days } });

// GET /api/analytics/categories
export const getCategoryRevenue = () => API.get("/analytics/categories");
