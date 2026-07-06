import { useEffect, useState } from "react";
import {
  getJournal,
  addJournalEntry,
  deleteJournalEntry,
  getSchedules,
  addSchedule,
  deleteSchedule,
  getCareCalendar,
} from "../api/care";
import { useToast } from "../components/Toast";
import { useTranslation } from "../i18n/I18nProvider";

function fmtDate(s) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const TASK_VALUES = ["water", "fertilize", "repot", "prune", "mist", "rotate"];

export default function Care() {
  const { t } = useTranslation();
  const toast = useToast();
  const [tab, setTab] = useState("dashboard");
  const [journal, setJournal] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [loading, setLoading] = useState(true);

  // journal form
  const [jProduct, setJProduct] = useState("");
  const [jNote, setJNote] = useState("");
  const [jPhoto, setJPhoto] = useState("🌿");
  const [jHeight, setJHeight] = useState("");

  // schedule form
  const [sProduct, setSProduct] = useState("");
  const [sType, setSType] = useState("water");
  const [sEvery, setSEvery] = useState(7);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      getJournal(),
      getSchedules(),
      getCareCalendar(month),
    ])
      .then(([j, s, c]) => {
        setJournal(j.data?.journal || j.data?.items || []);
        setSchedules(s.data?.schedules || s.data?.items || []);
        setCalendar(c.data?.calendar || c.data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(loadAll, []);

  useEffect(() => {
    getCareCalendar(month)
      .then((r) => setCalendar(r.data?.calendar || r.data?.items || []))
      .catch(() => {});
  }, [month]);

  const onAddJournal = async (e) => {
    e.preventDefault();
    if (!jProduct || !jNote.trim()) return;
    try {
      await addJournalEntry({
        product_id: Number(jProduct),
        note: jNote.trim(),
        photo_emoji: jPhoto,
        height_cm: jHeight ? Number(jHeight) : null,
      });
      toast.ok(t("care.journal.added"));
      setJNote("");
      setJHeight("");
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onAddSchedule = async (e) => {
    e.preventDefault();
    if (!sProduct) return;
    try {
      await addSchedule({
        product_id: Number(sProduct),
        task_type: sType,
        interval_days: Number(sEvery),
        next_run: new Date(Date.now() + Number(sEvery) * 86400000)
          .toISOString()
          .slice(0, 10),
      });
      toast.ok(t("care.schedules.created"));
      setSProduct("");
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onDeleteJournal = async (id) => {
    try {
      await deleteJournalEntry(id);
      toast.ok(t("care.journal.deleted"));
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onDeleteSchedule = async (id) => {
    try {
      await deleteSchedule(id);
      toast.ok(t("care.schedules.deleted"));
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const taskLabel = (value) => {
    const key = "care.tasks." + value;
    return t(key) !== key ? t(key) : value;
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>{t("care.dashboard.heading")}</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        {t("care.dashboard.subhead")}
      </p>

      <div className="row gap-8" style={{ marginBottom: 16 }}>
        <button
          className={"btn btn-sm " + (tab === "dashboard" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("dashboard")}
        >
          {t("care.dashboard.tabCalendar")}
        </button>
        <button
          className={"btn btn-sm " + (tab === "journal" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("journal")}
        >
          {t("care.dashboard.tabJournal")}
        </button>
        <button
          className={"btn btn-sm " + (tab === "schedules" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("schedules")}
        >
          {t("care.dashboard.tabSchedules")}
        </button>
      </div>

      {tab === "dashboard" && (
        <div>
          <div className="row mb-16" style={{ gap: 8 }}>
            <label className="muted">{t("care.dashboard.month")}</label>
            <input
              type="month"
              className="input"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ width: 180 }}
            />
            <span className="spacer" />
            <span className="muted">
              {(calendar || []).length === 1
                ? t("care.dashboard.taskCount", {
                    count: (calendar || []).length,
                  })
                : t("care.dashboard.taskCountPlural", {
                    count: (calendar || []).length,
                  })}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {(calendar || []).length === 0 && (
              <div className="empty" style={{ gridColumn: "1/-1" }}>
                <div className="emoji">🌤</div>
                <h3>{t("care.dashboard.noTasksHeading")}</h3>
                <p className="muted">{t("care.dashboard.noTasksBody")}</p>
              </div>
            )}
            {(calendar || []).map((c, i) => {
              const label = taskLabel(c.task_type);
              return (
                <div key={i} className="card card-pad">
                  <div className="row">
                    <span style={{ fontSize: 28 }}>{label.split(" ")[0]}</span>
                    <span className="spacer" />
                    <span className="muted">{fmtDate(c.due_date)}</span>
                  </div>
                  <h4 style={{ margin: "8px 0 4px" }}>
                    {c.product_name ||
                      t("care.dashboard.productFallback", { id: c.product_id })}
                  </h4>
                  <span className="tag tag-leaf">{label}</span>
                  {c.done && (
                    <span className="tag tag-success" style={{ marginLeft: 6 }}>
                      {t("care.dashboard.done")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "journal" && (
        <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
          <form
            onSubmit={onAddJournal}
            className="card card-pad-lg"
            style={{ flex: 1, minWidth: 280 }}
          >
            <h3 style={{ marginTop: 0 }}>{t("care.journal.formTitle")}</h3>
            <label className="field-label">{t("care.journal.productId")}</label>
            <input
              className="input"
              type="number"
              value={jProduct}
              onChange={(e) => setJProduct(e.target.value)}
              required
            />
            <label className="field-label mt-8">{t("care.journal.note")}</label>
            <textarea
              className="input"
              rows={3}
              value={jNote}
              onChange={(e) => setJNote(e.target.value)}
              placeholder={t("care.journal.notePlaceholder")}
              required
              style={{ resize: "vertical" }}
            />
            <div className="row mt-8" style={{ gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">{t("care.journal.emoji")}</label>
                <input
                  className="input"
                  value={jPhoto}
                  onChange={(e) => setJPhoto(e.target.value)}
                  maxLength={4}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">{t("care.journal.heightCm")}</label>
                <input
                  className="input"
                  type="number"
                  value={jHeight}
                  onChange={(e) => setJHeight(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary mt-8" type="submit">
              {t("care.journal.submit")}
            </button>
          </form>

          <div style={{ flex: 2, minWidth: 0 }}>
            {loading ? (
              <div className="empty">
                <div className="emoji">⏳</div>
                <h3>{t("care.journal.loading")}</h3>
              </div>
            ) : journal.length === 0 ? (
              <div className="empty">
                <div className="emoji">📓</div>
                <h3>{t("care.journal.empty")}</h3>
              </div>
            ) : (
              <div>
                {journal.map((j) => (
                  <div
                    key={j.id}
                    className="card card-pad"
                    style={{ marginBottom: 8 }}
                  >
                    <div className="row">
                      <span style={{ fontSize: 32 }}>{j.photo_emoji || "🌿"}</span>
                      <div style={{ flex: 1, marginLeft: 12 }}>
                        <strong>
                          {j.product_name ||
                            t("care.dashboard.productFallback", {
                              id: j.product_id,
                            })}
                        </strong>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {fmtDate(j.created_at)}
                          {j.height_cm
                            ? " · " +
                              t("care.journal.heightSuffix", {
                                cm: j.height_cm,
                              })
                            : ""}
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => onDeleteJournal(j.id)}
                      >
                        🗑
                      </button>
                    </div>
                    <p style={{ margin: "8px 0 0" }}>{j.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "schedules" && (
        <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
          <form
            onSubmit={onAddSchedule}
            className="card card-pad-lg"
            style={{ flex: 1, minWidth: 280 }}
          >
            <h3 style={{ marginTop: 0 }}>{t("care.schedules.formTitle")}</h3>
            <label className="field-label">{t("care.schedules.productId")}</label>
            <input
              className="input"
              type="number"
              value={sProduct}
              onChange={(e) => setSProduct(e.target.value)}
              required
            />
            <label className="field-label mt-8">{t("care.schedules.task")}</label>
            <select
              className="input"
              value={sType}
              onChange={(e) => setSType(e.target.value)}
            >
              {TASK_VALUES.map((v) => (
                <option key={v} value={v}>
                  {taskLabel(v)}
                </option>
              ))}
            </select>
            <label className="field-label mt-8">
              {t("care.schedules.everyDays")}
            </label>
            <input
              className="input"
              type="number"
              min="1"
              value={sEvery}
              onChange={(e) => setSEvery(e.target.value)}
            />
            <button className="btn btn-primary mt-8" type="submit">
              {t("care.schedules.submit")}
            </button>
          </form>

          <div style={{ flex: 2, minWidth: 0 }}>
            {schedules.length === 0 ? (
              <div className="empty">
                <div className="emoji">⏰</div>
                <h3>{t("care.schedules.empty")}</h3>
              </div>
            ) : (
              <div>
                {schedules.map((s) => {
                  const label = taskLabel(s.task_type);
                  return (
                    <div
                      key={s.id}
                      className="card card-pad"
                      style={{ marginBottom: 8 }}
                    >
                      <div className="row">
                        <span style={{ fontSize: 28 }}>{label.split(" ")[0]}</span>
                        <div style={{ flex: 1, marginLeft: 12 }}>
                          <strong>
                            {s.product_name ||
                              t("care.dashboard.productFallback", {
                                id: s.product_id,
                              })}
                          </strong>
                          <div className="muted" style={{ fontSize: 12 }}>
                            {s.interval_days === 1
                              ? t("care.schedules.everyDay", { n: s.interval_days })
                              : t("care.schedules.everyDays", { n: s.interval_days })}{" "}
                            · {t("care.schedules.next")} {fmtDate(s.next_due)}
                          </div>
                        </div>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => onDeleteSchedule(s.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
