import API from "./axios";

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// ===== Forgot / Reset =====
export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });

export const resetPassword = (token, new_password) =>
  API.post("/auth/reset-password", { token, new_password });

// ===== Email verification =====
export const sendVerification = () => API.post("/auth/send-verification");
export const verifyEmail = (token) => API.post("/auth/verify-email", { token });

// ===== Sprint A — profile / password / account =====
export const updateProfile = (data) => API.put("/auth/profile", data);
export const changePassword = (data) => API.put("/auth/change-password", data);
export const deleteAccount = (password) =>
  API.delete("/auth/account", { data: { password } });

// ===== Address book =====
export const listAddresses = () => API.get("/auth/addresses");
export const createAddress = (data) => API.post("/auth/addresses", data);
export const updateAddress = (id, data) => API.put(`/auth/addresses/${id}`, data);
export const deleteAddress = (id) => API.delete(`/auth/addresses/${id}`);
export const setDefaultAddress = (id) =>
  API.put(`/auth/addresses/${id}/default`);