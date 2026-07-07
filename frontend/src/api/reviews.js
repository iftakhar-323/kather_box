import API from "./axios";

// GET /api/products/:id/reviews
export const listProductReviews = (productId, page = 1, limit = 20) =>
  API.get(`/products/${productId}/reviews`, { params: { page, limit } });

// POST /api/products/:id/reviews   (auth)
export const createReview = (productId, payload) =>
  API.post(`/products/${productId}/reviews`, payload);

// PUT /api/reviews/:id   (auth)
export const updateReview = (reviewId, payload) =>
  API.put(`/reviews/${reviewId}`, payload);

// DELETE /api/reviews/:id   (auth)
export const deleteReview = (reviewId) =>
  API.delete(`/reviews/${reviewId}`);

// GET /api/reviews/mine   (auth)
export const myReviews = () => API.get("/reviews/mine");
