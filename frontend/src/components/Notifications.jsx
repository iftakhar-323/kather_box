import { useEffect, useRef, useState } from "react";
import { getNotifications, markNotificationsRead } from "../api/notifications";
import { useTranslation } from "../i18n/I18nProvider";

export default function Notifications() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = () => {
    getNotifications()
      .then((res) => setItems(res.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const unread = items.filter((n) => !n.is_read).length;

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && unread > 0) {
      markNotificationsRead().then(load);
    }
  };

  return (
    <div ref={ref} className="notif-wrap">
      <button
        onClick={toggle}
        className="notif-bell"
        aria-label={t("notifications.title")}
        style={{ position: "relative" }}
      >
        🔔
        {unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="head">
            {t("notifications.title")}
            <span
              className="muted"
              style={{ float: "right", fontWeight: 400, fontSize: 12 }}
            >
              {t("notifications.total", { count: items.length })}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="empty" style={{ padding: 24 }}>
              <div className="emoji" style={{ fontSize: 28 }}>🌱</div>
              <p className="muted">{t("notifications.empty")}</p>
            </div>
          ) : (
            <ul className="notif-list">
              {items.map((n) => (
                <li
                  key={n.ID}
                  className={"notif-item" + (n.is_read ? "" : " unread")}
                >
                  <div>{n.message}</div>
                  <div className="meta">
                    {n.type} · {new Date(n.CreatedAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}