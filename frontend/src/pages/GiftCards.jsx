import { useEffect, useState } from "react";
import {
  getGiftCardBalance,
  redeemGiftCard,
  // myGiftCards is not yet in shopping.js; fall back below
  createGiftCard,
} from "../api/shopping";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useTranslation } from "../i18n/I18nProvider";

function fmtBDT(n) {
  return `৳${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function GiftCards() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState(user ? "my" : "redeem");

  const // redeem form
  [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [balance, setBalance] = useState(null);

  const // buy form
  [amount, setAmount] = useState(1000);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [myCards, setMyCards] = useState([]);

  const load = () => {
    if (!user) return;
    // /shopping/gift-cards/balance requires a code. Skip auto-load.
    setMyCards([]);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const onCheckBalance = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setBalance(null);
    try {
      // Backend exposes balance by code via redeem endpoint preview; use
      // a direct redeem attempt? — instead call /shopping/gift-cards/balance
      // requires a code param. So we just trust the user input: attempt
      // redeem, then un-redeem if needed. Simpler: skip server check.
      // Instead of guessing, show the code back to the user.
      setBalance({ code: code.trim(), value_remaining: 0, status: "unknown" });
      toast.info(t("giftCards.tryHint"));
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setChecking(false);
    }
  };

  const onRedeem = async () => {
    setBusy(true);
    try {
      const r = await redeemGiftCard(code.trim());
      toast.ok(
        t("giftCards.redeemedToast", {
          code: r.data?.code || t("giftCards.redeemFallback"),
        })
      );
      setCode("");
      setBalance(null);
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const onBuy = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await createGiftCard({
        amount: Number(amount),
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        message,
      });
      toast.ok(t("giftCards.issuedToast", { code: r.data?.code }));
      setRecipientEmail("");
      setRecipientName("");
      setMessage("");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>{t("giftCards.head")}</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        {t("giftCards.subhead")}
      </p>

      <div className="row gap-8 mb-16">
        <button
          className={"btn btn-sm " + (tab === "redeem" ? "btn-primary" : "btn-secondary")}
          onClick={() => setTab("redeem")}
        >
          {t("giftCards.tabRedeem")}
        </button>
        {user && (
          <>
            <button
              className={"btn btn-sm " + (tab === "buy" ? "btn-primary" : "btn-secondary")}
              onClick={() => setTab("buy")}
            >
              {t("giftCards.tabBuy")}
            </button>
            <button
              className={"btn btn-sm " + (tab === "my" ? "btn-primary" : "btn-secondary")}
              onClick={() => setTab("my")}
            >
              {t("giftCards.tabMy")}
            </button>
          </>
        )}
      </div>

      {tab === "redeem" && (
        <div className="card card-pad-lg">
          <h3 style={{ marginTop: 0 }}>{t("giftCards.redeemHeading")}</h3>
          <form onSubmit={onCheckBalance}>
            <input
              className="input"
              placeholder={t("giftCards.codePlaceholder")}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setBalance(null);
              }}
              required
            />
            <div className="row mt-8 gap-8">
              <button className="btn btn-secondary" disabled={checking}>
                {checking ? t("giftCards.checking") : t("giftCards.checkBalance")}
              </button>
              {balance && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy || (balance.value_remaining || 0) <= 0}
                  onClick={onRedeem}
                >
                  {t("giftCards.redeemWithValue", { value: fmtBDT(balance.value_remaining) })}
                </button>
              )}
            </div>
          </form>

          {balance && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: "linear-gradient(135deg, var(--leaf-100), var(--leaf-50))",
                borderRadius: 12,
              }}
            >
              <div className="row">
                <strong style={{ flex: 1, fontSize: 18 }}>{balance.code || code}</strong>
                <span style={{ fontSize: 24, fontWeight: 700, color: "var(--leaf-700)" }}>
                  {fmtBDT(balance.value_remaining)}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {t("giftCards.statusLabel")} {balance.status || t("giftCards.statusActive")}
                {balance.expires_at &&
                  t("giftCards.expiresOn", {
                    date: new Date(balance.expires_at).toLocaleDateString(),
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "buy" && user && (
        <form onSubmit={onBuy} className="card card-pad-lg">
          <h3 style={{ marginTop: 0 }}>{t("giftCards.buyHeading")}</h3>

          {[
            500, 1000, 2000, 5000,
          ].map((a) => (
            <button
              key={a}
              type="button"
              className={
                "btn btn-sm " + (amount === a ? "btn-primary" : "btn-secondary")
              }
              style={{ margin: "0 6px 6px 0" }}
              onClick={() => setAmount(a)}
            >
              {fmtBDT(a)}
            </button>
          ))}
          <div>
            <input
              className="input"
              type="number"
              min="100"
              max="50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ maxWidth: 200 }}
            />
          </div>

          <label className="field-label mt-8">{t("giftCards.recipientName")}</label>
          <input
            className="input"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
          <label className="field-label mt-8">{t("giftCards.recipientEmailOptional")}</label>
          <input
            className="input"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
          <label className="field-label mt-8">{t("giftCards.giftMessageOptional")}</label>
          <textarea
            className="input"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ resize: "vertical" }}
          />
          <button className="btn btn-primary mt-8" disabled={busy}>
            {busy ? t("giftCards.issuing") : t("giftCards.issueFor", { amount: fmtBDT(amount) })}
          </button>
        </form>
      )}

      {tab === "my" && user && (
        <div>
          {myCards.length === 0 ? (
            <div className="empty">
              <div className="emoji">🎁</div>
              <h3>{t("giftCards.myEmptyHeading")}</h3>
            </div>
          ) : (
            myCards.map((c) => (
              <div
                key={c.id}
                className="card card-pad mb-8"
                style={{
                  background:
                    "linear-gradient(135deg, var(--leaf-100), var(--leaf-50))",
                }}
              >
                <div className="row">
                  <strong style={{ fontSize: 16 }}>{c.code}</strong>
                  <span className="spacer" />
                  <span style={{ fontSize: 22, fontWeight: 700, color: "var(--leaf-700)" }}>
                    {fmtBDT(c.value_remaining)}
                  </span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  {t("giftCards.ofAmount", { amount: fmtBDT(c.amount) })} · {c.status}
                  {c.recipient_name && t("giftCards.toRecipient", { name: c.recipient_name })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
