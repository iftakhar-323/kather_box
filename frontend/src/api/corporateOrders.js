import API from "./axios";

// GET /api/corporate-orders (admin: all, user: own)
export const getCorporateOrders = (params = {}) =>
  API.get("/corporate-orders", { params });

// POST /api/corporate-orders
export const createCorporateOrder = (payload) =>
  API.post("/corporate-orders", payload);

// GET /api/corporate-orders/:id
export const getCorporateOrder = (id) =>
  API.get(`/corporate-orders/${id}`);

// PUT /api/corporate-orders/:id/status  (admin)
export const updateCorporateOrderStatus = (id, status) =>
  API.put(`/corporate-orders/${id}/status`, { status });

// POST /api/corporate-orders/:id/branding  (custom branding request)
export const requestBranding = (id, payload) =>
  API.post(`/corporate-orders/${id}/branding`, payload);
