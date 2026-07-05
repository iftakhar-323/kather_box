import API from "./axios";

// GET /api/backup/export   (JSON blob of all tables)
export const exportBackup = async () => {
  const res = await API.get("/backup/export", { responseType: "blob" });
  return res.data;
};

// POST /api/backup/import  (JSON file)
export const importBackup = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return API.post("/backup/import", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
