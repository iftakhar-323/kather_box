import API from "./axios";

// POST /api/orders/checkout  — converts current cart into an order, clears cart
export const checkout = () => API.post("/orders/checkout");

// GET /api/orders/  — current user's order history
export const getMyOrders = () => API.get("/orders/");

// GET /api/orders/:id  — single order detail
export const getOrder = (id) => API.get(`/orders/${id}`);