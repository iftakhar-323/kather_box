import { useEffect, useState } from "react";
import {
  getCorporateOrders,
  createCorporateOrder,
  updateCorporateOrderStatus,
  requestBranding,
} from "../api/corporateOrders";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useTranslation } from "../i18n/I18nProvider";

function fmtBDT(n) {
  return `৳${Number(n || 0).toLocaleString("en-IN")}`;
}

const STATUS_FLOW = [
  "pending",
  "reviewing",
  "approved",
  "in_production",
  "delivered",
  "rejected",
];

export default function CorporateOrders() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "admin";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [active, setActive] = useState(null);

  // form
  const [company, setCompany] = useState("");
  const [quantity, setQuantity] = useState(20);
  const [budget, setBudget] = useState(20000);
  const [notes, setNotes] = useState("");
  const [branding, setBranding] = useState("");
  const [itemsText, setItemsText] = useState(""); // "product_id:qty,product_id:qty"
  const load = () => {
    setLoading(true);
    getCorporateOrders()
      .then((r) => {
        setOrders(r.data?.orders || r.data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const parseItems = (txt) =>
    txt
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const [pid, qty] = s.split(":").map((x) => x.trim());
        return { product_id: Number(pid), quantity: Number(qty || 1) };
      })
      .filter((x) => x.product_id > 0);

  const onSubmit = async (e) => {
    e.preventDefault();
    const items = parseItems(itemsText);
    if (items.length === 0) {
      toast.err(t("corporateOrders.emptyItemsError"));
      return;
    }
    try {
      await createCorporateOrder({
        company_name: company,
        quantity: Number(quantity),
        budget: Number(budget),
        notes,
        branding_needs: branding,
        items,
      });
      toast.ok(t("corporateOrders.submittedToast"));
      setShowForm(false);
      setCompany("");
      setItemsText("");
      setNotes("");
      setBranding("");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onUpdateStatus = async (id, status) => {
    try {
      await updateCorporateOrderStatus(id, status);
      toast.ok(t("corporateOrders.statusChangedToast", { status }));
      load();
      if (active?.id === id) {
        const r = await getCorporateOrders();
        setActive(
          (r.data?.orders || r.data?.items || []).find((o) => o.id === id) || null
        );
      }
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onBranding = async (id) => {
    const text = window.prompt(t("corporateOrders.brandingPrompt"));
    if (!text) return;
    try {
      await requestBranding(id, { description: text });
      toast.ok(t("corporateOrders.brandingSentToast"));
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>{t("corporateOrders.head")}</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        {t("corporateOrders.subhead")}
      </p>

      <div className="row mb-16">
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? t("corporateOrders.cancelFormBtn") : t("corporateOrders.newOrderBtn")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card card-pad-lg mb-16">
          <h3 style={{ marginTop: 0 }}>{t("corporateOrders.formHeading")}</h3>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="field-label">{t("corporateOrders.companyLabel")}</label>
              <input
                className="input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div style={{ width: 120 }}>
              <label className="field-label">{t("corporateOrders.quantityLabel")}</label>
              <input
                className="input"
                type="number"
                min="5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div style={{ width: 160 }}>
              <label className="field-label">{t("corporateOrders.budgetLabel")}</label>
              <input
                className="input"
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          <label className="field-label mt-8">{t("corporateOrders.itemsLabel")}</label>
          <input
            className="input"
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            placeholder={t("corporateOrders.itemsPlaceholder")}
            required
          />
          <label className="field-label mt-8">{t("corporateOrders.notesLabel")}</label>
          <textarea
            className="input"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <label className="field-label mt-8">{t("corporateOrders.brandingLabel")}</label>
          <textarea
            className="input"
            rows={2}
            value={branding}
            onChange={(e) => setBranding(e.target.value)}
            placeholder={t("corporateOrders.brandingPlaceholder")}
          />
          <button className="btn btn-primary mt-8">{t("corporateOrders.submitBtn")}</button>
        </form>
      )}

      {loading ? (
        <div className="empty">
          <div className="emoji">⏳</div>
          <h3>{t("corporateOrders.loadingHeading")}</h3>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="emoji">📦</div>
          <h3>{t("corporateOrders.noOrdersHeading")}</h3>
        </div>
      ) : (
        <div>
          {orders.map((o) => (
            <div
              key={o.id}
              className="card card-pad"
              style={{ marginBottom: 8, cursor: "pointer" }}
              onClick={() => setActive(o)}
            >
              <div className="row">
                <strong>{o.company_name || t("corporateOrders.orderFallback", { id: o.id })}</strong>
                <span className="tag tag-leaf">{o.status}</span>
                <span className="spacer" />
                <span className="muted">
                  {t("corporateOrders.qtyPcsBudget", { qty: o.quantity, budget: fmtBDT(o.budget) })}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {t("corporateOrders.submittedOn", {
                  date: new Date(o.created_at).toLocaleDateString(),
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setActive(null)}
        >
          <div
            className="card card-pad-lg"
            style={{ maxWidth: 560, width: "90%", maxHeight: "85vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>
              {active.company_name || t("corporateOrders.orderFallback", { id: active.id })}
            </h2>
            <p className="muted">
              {t("corporateOrders.modalStatus")} <strong>{active.status}</strong>
            </p>
            <p>{t("corporateOrders.modalQuantity", { qty: active.quantity })}</p>
            <p>{t("corporateOrders.modalBudget", { budget: fmtBDT(active.budget) })}</p>
            {active.notes && <p>{t("corporateOrders.modalNotes", { notes: active.notes })}</p>}
            {active.branding_needs && (
              <p>{t("corporateOrders.modalBranding", { text: active.branding_needs })}</p>
            )}

            {isAdmin && (
              <>
                <h4>{t("corporateOrders.updateStatusHeading")}</h4>
                <div className="row gap-4" style={{ flexWrap: "wrap" }}>
                  {STATUS_FLOW.map((s) => (
                    <button
                      key={s}
                      className={
                        "btn btn-xs " +
                        (s === active.status ? "btn-primary" : "btn-secondary")
                      }
                      onClick={() => onUpdateStatus(active.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {!isAdmin && active.status === "approved" && (
              <button
                className="btn btn-secondary btn-sm mt-8"
                onClick={() => onBranding(active.id)}
              >
                {t("corporateOrders.brandingBtn")}
              </button>
            )}

            <button
              className="btn btn-ghost btn-sm mt-8"
              onClick={() => setActive(null)}
            >
              {t("corporateOrders.closeBtn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
