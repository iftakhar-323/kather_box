import API from "./axios";

// POST /api/subscriptions/
export const createSubscription = (data) => API.post("/subscriptions/", data);

// GET /api/subscriptions/
export const getMySubscriptions = () => API.get("/subscriptions/");

// POST /api/subscriptions/:id/cancel
export const cancelSubscription = (id) => API.post(`/subscriptions/${id}/cancel`);

// POST /api/subscriptions/:id/advance  — manual demo "deliver now" button
export const advanceSubscription = (id) => API.post(`/subscriptions/${id}/advance`);

// POST /api/subscriptions/:id/pause
export const pauseSubscription = (id) => API.post(`/subscriptions/${id}/pause`);

// POST /api/subscriptions/:id/resume
export const resumeSubscription = (id) => API.post(`/subscriptions/${id}/resume`);

// POST /api/subscriptions/:id/renew
export const renewSubscription = (id) => API.post(`/subscriptions/${id}/renew`);

// GET /api/subscriptions/:id/deliveries
export const listSubscriptionDeliveries = (id) =>
  API.get(`/subscriptions/${id}/deliveries`);
