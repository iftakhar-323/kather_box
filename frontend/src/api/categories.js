import API from "./axios";

// GET /api/categories
export const listCategories = () => API.get("/categories");

// admin
export const adminCreateCategory = (payload) =>
  API.post("/admin/categories", payload);
export const adminUpdateCategory = (id, payload) =>
  API.put(`/admin/categories/${id}`, payload);
export const adminDeleteCategory = (id) =>
  API.delete(`/admin/categories/${id}`);