import { useEffect, useState } from "react";
import {
  getQuestions,
  askQuestion,
  answerQuestion,
  upvoteAnswer,
  getLeaderboard,
} from "../api/communityExt";
// names above match the actual API module
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

function fmtDate(s) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export default function CommunityQA() {
  const { user } = useAuth();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("qa");
  const [askOpen, setAskOpen] = useState(false);
  const [qTitle, setQTitle] = useState("");
  const [qBody, setQBody] = useState("");
  const [qProductId, setQProductId] = useState("");
  const [qTags, setQTags] = useState("");
  const [activeQ, setActiveQ] = useState(null);
  const [aBody, setABody] = useState("");

  const loadAll = () => {
    setLoading(true);
    Promise.all([getQuestions(), getLeaderboard("points")])
      .then(([q, l]) => {
        // backend returns {questions, total} or {items}
        const qs = q.data?.questions || q.data?.items || [];
        setQuestions(qs);
        setLeaderboard(l.data?.leaderboard || l.data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onAsk = async (e) => {
    e.preventDefault();
    if (!qTitle.trim()) return;
    try {
      await askQuestion({
        title: qTitle.trim(),
        body: qBody.trim(),
        product_id: qProductId ? Number(qProductId) : null,
        tags: qTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.ok("Question posted");
      setQTitle("");
      setQBody("");
      setQProductId("");
      setQTags("");
      setAskOpen(false);
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onAnswer = async (e) => {
    e.preventDefault();
    if (!aBody.trim() || !activeQ) return;
    try {
      await answerQuestion(activeQ.id, aBody.trim());
      toast.ok("Answer posted");
      setABody("");
      // refresh active question
      const r = await getQuestions();
      const updated = (r.data?.questions || r.data?.items || []).find(
        (q) => q.id === activeQ.id
      );
      if (updated) setActiveQ(updated);
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onUpvote = async (aid) => {
    try {
      await upvoteAnswer(aid);
      const r = await getQuestions();
      const updated = (r.data?.questions || r.data?.items || []).find(
        (q) => q.id === activeQ.id
      );
      if (updated) setActiveQ(updated);
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>💡 Community Q&A & Leaderboard</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Ask anything about plant care — answer others to climb the leaderboard
        and earn Green Points.
      </p>

      <div className="row gap-8" style={{ marginBottom: 16 }}>
        <button
          className={"btn btn-sm " + (tab === "qa" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("qa")}
        >
          💡 Questions
        </button>
        <button
          className={"btn btn-sm " + (tab === "leaderboard" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("leaderboard")}
        >
          🏆 Leaderboard
        </button>
        {user && tab === "qa" && (
          <>
            <span className="spacer" />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setAskOpen((s) => !s)}
            >
              {askOpen ? "Cancel" : "➕ Ask a question"}
            </button>
          </>
        )}
      </div>

      {askOpen && (
        <form onSubmit={onAsk} className="card card-pad-lg mb-16">
          <h3 style={{ marginTop: 0 }}>New question</h3>
          <input
            className="input"
            placeholder="Title — e.g. Why are my fiddle-leaf fig leaves yellow?"
            value={qTitle}
            onChange={(e) => setQTitle(e.target.value)}
            required
          />
          <textarea
            className="input mt-8"
            rows={4}
            placeholder="Add details, watering schedule, light conditions…"
            value={qBody}
            onChange={(e) => setQBody(e.target.value)}
            style={{ resize: "vertical" }}
          />
          <div className="row mt-8" style={{ gap: 8 }}>
            <input
              className="input"
              placeholder="Related product ID (optional)"
              value={qProductId}
              onChange={(e) => setQProductId(e.target.value)}
              style={{ width: 200 }}
              type="number"
            />
            <input
              className="input"
              placeholder="Tags (comma-separated)"
              value={qTags}
              onChange={(e) => setQTags(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <button className="btn btn-primary mt-8" type="submit">
            Post question
          </button>
        </form>
      )}

      {tab === "qa" && (
        <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
          <div style={{ flex: 2, minWidth: 0 }}>
            {loading ? (
              <div className="empty">
                <div className="emoji">⏳</div>
                <h3>Loading…</h3>
              </div>
            ) : questions.length === 0 ? (
              <div className="empty">
                <div className="emoji">💭</div>
                <h3>No questions yet</h3>
                <p className="muted">Be the first to ask!</p>
              </div>
            ) : (
              <div>
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="card card-pad"
                    style={{ marginBottom: 8, cursor: "pointer" }}
                    onClick={() => setActiveQ(q)}
                  >
                    <h4 style={{ margin: 0 }}>{q.title}</h4>
                    <div className="row muted" style={{ fontSize: 12, marginTop: 6, gap: 8 }}>
                      <span>by {q.author_name || "Anonymous"}</span>
                      <span>·</span>
                      <span>{fmtDate(q.created_at)}</span>
                      {q.product_id && (
                        <>
                          <span>·</span>
                          <span>📦 product #{q.product_id}</span>
                        </>
                      )}
                      {q.status && q.status !== "open" && (
                        <span className="tag tag-success">{q.status}</span>
                      )}
                    </div>
                    {(q.tags || []).length > 0 && (
                      <div className="row gap-4 mt-8" style={{ flexWrap: "wrap" }}>
                        {q.tags.map((t) => (
                          <span key={t} className="tag">#{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                      {(q.answer_count || 0)} answer
                      {(q.answer_count || 0) === 1 ? "" : "s"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            {activeQ ? (
              <div className="card card-pad-lg" style={{ position: "sticky", top: 16 }}>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setActiveQ(null)}
                >
                  ← Back to list
                </button>
                <h3 style={{ margin: "8px 0" }}>{activeQ.title}</h3>
                {activeQ.body && (
                  <p style={{ whiteSpace: "pre-wrap" }}>{activeQ.body}</p>
                )}
                <h4 style={{ marginTop: 16 }}>
                  Answers ({(activeQ.answers || []).length})
                </h4>
                {(activeQ.answers || []).length === 0 && (
                  <p className="muted">No answers yet — be the first.</p>
                )}
                {(activeQ.answers || []).map((a) => (
                  <div
                    key={a.id}
                    className="card card-pad"
                    style={{ marginBottom: 8, padding: 12 }}
                  >
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{a.body}</p>
                    <div className="row mt-8" style={{ fontSize: 12 }}>
                      <span className="muted">
                        by {a.author_name || "Anonymous"} · {fmtDate(a.created_at)}
                      </span>
                      <span className="spacer" />
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => onUpvote(a.id)}
                      >
                        ▲ {a.upvotes || 0}
                      </button>
                    </div>
                  </div>
                ))}
                {user && (
                  <form onSubmit={onAnswer} className="mt-8">
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Your answer…"
                      value={aBody}
                      onChange={(e) => setABody(e.target.value)}
                      style={{ resize: "vertical" }}
                    />
                    <button
                      className="btn btn-primary btn-sm mt-8"
                      disabled={!aBody.trim()}
                    >
                      Post answer
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="card card-pad-lg muted">
                <h4 style={{ marginTop: 0 }}>🏆 Top helpers this week</h4>
                {(leaderboard || []).slice(0, 5).map((u, i) => (
                  <div key={u.user_id || i} className="row" style={{ padding: "6px 0" }}>
                    <span style={{ width: 24, fontWeight: 700 }}>#{i + 1}</span>
                    <span style={{ flex: 1 }}>{u.name || "Anonymous"}</span>
                    <strong>{u.points || 0} pts</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "leaderboard" && (
        <div
          className="card"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <table className="table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>Helper</th>
                <th>Points</th>
                <th>Answers</th>
              </tr>
            </thead>
            <tbody>
              {(leaderboard || []).map((u, i) => (
                <tr key={u.user_id || i}>
                  <td>
                    <strong style={{ color: i < 3 ? "var(--leaf-700)" : undefined }}>
                      #{i + 1}
                    </strong>
                  </td>
                  <td>{u.name || "Anonymous"}</td>
                  <td>{u.points || 0}</td>
                  <td>{u.answer_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
