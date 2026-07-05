import API from "./axios";

// POST /api/coupons/apply  — body: { code, order_total }
export const applyCoupon = (code, order_total) =>
  API.post("/coupons/apply", { code, order_total });

// POST /api/admin/coupons  — admin only
export const createCoupon = (data) => API.post("/admin/coupons", data);