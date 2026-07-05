import API from "./axios";

// GET /api/cart/  — current user's cart (auto-created on backend if missing)
export const getCart = () => API.get("/cart/");

// POST /api/cart/add  — body: { product_id, quantity }
export const addToCart = (product_id, quantity = 1) =>
  API.post("/cart/add", { product_id, quantity });

// PUT /api/cart/item/:id  — body: { quantity }
export const updateCartItem = (itemId, quantity) =>
  API.put(`/cart/item/${itemId}`, { quantity });

// DELETE /api/cart/item/:id
export const removeCartItem = (itemId) => API.delete(`/cart/item/${itemId}`);