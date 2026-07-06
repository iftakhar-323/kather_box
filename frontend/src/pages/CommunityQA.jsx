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
import { useTranslation } from "../i18n/I18nProvider";

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
  const { t } = useTranslation();
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
          .map((x) => x.trim())
          .filter(Boolean),
      });
      toast.ok(t("community.qa.questionPosted"));
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
      toast.ok(t("community.qa.answerPosted"));
      setABody("");
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
      <h1 style={{ marginBottom: 8 }}>{t("community.qa.heading")}</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        {t("community.qa.subhead")}
      </p>

      <div className="row gap-8" style={{ marginBottom: 16 }}>
        <button
          className={"btn btn-sm " + (tab === "qa" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("qa")}
        >
          {t("community.qa.tabQuestions")}
        </button>
        <button
          className={"btn btn-sm " + (tab === "leaderboard" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("leaderboard")}
        >
          {t("community.qa.tabLeaderboard")}
        </button>
        {user && tab === "qa" && (
          <>
            <span className="spacer" />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setAskOpen((s) => !s)}
            >
              {askOpen ? t("community.qa.cancel") : t("community.qa.askOpen")}
            </button>
          </>
        )}
      </div>

      {askOpen && (
        <form onSubmit={onAsk} className="card card-pad-lg mb-16">
          <h3 style={{ marginTop: 0 }}>{t("community.qa.askTitle")}</h3>
          <input
            className="input"
            placeholder={t("community.qa.titlePlaceholder")}
            value={qTitle}
            onChange={(e) => setQTitle(e.target.value)}
            required
          />
          <textarea
            className="input mt-8"
            rows={4}
            placeholder={t("community.qa.bodyPlaceholder")}
            value={qBody}
            onChange={(e) => setQBody(e.target.value)}
            style={{ resize: "vertical" }}
          />
          <div className="row mt-8" style={{ gap: 8 }}>
            <input
              className="input"
              placeholder={t("community.qa.productIdPlaceholder")}
              value={qProductId}
              onChange={(e) => setQProductId(e.target.value)}
              style={{ width: 200 }}
              type="number"
            />
            <input
              className="input"
              placeholder={t("community.qa.tagsPlaceholder")}
              value={qTags}
              onChange={(e) => setQTags(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <button className="btn btn-primary mt-8" type="submit">
            {t("community.qa.submitQuestion")}
          </button>
        </form>
      )}

      {tab === "qa" && (
        <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
          <div style={{ flex: 2, minWidth: 0 }}>
            {loading ? (
              <div className="empty">
                <div className="emoji">⏳</div>
                <h3>{t("community.qa.loading")}</h3>
              </div>
            ) : questions.length === 0 ? (
              <div className="empty">
                <div className="emoji">💭</div>
                <h3>{t("community.qa.noQuestionsHeading")}</h3>
                <p className="muted">{t("community.qa.noQuestionsBody")}</p>
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
                    <div
                      className="row muted"
                      style={{ fontSize: 12, marginTop: 6, gap: 8 }}
                    >
                      <span>
                        {t("community.qa.by", {
                          name: q.author_name || t("community.qa.anonymous"),
                        })}
                      </span>
                      <span>·</span>
                      <span>{fmtDate(q.created_at)}</span>
                      {q.product_id && (
                        <>
                          <span>·</span>
                          <span>
                            {t("community.qa.productRef", {
                              id: q.product_id,
                            })}
                          </span>
                        </>
                      )}
                      {q.status && q.status !== "open" && (
                        <span className="tag tag-success">{q.status}</span>
                      )}
                    </div>
                    {(q.tags || []).length > 0 && (
                      <div
                        className="row gap-4 mt-8"
                        style={{ flexWrap: "wrap" }}
                      >
                        {q.tags.map((tg) => (
                          <span key={tg} className="tag">#{tg}</span>
                        ))}
                      </div>
                    )}
                    <div
                      className="muted"
                      style={{ fontSize: 13, marginTop: 8 }}
                    >
                      {(q.answer_count || 0) === 1
                        ? t("community.qa.answerCount", {
                            count: q.answer_count || 0,
                          })
                        : t("community.qa.answerCountPlural", {
                            count: q.answer_count || 0,
                          })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            {activeQ ? (
              <div
                className="card card-pad-lg"
                style={{ position: "sticky", top: 16 }}
              >
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setActiveQ(null)}
                >
                  {t("community.qa.backToList")}
                </button>
                <h3 style={{ margin: "8px 0" }}>{activeQ.title}</h3>
                {activeQ.body && (
                  <p style={{ whiteSpace: "pre-wrap" }}>{activeQ.body}</p>
                )}
                <h4 style={{ marginTop: 16 }}>
                  {t("community.qa.answersHeading", {
                    count: (activeQ.answers || []).length,
                  })}
                </h4>
                {(activeQ.answers || []).length === 0 && (
                  <p className="muted">{t("community.qa.noAnswers")}</p>
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
                        {t("community.qa.answerAuthor", {
                          name: a.author_name || t("community.qa.anonymous"),
                        })}{" "}
                        · {fmtDate(a.created_at)}
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
                      placeholder={t("community.qa.answerPlaceholder")}
                      value={aBody}
                      onChange={(e) => setABody(e.target.value)}
                      style={{ resize: "vertical" }}
                    />
                    <button
                      className="btn btn-primary btn-sm mt-8"
                      disabled={!aBody.trim()}
                    >
                      {t("community.qa.postAnswer")}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="card card-pad-lg muted">
                <h4 style={{ marginTop: 0 }}>
                  {t("community.qa.topHelpersTitle")}
                </h4>
                {(leaderboard || []).slice(0, 5).map((u, i) => (
                  <div
                    key={u.user_id || i}
                    className="row"
                    style={{ padding: "6px 0" }}
                  >
                    <span style={{ width: 24, fontWeight: 700 }}>#{i + 1}</span>
                    <span style={{ flex: 1 }}>
                      {u.name || t("community.qa.anonymous")}
                    </span>
                    <strong>
                      {t("community.qa.pts", { n: u.points || 0 })}
                    </strong>
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
                <th style={{ width: 60 }}>{t("community.qa.rank")}</th>
                <th>{t("community.qa.helper")}</th>
                <th>{t("community.qa.points")}</th>
                <th>{t("community.qa.answers")}</th>
              </tr>
            </thead>
            <tbody>
              {(leaderboard || []).map((u, i) => (
                <tr key={u.user_id || i}>
                  <td>
                    <strong
                      style={{ color: i < 3 ? "var(--leaf-700)" : undefined }}
                    >
                      #{i + 1}
                    </strong>
                  </td>
                  <td>{u.name || t("community.qa.anonymous")}</td>
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
