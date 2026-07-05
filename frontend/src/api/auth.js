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