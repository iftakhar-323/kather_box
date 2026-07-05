import API from "./axios";

export const getWishlist = () => API.get("/wishlist/");
export const addToWishlist = (productId) =>
  API.post("/wishlist/add", { product_id: productId });
export const removeFromWishlist = (id) => API.delete(`/wishlist/${id}`);