import API from "./axios";

// ===== Products CRUD =====
// admin can reuse the product routes since they're already mounted under auth+admin middleware

// GET /api/auth/me - refresh current user info (useful if role changed)
export const getMe = () => API.get("/auth/me");

// ===== Admin Orders =====
// GET /api/admin/orders - all orders across all users
export const getAllOrders = () => API.get("/admin/orders");

// PUT /api/admin/orders/:id/status
export const updateOrderStatus = (id, status) =>
  API.put(`/admin/orders/${id}/status`, { status });

// DELETE /api/admin/orders/:id
export const deleteOrder = (id) => API.delete(`/admin/orders/${id}`);

// GET /api/admin/analytics - dashboard stats (revenue, top products, etc.)
export const getAnalytics = () => API.get("/admin/analytics");

// GET /api/admin/users - list all users
export const getAllUsers = () => API.get("/admin/users");

// PUT /api/admin/users/:id/role  { role }
export const updateUserRole = (id, role) =>
  API.put(`/admin/users/${id}/role`, { role });

// ===== Admin reminders =====
// GET /api/admin/reminders - all pending reminders across users
export const adminListReminders = () => API.get("/admin/reminders");

// POST /api/admin/reminders/:id/complete
export const adminCompleteReminder = (id) =>
  API.post(`/admin/reminders/${id}/complete`);

// ===== Admin subscriptions =====
// GET /api/admin/subscriptions
export const adminListSubscriptions = () => API.get("/admin/subscriptions");

// POST /api/admin/subscriptions/:id/cancel
export const adminCancelSubscription = (id) =>
  API.post(`/admin/subscriptions/${id}/cancel`);

// ===== Admin consultations =====
// GET /api/admin/consultations
export const adminListConsultations = () => API.get("/admin/consultations");

// POST /api/admin/consultations/:id/cancel
export const adminCancelConsultation = (id) =>
  API.post(`/admin/consultations/${id}/cancel`);

// POST /api/admin/consultations/:id/confirm
export const adminConfirmConsultation = (id) =>
  API.post(`/admin/consultations/${id}/confirm`);

// ===== Admin corporate quotes =====
// GET /api/admin/corporate
export const adminListCorporate = () => API.get("/admin/corporate");

// PUT /api/admin/corporate/:id  { status, admin_notes }
export const adminUpdateCorporate = (id, data) =>
  API.put(`/admin/corporate/${id}`, data);