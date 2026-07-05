import API from "./axios";

// POST /api/corporate/
export const createCorporateQuote = (data) => API.post("/corporate/", data);

// GET /api/corporate/mine
export const getMyCorporateQuotes = () => API.get("/corporate/mine");

// ===== admin =====
// GET /api/admin/corporate
export const getAllCorporateQuotes = () => API.get("/admin/corporate");

// PUT /api/admin/corporate/:id
export const updateCorporateStatus = (id, data) =>
  API.put(`/admin/corporate/${id}`, data);