import API from "./axios";

// GET /api/consultations/experts - list of plant-care experts
export const listExperts = () => API.get("/consultations/experts");

// POST /api/consultations/ - book a session
export const bookConsultation = (data) => API.post("/consultations/", data);

// GET /api/consultations/ - my bookings
export const getMyConsultations = () => API.get("/consultations/");

// POST /api/consultations/:id/cancel
export const cancelConsultation = (id) => API.post(`/consultations/${id}/cancel`);