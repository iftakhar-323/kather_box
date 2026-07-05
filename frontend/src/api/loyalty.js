import API from "./axios";

// GET /api/loyalty/me
export const getMyLoyalty = () => API.get("/loyalty/me");

// GET /api/loyalty/achievements
export const getAchievements = () => API.get("/loyalty/achievements");

// POST /api/loyalty/achievements/:id/claim
export const claimAchievement = (id) =>
  API.post(`/loyalty/achievements/${id}/claim`);

// GET /api/loyalty/rewards
export const getRewards = () => API.get("/loyalty/rewards");

// POST /api/loyalty/rewards/:id/redeem
export const redeemReward = (id) => API.post(`/loyalty/rewards/${id}/redeem`);

// GET /api/loyalty/referral
export const getReferralCode = () => API.get("/loyalty/referral");

// POST /api/loyalty/referral/apply
export const applyReferral = (code) =>
  API.post("/loyalty/referral/apply", { code });
