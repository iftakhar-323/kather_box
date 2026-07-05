import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  listPosts,
  createPost,
  listComments,
  addComment,
  toggleLike,
  deletePost,
} from "../api/community";

const CATS = [
  { v: "show-off", l: "🌿 Show off" },
  { v: "tip", l: "💡 Tip" },
  { v: "question", l: "❓ Question" },
  { v: "story", l: "📖 Story" },
];

const CAT_EMOJI = { "show-off": "🌿", tip: "💡", question: "❓", story: "📖" };

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("story");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [commentsByPost, setCommentsByPost] = useState({});
  const [draftComments, setDraftComments] = useState({});
  const [catFilter, setCatFilter] = useState("");

  const reload = () => {
    listPosts()
      .then((r) => setPosts(r.data || []))
      .catch(() => setPosts([]));
  };
  useEffect(reload, []);

  const submitPost = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createPost({ title, body, image_url: imageUrl, category });
      setTitle("");
      setBody("");
      setImageUrl("");
      setCategory("story");
      setShowNew(false);
      reload();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const openPost = (p) => {
    const same = expanded === p.ID;
    setExpanded(same ? null : p.ID);
    if (!same && !commentsByPost[p.ID]) {
      listComments(p.ID).then((r) => {
        setCommentsByPost((m) => ({ ...m, [p.ID]: r.data || [] }));
      });
    }
  };

  const submitComment = async (postId) => {
    const text = (draftComments[postId] || "").trim();
    if (!text) return;
    try {
      const res = await addComment(postId, text);
      setCommentsByPost((m) => ({
        ...m,
        [postId]: [...(m[postId] || []), res.data],
      }));
      setDraftComments((d) => ({ ...d, [postId]: "" }));
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  };

  const like = async (postId) => {
    try {
      await toggleLike(postId);
      reload();
    } catch (e) { /* ignore */ }
  };

  const remove = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    await deletePost(postId);
    reload();
  };

  const filtered = catFilter
    ? posts.filter((p) => p.category === catFilter)
    : posts;

  return (
    <div>
      <div className="row-between" style={{ alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Community 🌱</h1>
          <p className="muted">
            Share plant stories, tips and questions with other plant lovers.
          </p>
        </div>
        {user && (
          <button
            className="btn btn-primary"
            onClick={() => setShowNew((s) => !s)}
          >
            {showNew ? "Close" : "+ New post"}
          </button>
        )}
      </div>

      {error && <div className="warning">{error}</div>}

      {showNew && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>New post</h3>
          <form className="auth-form" onSubmit={submitPost}>
            <div>
              <label className="field-label">Category</label>
              <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATS.map((c) => (
                  <option key={c.v} value={c.v}>{c.l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Title</label>
              <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Body</label>
              <textarea className="textarea" required value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Image URL (optional)</label>
              <input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
            </div>
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy ? "Posting…" : "Post"}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          className={"btn btn-sm " + (!catFilter ? "btn-primary" : "btn-secondary")}
          onClick={() => setCatFilter("")}
        >All</button>
        {CATS.map((c) => (
          <button
            key={c.v}
            className={"btn btn-sm " + (catFilter === c.v ? "btn-primary" : "btn-secondary")}
            onClick={() => setCatFilter(c.v)}
          >{c.l}</button>
        ))}
      </div>

      {!user && (
        <div className="empty">
          <div className="emoji">🔒</div>
          <h3>Log in to join</h3>
          <p>Browsing is open to everyone. Log in to post, like and comment.</p>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty">
          <div className="emoji">📭</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something.</p>
        </div>
      )}

      {filtered.map((p) => {
        const isOpen = expanded === p.ID;
        const comments = commentsByPost[p.ID] || [];
        return (
          <div key={p.ID} className="card" style={{ padding: 0, marginBottom: 12 }}>
            <div style={{ padding: 16 }}>
              <div className="row-between" style={{ alignItems: "flex-start" }}>
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openPost(p)}>
                  <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                    {CAT_EMOJI[p.category] || "🌿"} {p.author || "anonymous"} •{" "}
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{p.title}</div>
                </div>
                {(user?.id === p.user_id || user?.role === "admin") && (
                  <button onClick={() => remove(p.ID)} className="btn btn-ghost btn-sm">🗑</button>
                )}
              </div>

              {p.image_url && (
                <img
                  src={p.image_url}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: 320,
                    objectFit: "cover",
                    borderRadius: 12,
                    margin: "12px 0",
                  }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}

              <div style={{ whiteSpace: "pre-wrap", marginBottom: 12 }}>{p.body}</div>

              <div className="row gap-12" style={{ alignItems: "center" }}>
                <button
                  className={"btn btn-sm " + (p.liked_by_me ? "btn-primary" : "btn-secondary")}
                  onClick={() => like(p.ID)}
                >
                  {p.liked_by_me ? "♥" : "♡"} {p.like_count}
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => openPost(p)}>
                  💬 {p.comment_count} {isOpen ? "hide" : "comments"}
                </button>
              </div>
            </div>

            {isOpen && (
              <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--leaf-100)" }}>
                {comments.length === 0 && (
                  <p className="muted" style={{ marginTop: 12 }}>No comments yet.</p>
                )}
                {comments.map((c) => (
                  <div key={c.ID} style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.author || "anonymous"}</div>
                    <div style={{ fontSize: 14 }}>{c.body}</div>
                  </div>
                ))}
                {user && (
                  <div className="row gap-8" style={{ marginTop: 12 }}>
                    <input
                      className="input"
                      style={{ flex: 1 }}
                      placeholder="Write a comment…"
                      value={draftComments[p.ID] || ""}
                      onChange={(e) =>
                        setDraftComments((d) => ({ ...d, [p.ID]: e.target.value }))
                      }
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => submitComment(p.ID)}>
                      Send
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}