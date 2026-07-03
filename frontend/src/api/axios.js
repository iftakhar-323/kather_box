import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api",
});

// protected route call korar age token attach kore dibe
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;