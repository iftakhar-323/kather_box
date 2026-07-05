import API from "./axios";

// Order timeline events
// GET /api/orders/:id/events
export const getOrderTimeline = (id) => API.get(`/orders/${id}/events`);

// Add a manual timeline event (admin)
// POST /api/orders/:id/events/admin
export const addOrderEvent = (id, payload) =>
  API.post(`/orders/${id}/events/admin`, payload);

// Estimated delivery
// GET /api/orders/:id/estimated-delivery
export const getEstimatedDelivery = (id) =>
  API.get(`/orders/${id}/estimated-delivery`);

// Return / Refund / Exchange requests
// POST /api/returns
export const requestReturn = (orderId, payload) =>
  API.post(`/returns`, { ...payload, order_id: orderId, type: "return" });
export const requestRefund = (orderId, payload) =>
  API.post(`/returns`, { ...payload, order_id: orderId, type: "refund" });
export const requestExchange = (orderId, payload) =>
  API.post(`/returns`, { ...payload, order_id: orderId, type: "exchange" });

// GET /api/returns  (admin: all, user: own)
export const getReturns = (params = {}) =>
  API.get("/returns", { params });

// PATCH /api/returns/:id  (admin)
export const updateReturnStatus = (id, payload) =>
  API.patch(`/returns/${id}`, payload);

// Invoice HTML (browser-printable, opens in new tab)
// GET /api/orders/:id/invoice
export const openInvoice = (id) => {
  const token = localStorage.getItem("kb_token");
  // open with the same auth header (can't easily pass headers; user clicks print)
  const url = `/api/orders/${id}/invoice`;
  // Use a fetch to download and open in a new window with the HTML
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.text())
    .then((html) => {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
      }
      return true;
    });
};

// GET /api/orders/:id/receipt
export const openReceipt = (id) => {
  const token = localStorage.getItem("kb_token");
  const url = `/api/orders/${id}/receipt`;
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.text())
    .then((html) => {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
      }
      return true;
    });
};

// Stub the legacy PDF-named exports so old imports keep working (returns HTML text)
export const getInvoicePDF = async (id) => {
  const token = localStorage.getItem("kb_token");
  const r = await fetch(`/api/orders/${id}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.text();
};
export const getReceiptPDF = async (id) => {
  const token = localStorage.getItem("kb_token");
  const r = await fetch(`/api/orders/${id}/receipt`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.text();
};
