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

const TASK_TYPES = [
  { value: "water", label: "💧 Water" },
  { value: "fertilize", label: "🌾 Fertilize" },
  { value: "repot", label: "🪴 Repot" },
  { value: "prune", label: "✂️ Prune" },
  { value: "mist", label: "💦 Mist" },
  { value: "rotate", label: "🔄 Rotate" },
];

export default function Care() {
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
      toast.ok("Journal entry added");
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
      toast.ok("Schedule created");
      setSProduct("");
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onDeleteJournal = async (id) => {
    try {
      await deleteJournalEntry(id);
      toast.ok("Removed");
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onDeleteSchedule = async (id) => {
    try {
      await deleteSchedule(id);
      toast.ok("Schedule removed");
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>🌿 Plant Care Dashboard</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Track growth, log milestones, and never miss a watering day.
      </p>

      <div className="row gap-8" style={{ marginBottom: 16 }}>
        <button
          className={"btn btn-sm " + (tab === "dashboard" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("dashboard")}
        >
          📅 Calendar
        </button>
        <button
          className={"btn btn-sm " + (tab === "journal" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("journal")}
        >
          📓 Growth Journal
        </button>
        <button
          className={"btn btn-sm " + (tab === "schedules" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("schedules")}
        >
          ⏰ Schedules
        </button>
      </div>

      {tab === "dashboard" && (
        <div>
          <div className="row mb-16" style={{ gap: 8 }}>
            <label className="muted">Month:</label>
            <input
              type="month"
              className="input"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ width: 180 }}
            />
            <span className="spacer" />
            <span className="muted">
              {(calendar || []).length} task{(calendar || []).length === 1 ? "" : "s"} scheduled
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
                <h3>No tasks this month</h3>
                <p className="muted">Add a schedule to get reminders.</p>
              </div>
            )}
            {(calendar || []).map((c, i) => {
              const t = TASK_TYPES.find((x) => x.value === c.task_type) || {
                label: c.task_type,
              };
              return (
                <div key={i} className="card card-pad">
                  <div className="row">
                    <span style={{ fontSize: 28 }}>{t.label.split(" ")[0]}</span>
                    <span className="spacer" />
                    <span className="muted">{fmtDate(c.due_date)}</span>
                  </div>
                  <h4 style={{ margin: "8px 0 4px" }}>{c.product_name || `Product #${c.product_id}`}</h4>
                  <span className="tag tag-leaf">{t.label}</span>
                  {c.done && (
                    <span className="tag tag-success" style={{ marginLeft: 6 }}>
                      ✓ Done
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
          <form onSubmit={onAddJournal} className="card card-pad-lg" style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ marginTop: 0 }}>Add journal entry</h3>
            <label className="field-label">Product ID</label>
            <input
              className="input"
              type="number"
              value={jProduct}
              onChange={(e) => setJProduct(e.target.value)}
              required
            />
            <label className="field-label mt-8">Note</label>
            <textarea
              className="input"
              rows={3}
              value={jNote}
              onChange={(e) => setJNote(e.target.value)}
              placeholder="New leaf today! Soil feels dry…"
              required
              style={{ resize: "vertical" }}
            />
            <div className="row mt-8" style={{ gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">Emoji</label>
                <input
                  className="input"
                  value={jPhoto}
                  onChange={(e) => setJPhoto(e.target.value)}
                  maxLength={4}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">Height (cm)</label>
                <input
                  className="input"
                  type="number"
                  value={jHeight}
                  onChange={(e) => setJHeight(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary mt-8" type="submit">
              Add entry
            </button>
          </form>

          <div style={{ flex: 2, minWidth: 0 }}>
            {loading ? (
              <div className="empty">
                <div className="emoji">⏳</div>
                <h3>Loading…</h3>
              </div>
            ) : journal.length === 0 ? (
              <div className="empty">
                <div className="emoji">📓</div>
                <h3>No entries yet</h3>
              </div>
            ) : (
              <div>
                {journal.map((j) => (
                  <div key={j.id} className="card card-pad" style={{ marginBottom: 8 }}>
                    <div className="row">
                      <span style={{ fontSize: 32 }}>{j.photo_emoji || "🌿"}</span>
                      <div style={{ flex: 1, marginLeft: 12 }}>
                        <strong>{j.product_name || `Product #${j.product_id}`}</strong>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {fmtDate(j.created_at)}
                          {j.height_cm ? ` · ${j.height_cm}cm tall` : ""}
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
          <form onSubmit={onAddSchedule} className="card card-pad-lg" style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ marginTop: 0 }}>New care schedule</h3>
            <label className="field-label">Product ID</label>
            <input
              className="input"
              type="number"
              value={sProduct}
              onChange={(e) => setSProduct(e.target.value)}
              required
            />
            <label className="field-label mt-8">Task</label>
            <select
              className="input"
              value={sType}
              onChange={(e) => setSType(e.target.value)}
            >
              {TASK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className="field-label mt-8">Every (days)</label>
            <input
              className="input"
              type="number"
              min="1"
              value={sEvery}
              onChange={(e) => setSEvery(e.target.value)}
            />
            <button className="btn btn-primary mt-8" type="submit">
              Create schedule
            </button>
          </form>

          <div style={{ flex: 2, minWidth: 0 }}>
            {schedules.length === 0 ? (
              <div className="empty">
                <div className="emoji">⏰</div>
                <h3>No schedules yet</h3>
              </div>
            ) : (
              <div>
                {schedules.map((s) => {
                  const t = TASK_TYPES.find((x) => x.value === s.task_type) || {
                    label: s.task_type,
                  };
                  return (
                    <div key={s.id} className="card card-pad" style={{ marginBottom: 8 }}>
                      <div className="row">
                        <span style={{ fontSize: 28 }}>{t.label.split(" ")[0]}</span>
                        <div style={{ flex: 1, marginLeft: 12 }}>
                          <strong>
                            {s.product_name || `Product #${s.product_id}`}
                          </strong>
                          <div className="muted" style={{ fontSize: 12 }}>
                            Every {s.interval_days} day
                            {s.interval_days === 1 ? "" : "s"} · next:{" "}
                            {fmtDate(s.next_due)}
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
