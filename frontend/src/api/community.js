import API from "./axios";

// GET /api/community/posts
export const listPosts = () => API.get("/community/posts");

// POST /api/community/posts
export const createPost = (data) => API.post("/community/posts", data);

// GET /api/community/posts/:id/comments
export const listComments = (postId) => API.get(`/community/posts/${postId}/comments`);

// POST /api/community/posts/:id/comments
export const addComment = (postId, body) =>
  API.post(`/community/posts/${postId}/comments`, { body });

// POST /api/community/posts/:id/like   (toggle)
export const toggleLike = (postId) =>
  API.post(`/community/posts/${postId}/like`);

// DELETE /api/community/posts/:id
export const deletePost = (postId) =>
  API.delete(`/community/posts/${postId}`);