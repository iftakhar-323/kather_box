import API from "./axios";

// GET /api/csv/products/export   (returns CSV blob)
export const exportProductsCSV = async () => {
  const res = await API.get("/csv/products/export", { responseType: "blob" });
  return res.data;
};

// POST /api/csv/products/import  (multipart/form-data file)
export const importProductsCSV = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return API.post("/csv/products/import", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// GET /api/csv/orders/export
export const exportOrdersCSV = async () => {
  const res = await API.get("/csv/orders/export", { responseType: "blob" });
  return res.data;
};

// GET /api/csv/customers/export
export const exportCustomersCSV = async () => {
  const res = await API.get("/csv/customers/export", { responseType: "blob" });
  return res.data;
};
