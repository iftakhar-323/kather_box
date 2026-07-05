import API from "./axios";

// Growth journal
// GET /api/care/journal
export const getJournal = () => API.get("/care/journal");

// POST /api/care/journal
export const addJournalEntry = (payload) => API.post("/care/journal", payload);

// DELETE /api/care/journal/:id
export const deleteJournalEntry = (id) =>
  API.delete(`/care/journal/${id}`);

// Care schedule
// GET /api/care/schedules
export const getSchedules = () => API.get("/care/schedules");

// POST /api/care/schedules
export const addSchedule = (payload) =>
  API.post("/care/schedules", payload);

// PUT /api/care/schedules/:id
export const updateSchedule = (id, payload) =>
  API.put(`/care/schedules/${id}`, payload);

// DELETE /api/care/schedules/:id
export const deleteSchedule = (id) =>
  API.delete(`/care/schedules/${id}`);

// Care calendar (computed from schedules)
// GET /api/care/calendar?month=YYYY-MM
export const getCareCalendar = (month) =>
  API.get("/care/calendar", { params: { month } });
