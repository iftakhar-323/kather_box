import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  listProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../api/reviews";
import { useToast } from "./Toast";

function Stars({ value, onPick, size = 28, readOnly = false }) {
  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onPick?.(n)}
          style={{
            background: "none",
            border: "none",
            cursor: readOnly ? "default" : "pointer",
            padding: 2,
            fontSize: size,
            lineHeight: 1,
            color: n <= value ? "#f1b73c" : "#cfd8c5",
          }}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function fmtDate(s) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return s;
  }
}

export default function ReviewsSection({ productId }) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ avg: 0, count: 0, histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    listProductReviews(productId)
      .then((res) => {
        const data = res.data || {};
        setReviews(data.reviews || []);
        setMeta({
          avg: Number(data.avg || 0),
          count: data.count || 0,
          histogram: data.histogram || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        if (user) {
          const mine = (data.reviews || []).find((r) => r.user_id === user.id);
          if (mine) {
            setMyReview(mine);
            setRating(mine.rating);
            setComment(mine.comment || "");
          } else {
            setMyReview(null);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, user?.id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      const ok = window.confirm("Please log in to write a review. Go to login?");
      if (ok) window.__katherboxSetView?.("login");
      return;
    }
    setSubmitting(true);
    try {
      if (editing && myReview) {
        await updateReview(myReview.id, { rating, comment });
        toast.ok("Review updated");
      } else {
        await createReview(productId, { rating, comment });
        toast.ok("Review posted");
      }
      setEditing(false);
      load();
    } catch (err) {
      toast.err(err?.response?.data?.error || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!myReview) return;
    if (!window.confirm("Delete your review?")) return;
    try {
      await deleteReview(myReview.id);
      toast.ok("Review deleted");
      setMyReview(null);
      setComment("");
      setRating(5);
      setEditing(false);
      load();
    } catch (err) {
      toast.err(err?.response?.data?.error || "Failed to delete");
    }
  };

  const total = Math.max(1, meta.count);

  return (
    <div className="card card-pad-lg mt-16" style={{ maxWidth: 960, margin: "16px auto 0" }}>
      <h2 style={{ marginTop: 0 }}>Customer reviews</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1fr) 2fr",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: "var(--leaf-700)" }}>
            {meta.avg ? meta.avg.toFixed(1) : "—"}
          </div>
          <Stars value={Math.round(meta.avg)} readOnly size={22} />
          <div className="muted" style={{ marginTop: 6 }}>
            {meta.count} review{meta.count === 1 ? "" : "s"}
          </div>
        </div>

        <div>
          {[5, 4, 3, 2, 1].map((n) => {
            const c = meta.histogram[n] || 0;
            const pct = (c / total) * 100;
            return (
              <div key={n} className="row" style={{ gap: 8, padding: "3px 0", alignItems: "center" }}>
                <span style={{ width: 28, fontSize: 13 }}>{n}★</span>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    background: "var(--leaf-50)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #f1b73c, #d2a56b)",
                    }}
                  />
                </div>
                <span className="muted" style={{ width: 28, textAlign: "right", fontSize: 13 }}>
                  {c}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write / edit form */}
      {user && (!myReview || editing) && (
        <form onSubmit={onSubmit} className="mt-16" style={{ borderTop: "1px solid var(--leaf-100)", paddingTop: 16 }}>
          <div className="row" style={{ alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 600 }}>Your rating:</span>
            <Stars value={rating} onPick={setRating} />
          </div>
          <textarea
            className="input mt-8"
            rows={3}
            placeholder="Share your experience with this plant…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ resize: "vertical" }}
          />
          <div className="row mt-8" style={{ gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editing ? "Update review" : "Post review"}
            </button>
            {editing && (
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {user && myReview && !editing && (
        <div
          className="row mt-16"
          style={{
            alignItems: "center",
            gap: 12,
            borderTop: "1px solid var(--leaf-100)",
            paddingTop: 16,
          }}
        >
          <span className="muted">You reviewed this:</span>
          <Stars value={myReview.rating} readOnly size={18} />
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>
            Delete
          </button>
        </div>
      )}

      {!user && (
        <p className="muted mt-16">
          <button
            type="button"
            className="btn btn-link"
            style={{ background: "none", border: "none", color: "var(--leaf-700)", cursor: "pointer", padding: 0 }}
            onClick={() => window.__katherboxSetView?.("login")}
          >
            Log in
          </button>{" "}
          to write a review.
        </p>
      )}

      {/* Reviews list */}
      <div className="mt-16" style={{ borderTop: "1px solid var(--leaf-100)", paddingTop: 16 }}>
        {loading ? (
          <div className="muted">Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div className="muted">No reviews yet — be the first!</div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              style={{ padding: "12px 0", borderBottom: "1px solid var(--leaf-100)" }}
            >
              <div className="row" style={{ alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 600 }}>{r.user_name || "Customer"}</span>
                <Stars value={r.rating} readOnly size={16} />
                <span className="muted" style={{ fontSize: 12 }}>
                  {fmtDate(r.created_at)}
                </span>
              </div>
              {r.comment && (
                <p style={{ margin: "6px 0 0", lineHeight: 1.55 }}>{r.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}