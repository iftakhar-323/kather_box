import API from "./axios";

// GET /api/seasonal-guide?month=   — optional month; returns full year otherwise
export const getSeasonalGuide = (month) =>
  API.get("/seasonal-guide/", { params: month ? { month } : {} });