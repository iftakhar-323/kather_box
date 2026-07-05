import API from "./axios";

export const getNotifications = () => API.get("/notifications/");
export const markNotificationsRead = () => API.post("/notifications/mark-read");

// ===== Care Reminders =====
// GET /api/reminders/ - upcoming watering / fertilizer / repotting reminders
export const getReminders = () => API.get("/reminders/");

// POST /api/reminders/:id/complete - mark done and schedule the next one
export const completeReminder = (id) => API.post(`/reminders/${id}/complete`);