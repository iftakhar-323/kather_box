import { useEffect, useState } from "react";
import { getSeasonalGuide } from "../api/seasonal";
import { useTranslation } from "../i18n/I18nProvider";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Seasonal() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [active, setActive] = useState(() => MONTHS[new Date().getMonth()]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all 12 months in one shot, then filter on the client.
  useEffect(() => {
    getSeasonalGuide()
      .then((res) => {
        setData(res.data.calendar || res.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e?.response?.data?.error || e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="empty">{t("seasonal.loading")}</div>;
  if (error) return <div className="empty" style={{ color: "#b00020" }}>{error}</div>;
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ marginBottom: 6 }}>{t("seasonal.head")}</h1>
        <p className="muted">{t("seasonal.subhead")}</p>
      </div>

      <div className="tabs" style={{ flexWrap: "wrap" }}>
        {MONTHS.map((m) => (
          <button
            key={m}
            className={"tab" + (m === active ? " is-active" : "")}
            onClick={() => setActive(m)}
          >
            {(t("seasonal.months." + m) !== "seasonal.months." + m
              ? t("seasonal.months." + m)
              : m
            ).slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>
          {t("seasonal.months." + active) !== "seasonal.months." + active
            ? t("seasonal.months." + active)
            : active}
        </h2>
        {!data?.[active] ? (
          <p className="muted">{t("seasonal.noSuggestions")}</p>
        ) : (
          <div
            className="product-grid"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))" }}
          >
            {data[active].map((e, i) => (
              <div key={i} className="product-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🌱</div>
                <h3 style={{ margin: "6px 0" }}>{e.name}</h3>
                <p className="muted" style={{ fontSize: 13 }}>{e.why}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}