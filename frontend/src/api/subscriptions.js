import API from "./axios";

// POST /api/subscriptions/
export const createSubscription = (data) => API.post("/subscriptions/", data);

// GET /api/subscriptions/
export const getMySubscriptions = () => API.get("/subscriptions/");

// POST /api/subscriptions/:id/cancel
export const cancelSubscription = (id) => API.post(`/subscriptions/${id}/cancel`);

// POST /api/subscriptions/:id/advance  — manual demo "deliver now" button
export const advanceSubscription = (id) => API.post(`/subscriptions/${id}/advance`);