import API from "./axios";

// Comments (extends community posts)
// GET /api/community-ext/posts/:id/comments
export const getComments = (postId) =>
  API.get(`/community-ext/posts/${postId}/comments`);

// POST /api/community-ext/posts/:id/comments  { body }
export const addComment = (postId, body) =>
  API.post(`/community-ext/posts/${postId}/comments`, { body });

// Bookmarks
// GET /api/community-ext/bookmarks
export const getBookmarks = () => API.get("/community-ext/bookmarks");

// POST /api/community-ext/bookmarks/:type/:id
export const addBookmark = (type, id) =>
  API.post(`/community-ext/bookmarks/${type}/${id}`);

// DELETE /api/community-ext/bookmarks/:type/:id
export const removeBookmark = (type, id) =>
  API.delete(`/community-ext/bookmarks/${type}/${id}`);

// Follow
// POST /api/community-ext/follow/:userId
export const followUser = (userId) =>
  API.post(`/community-ext/follow/${userId}`);

// DELETE /api/community-ext/follow/:userId
export const unfollowUser = (userId) =>
  API.delete(`/community-ext/follow/${userId}`);

// GET /api/community-ext/followers/:userId
export const getFollowers = (userId) =>
  API.get(`/community-ext/followers/${userId}`);

// Q&A
// GET /api/community-ext/questions
export const getQuestions = (params = {}) =>
  API.get("/community-ext/questions", { params });

// POST /api/community-ext/questions
export const askQuestion = (payload) =>
  API.post("/community-ext/questions", payload);

// POST /api/community-ext/questions/:id/answers
export const answerQuestion = (qid, body) =>
  API.post(`/community-ext/questions/${qid}/answers`, { body });

// POST /api/community-ext/answers/:id/upvote
export const upvoteAnswer = (aid) =>
  API.post(`/community-ext/answers/${aid}/upvote`);

// Groups
// GET /api/community-ext/groups
export const getGroups = () => API.get("/community-ext/groups");

// POST /api/community-ext/groups
export const createGroup = (payload) =>
  API.post("/community-ext/groups", payload);

// POST /api/community-ext/groups/:id/join
export const joinGroup = (gid) =>
  API.post(`/community-ext/groups/${gid}/join`);

// GET /api/community-ext/leaderboard?type=points|posts|answers
export const getLeaderboard = (type = "points") =>
  API.get("/community-ext/leaderboard", { params: { type } });
