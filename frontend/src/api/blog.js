import API from "./axios";

// GET /api/blog?category=&search=&page=1
export const getBlogPosts = (params = {}) => API.get("/blog", { params });

// GET /api/blog/post/:slug
export const getBlogPost = (slug) => API.get(`/blog/post/${slug}`);

// POST /api/blog  (admin)
export const createBlogPost = (payload) => API.post("/blog", payload);

// PUT /api/blog/:id  (admin)
export const updateBlogPost = (id, payload) => API.put(`/blog/${id}`, payload);

// DELETE /api/blog/:id  (admin)
export const deleteBlogPost = (id) => API.delete(`/blog/${id}`);

// GET /api/blog/categories
export const getBlogCategories = () => API.get("/blog/categories");

// POST /api/blog/categories  (admin)
export const createBlogCategory = (payload) =>
  API.post("/blog/categories", payload);

// POST /api/blog/:id/comments
export const addBlogComment = (postId, payload) =>
  API.post(`/blog/${postId}/comments`, payload);
