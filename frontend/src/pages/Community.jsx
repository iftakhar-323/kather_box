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
import { useTranslation } from "../i18n/I18nProvider";

const CATS = ["show-off", "tip", "question", "story"];

export default function Community() {
  const { t } = useTranslation();
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
    const same = expanded === p.id;
    setExpanded(same ? null : p.id);
    if (!same && !commentsByPost[p.id]) {
      listComments(p.id).then((r) => {
        setCommentsByPost((m) => ({ ...m, [p.id]: r.data || [] }));
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
    } catch (e) {
      /* ignore */
    }
  };

  const remove = async (postId) => {
    if (!window.confirm(t("community.feed.deleteConfirm"))) return;
    await deletePost(postId);
    reload();
  };

  const filtered = catFilter
    ? posts.filter((p) => p.category === catFilter)
    : posts;

  const catLabel = (slug) => {
    const key = "community.cats." + slug;
    return t(key) !== key ? t(key) : slug;
  };

  return (
    <div>
      <div
        className="row-between"
        style={{ alignItems: "flex-start", marginBottom: 16 }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>{t("community.feed.heading")}</h1>
          <p className="muted">{t("community.feed.subhead")}</p>
        </div>
        {user && (
          <button
            className="btn btn-primary"
            onClick={() => setShowNew((s) => !s)}
          >
            {showNew ? t("community.feed.close") : t("community.feed.newPostOpen")}
          </button>
        )}
      </div>

      {error && <div className="warning">{error}</div>}

      {showNew && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>{t("community.feed.newPostTitle")}</h3>
          <form className="auth-form" onSubmit={submitPost}>
            <div>
              <label className="field-label">
                {t("community.feed.fieldCategory")}
              </label>
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATS.map((c) => (
                  <option key={c} value={c}>
                    {catLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">
                {t("community.feed.fieldTitle")}
              </label>
              <input
                className="input"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">
                {t("community.feed.fieldBody")}
              </label>
              <textarea
                className="textarea"
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">
                {t("community.feed.fieldImage")}
              </label>
              <input
                className="input"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={t("community.feed.imagePlaceholder")}
              />
            </div>
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy ? t("community.feed.posting") : t("community.feed.post")}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          className={"btn btn-sm " + (!catFilter ? "btn-primary" : "btn-secondary")}
          onClick={() => setCatFilter("")}
        >
          {t("community.feed.all")}
        </button>
        {CATS.map((c) => (
          <button
            key={c}
            className={
              "btn btn-sm " + (catFilter === c ? "btn-primary" : "btn-secondary")
            }
            onClick={() => setCatFilter(c)}
          >
            {catLabel(c)}
          </button>
        ))}
      </div>

      {!user && (
        <div className="empty">
          <div className="emoji">🔒</div>
          <h3>{t("community.feed.loginToJoin")}</h3>
          <p>{t("community.feed.loginBody")}</p>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty">
          <div className="emoji">📭</div>
          <h3>{t("community.feed.noPostsHeading")}</h3>
          <p>{t("community.feed.noPostsBody")}</p>
        </div>
      )}

      {filtered.map((p) => {
        const isOpen = expanded === p.id;
        const comments = commentsByPost[p.id] || [];
        return (
          <div key={p.id} className="card" style={{ padding: 0, marginBottom: 12 }}>
            <div style={{ padding: 16 }}>
              <div className="row-between" style={{ alignItems: "flex-start" }}>
                <div
                  style={{ flex: 1, cursor: "pointer" }}
                  onClick={() => openPost(p)}
                >
                  <div
                    className="muted"
                    style={{ fontSize: 13, marginBottom: 4 }}
                  >
                    {catLabel(p.category)} {t("community.feed.by", {
                      name: p.author || t("community.feed.anonymous"),
                    })}{" "}
                    •{" "}
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{p.title}</div>
                </div>
                {(user?.id === p.user_id || user?.role === "admin") && (
                  <button
                    onClick={() => remove(p.id)}
                    className="btn btn-ghost btn-sm"
                  >
                    🗑
                  </button>
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
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              <div style={{ whiteSpace: "pre-wrap", marginBottom: 12 }}>
                {p.body}
              </div>
              <div className="row gap-12" style={{ alignItems: "center" }}>
                <button
                  className={
                    "btn btn-sm " +
                    (p.liked_by_me ? "btn-primary" : "btn-secondary")
                  }
                  onClick={() => like(p.id)}
                >
                  {p.liked_by_me ? "♥" : "♡"} {p.like_count}
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => openPost(p)}
                >
                  💬 {p.comment_count}{" "}
                  {isOpen
                    ? t("community.feed.commentsHide")
                    : t("community.feed.commentsOpen")}
                </button>
              </div>
            </div>

            {isOpen && (
              <div
                style={{
                  padding: "0 16px 16px",
                  borderTop: "1px solid var(--leaf-100)",
                }}
              >
                {comments.length === 0 && (
                  <p className="muted" style={{ marginTop: 12 }}>
                    {t("community.feed.noComments")}
                  </p>
                )}
                {comments.map((c) => (
                  <div key={c.id} style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {c.author || t("community.feed.anonymous")}
                    </div>
                    <div style={{ fontSize: 14 }}>{c.body}</div>
                  </div>
                ))}
                {user && (
                  <div className="row gap-8" style={{ marginTop: 12 }}>
                    <input
                      className="input"
                      style={{ flex: 1 }}
                      placeholder={t("community.feed.writeCommentPlaceholder")}
                      value={draftComments[p.id] || ""}
                      onChange={(e) =>
                        setDraftComments((d) => ({
                          ...d,
                          [p.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => submitComment(p.id)}
                    >
                      {t("community.feed.send")}
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