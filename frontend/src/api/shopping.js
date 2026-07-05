import API from "./axios";

// Gift cards
// POST /api/shopping/gift-cards/redeem  { code }
export const redeemGiftCard = (code) =>
  API.post("/shopping/gift-cards/redeem", { code });

// GET /api/shopping/gift-cards/balance
export const getGiftCardBalance = () => API.get("/shopping/gift-cards/balance");

// POST /api/gift-cards   (admin)
export const createGiftCard = (payload) => API.post("/gift-cards", payload);

// GET /api/gift-cards    (admin)
export const listGiftCards = () => API.get("/gift-cards");

// Shipping rules
// GET /api/shopping/shipping-rules
export const getShippingRules = () => API.get("/shopping/shipping-rules");

// GET /api/shopping/shipping-cost?city=
export const calculateShipping = (city, weight) =>
  API.get("/shopping/shipping-cost", { params: { city, weight } });

// Tax rules
// GET /api/shopping/tax-rules
export const getTaxRules = () => API.get("/shopping/tax-rules");

// GET /api/shopping/tax?city=&subtotal=
export const calculateTax = (city, subtotal) =>
  API.get("/shopping/tax", { params: { city, subtotal } });

// Guest checkout
// POST /api/shopping/guest-checkout  { items, name, phone, address, ... }
export const placeGuestOrder = (payload) =>
  API.post("/shopping/guest-checkout", payload);

// GET /api/shopping/guest-orders?phone=
export const trackGuestOrder = (phone, code) =>
  API.get("/shopping/guest-orders", { params: { phone, code } });
