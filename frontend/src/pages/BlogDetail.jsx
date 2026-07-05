import { useEffect, useState } from "react";
import { getBlogPost, addBlogComment } from "../api/blog";
// real names used
import { useToast } from "../components/Toast";

function fmtDate(s) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function BlogDetail({ slug, onBack }) {
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    getBlogPost(slug)
      .then((r) => {
        setPost(r.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e?.response?.data?.error || e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [slug]);

  const onSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setBusy(true);
    try {
      await addBlogComment(post.id, { body: commentBody.trim() });
      toast.ok("Comment posted");
      setCommentBody("");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || "Failed to post");
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <div className="empty">
        <div className="emoji">⏳</div>
        <h3>Loading article…</h3>
      </div>
    );
  if (error)
    return (
      <div className="empty">
        <div className="emoji">😕</div>
        <h3>{error}</h3>
        <button className="btn btn-secondary mt-16" onClick={onBack}>
          ← Back to blog
        </button>
      </div>
    );
  if (!post) return null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <button onClick={onBack} className="btn btn-ghost mb-16">
        ← Back to blog
      </button>

      {post.category_name && (
        <span className="tag tag-leaf">{post.category_name}</span>
      )}
      <h1 style={{ marginTop: 8 }}>{post.title}</h1>
      <div className="row muted" style={{ gap: 8, margin: "8px 0 24px" }}>
        <span>{fmtDate(post.published_at || post.created_at)}</span>
        <span>·</span>
        <span>{post.read_min || 3} min read</span>
        {post.author_name && (
          <>
            <span>·</span>
            <span>by {post.author_name}</span>
          </>
        )}
      </div>

      {post.cover_emoji && (
        <div
          style={{
            fontSize: 96,
            textAlign: "center",
            background:
              "linear-gradient(135deg, var(--leaf-100), var(--leaf-50))",
            borderRadius: "var(--radius-lg)",
            padding: 24,
            marginBottom: 24,
          }}
        >
          {post.cover_emoji}
        </div>
      )}

      <article
        className="card card-pad-lg"
        style={{ lineHeight: 1.75, whiteSpace: "pre-wrap" }}
      >
        {post.body || post.excerpt}
      </article>

      <section className="mt-24">
        <h2>💬 Comments ({(post.comments || []).length})</h2>

        <form onSubmit={onSubmitComment} className="card card-pad mt-16">
          <textarea
            className="input"
            rows={3}
            placeholder="Share your thoughts…"
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            style={{ resize: "vertical" }}
          />
          <div className="row mt-8">
            <span className="spacer" />
            <button
              className="btn btn-primary"
              disabled={busy || !commentBody.trim()}
            >
              {busy ? "Posting…" : "Post comment"}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 16 }}>
          {(post.comments || []).length === 0 && (
            <p className="muted">Be the first to comment.</p>
          )}
          {(post.comments || []).map((c) => (
            <div key={c.id} className="card card-pad" style={{ marginBottom: 8 }}>
              <div className="row" style={{ fontSize: 13 }}>
                <strong>{c.author_name || "Anonymous"}</strong>
                <span className="spacer" />
                <span className="muted">{fmtDate(c.created_at)}</span>
              </div>
              <p style={{ margin: "8px 0 0" }}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
