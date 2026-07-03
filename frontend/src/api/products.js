import API from "./axios";

export const getProducts = () => API.get("/products/");
export const getProduct = (id) => API.get(`/products/${id}`);