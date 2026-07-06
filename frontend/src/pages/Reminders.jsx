import { useEffect, useState } from "react";
import { getReminders, completeReminder } from "../api/notifications";
import { useTranslation } from "../i18n/I18nProvider";

const TYPE_ICON = {
  watering: "💧",
  fertilizer: "🌱",
  repotting: "🪴",
};

export default function Reminders() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getReminders();
      setItems(data || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markDone = async (id) => {
    try {
      await completeReminder(id);
      setDone(id);
      // refresh list to drop the completed one and surface the next occurrence
      setTimeout(() => {
        setDone(null);
        load();
      }, 800);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="container">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 6 }}>{t("reminders.head")}</h1>
        <p className="muted">{t("reminders.subhead")}</p>
      </div>

      {loading && <div className="empty">{t("reminders.loading")}</div>}
      {error && <div className="empty" style={{ color: "#b00020" }}>{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="empty">
          <div style={{ fontSize: 56 }}>🌵</div>
          <h3>{t("reminders.noTasksHeading")}</h3>
          <p>{t("reminders.noTasksBody")}</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          {items.map((r) => {
            const overdue = r.next_due_date < today;
            const dueSoon =
              !overdue &&
              new Date(r.next_due_date) - new Date(today) < 3 * 24 * 3600 * 1000;
            return (
              <div
                key={r.id}
                className="row-card"
                style={{
                  borderRadius: 0,
                  borderBottom: "1px solid var(--leaf-100)",
                  alignItems: "center",
                }}
              >
                <div
                  className="row-icon"
                  style={{
                    background: overdue
                      ? "linear-gradient(135deg,#fde2e2,#fbcaca)"
                      : "linear-gradient(135deg,#e8f1e6,#cfe1cb)",
                  }}
                >
                  <span style={{ fontSize: 24 }}>
                    {TYPE_ICON[r.type] || "🌿"}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {r.product?.name || t("reminders.plantFallback")}
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {(r.type?.[0].toUpperCase() + r.type?.slice(1)) || ""} •{" "}
                    {t("reminders.taskEveryDays", { n: r.interval_days })}
                  </div>
                </div>

                <span
                  className={
                    "status-pill " +
                    (overdue
                      ? "status-cancelled"
                      : dueSoon
                      ? "status-processing"
                      : "status-delivered")
                  }
                >
                  {overdue
                    ? t("reminders.overdue")
                    : dueSoon
                    ? t("reminders.dueSoon")
                    : t("reminders.upcoming")}
                </span>

                <div className="muted" style={{ width: 110, textAlign: "right" }}>
                  {r.next_due_date}
                </div>

                <button
                  className={"btn " + (done === r.id ? "btn-primary" : "btn-secondary")}
                  onClick={() => markDone(r.id)}
                  disabled={done === r.id}
                >
                  {done === r.id ? t("reminders.doneTag") : t("reminders.markDone")}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}