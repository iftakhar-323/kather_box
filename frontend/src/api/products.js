import API from "./axios";

// GET /api/products/
export const getProducts = (params = {}) => API.get("/products/", { params });

// GET /api/products/:id
export const getProduct = (id) => API.get(`/products/${id}`);

// ===== Gift recommendations =====
// GET /api/gifts/recommend?budget=2000&occasion=birthday&indoor=indoor
// Returns up to 8 ranked products with score + reason.
export const getGiftRecommendations = (params = {}) =>
  API.get("/gifts/recommend", { params });