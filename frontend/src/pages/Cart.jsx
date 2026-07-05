import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../api/cart";
import { checkout } from "../api/orders";
import { getMe } from "../api/auth";
import { applyCoupon } from "../api/coupons";
import { useTranslation } from "../i18n/I18nProvider";

const FREE_SHIPPING_THRESHOLD = 1500; // ৳
const GIFT_WRAP_FEE = 50;
const TAX_RATE = 0;          // single BDT-wide inclusive-pricing model
const SHIPPING_FEE = 60;

function emojiFor(category, subcategory) {
  if (category === "plant") return "🌿";
  if (category === "care") return "🧴";
  if (category === "decor") {
    if (subcategory === "decor") return "🏺";
    return "🪵";
  }
  return "🪴";
}

function fmtBDT(n) {
  return "৳" + Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function stockBadge(stock, t) {
  if (stock === 0) return { tone: "out", text: t("cart.stockOut"), icon: "🚫" };
  if (stock <= 3) return { tone: "low", text: t("cart.stockLow", { count: stock }), icon: "⚠️" };
  return { tone: "ok", text: t("cart.stockOk"), icon: "✓" };
}

export default function Cart({ onOrderPlaced }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [order, setOrder] = useState(null);

  // Coupon + Green Points state
  const [couponCode, setCouponCode] = useState("");
  const [pointsToUse, setPointsToUse] = useState(0);
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [giftWrap, setGiftWrap] = useState(false);

  // UI state
  const [confirm, setConfirm] = useState(null);     // {title, body, danger, onConfirm}
  const [toast, setToast] = useState(null);         // {tone, msg}
  const [collapsed, setCollapsed] = useState(false);

  const showToast = (tone, msg) => {
    setToast({ tone, msg });
    setTimeout(() => setToast(null), 2800);
  };

  const load = () => {
    setLoading(true);
    getCart()
      .then((res) => {
        setCart(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(
          err.response?.status === 401
            ? t("cart.loginPromptBody")
            : t("cart.loadFailed")
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      load();
      getMe()
        .then((res) => setUserPoints(res.data.points || 0))
        .catch(() => {});
    }
  }, [user]);

  const items = useMemo(() => cart?.items || [], [cart]);
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [items]
  );

  const couponDiscount = couponInfo?.discount_amount || 0;
  const pointsDiscount = Math.min(pointsToUse || 0, userPoints, subtotal - couponDiscount);
  const giftWrapFee = giftWrap ? GIFT_WRAP_FEE : 0;
  const shipping =
    subtotal === 0 || subtotal - couponDiscount - pointsDiscount >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FEE;
  const total = Math.max(
    0,
    subtotal - couponDiscount - pointsDiscount + giftWrapFee + shipping
  );

  const savings = (couponDiscount || 0) + (pointsDiscount || 0) + (shipping === 0 && subtotal >= FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0);

  if (!user) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🔒</div>
        <h3>{t("cart.loginPromptTitle")}</h3>
        <p>{t("cart.loginPromptBody")}</p>
        <button
          className="btn btn-primary mt-16"
          onClick={() => window.__katherboxSetView?.("login")}
        >
          {t("cart.loginPromptAction")}
        </button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="empty">
        <div className="emoji">🛒</div>
        <h3>{t("cart.loading")}</h3>
      </div>
    );
  }
  if (error) {
    return (
      <div className="empty">
        <div className="emoji">⚠️</div>
        <h3 style={{ color: "var(--rose)" }}>{error}</h3>
      </div>
    );
  }

  // ── Item actions ───────────────────────────────────────────────────────────
  const handleQty = async (item, next) => {
    if (next < 1) return;
    if (item.product.stock === 0) {
      showToast("err", t("cart.outOfStock", { name: item.product.name }));
      return;
    }
    try {
      setBusyId(item.ID);
      await updateCartItem(item.ID, next);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || t("cart.updateQtyFailed");
      showToast("err", msg);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = (item) => {
    setConfirm({
      title: t("cart.confirmRemoveTitle"),
      body: t("cart.confirmRemoveBody", { name: item.product.name }),
      danger: true,
      confirmText: t("cart.removeItem"),
      onConfirm: async () => {
        setConfirm(null);
        try {
          setBusyId(item.ID);
          await removeCartItem(item.ID);
          load();
          showToast("ok", t("cart.itemRemoved"));
        } catch (err) {
          showToast("err", t("cart.removeFailed"));
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    setCouponError("");
    setCouponInfo(null);
    try {
      const { data } = await applyCoupon(code, subtotal);
      setCouponInfo(data);
      showToast("ok", t("cart.couponApplied", { code, amount: fmtBDT(data.discount_amount) }));
    } catch (err) {
      setCouponError(err?.response?.data?.error || err.message);
    } finally {
      setCouponBusy(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInfo(null);
    setCouponCode("");
    setCouponError("");
    showToast("ok", t("cart.couponRemoved"));
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    const pointsNote = pointsDiscount
      ? t("cart.placeOrderPointsNote", { count: pointsDiscount })
      : "";
    const couponNote = couponDiscount
      ? t("cart.placeOrderCouponNote", { code: couponCode })
      : "";
    setConfirm({
      title: t("cart.confirmTitle"),
      body: t("cart.placeOrderConfirm", { total: fmtBDT(total), pointsNote, couponNote }),
      danger: false,
      confirmText: checkingOut
        ? t("cart.checkoutPlacing")
        : t("cart.checkoutConfirm", { total: fmtBDT(total) }),
      onConfirm: async () => {
        setConfirm(null);
        try {
          setCheckingOut(true);
          const res = await checkout({
            coupon_code: couponInfo ? couponCode : "",
            points_to_redeem: pointsToUse || 0,
            gift_wrap: giftWrap,
          });
          setOrder(res.data);
          getMe().then((r) => setUserPoints(r.data.points || 0)).catch(() => {});
          load();
          showToast("ok", t("cart.orderPlaced", { id: res.data.order.ID }));
        } catch (err) {
          const msg = err.response?.data?.error || t("cart.checkoutFailed");
          setError(msg);
          showToast("err", msg);
        } finally {
          setCheckingOut(false);
        }
      },
    });
  };

  // ── Order confirmation screen ─────────────────────────────────────────────
  if (order) {
    const earn = order.points_earned || 0;
    const sub = order.subtotal || 0;
    const disc = order.discount_total || 0;
    return (
      <div
        className="card card-pad-lg"
        style={{ maxWidth: 520, margin: "32px auto", textAlign: "center" }}
      >
        <div style={{ fontSize: 64 }}>🎉</div>
        <h2 style={{ color: "var(--leaf-700)" }}>{t("cart.placed")}</h2>
        <p className="muted mt-8">
          Order <strong>#{order.order.ID}</strong>
        </p>

        <div className="cart-summary mt-16" style={{ textAlign: "left" }}>
          <div className="cart-summary-row"><span>{t("cart.subtotal")}</span><strong>{fmtBDT(sub)}</strong></div>
          {disc > 0 && (
            <div className="cart-summary-row cart-savings"><span>{t("cart.youSaved")}</span><strong>−{fmtBDT(disc)}</strong></div>
          )}
          <div className="cart-summary-row cart-summary-total"><span>{t("cart.totalPaid")}</span><strong>{fmtBDT(order.order.total_price)}</strong></div>
        </div>

        {earn > 0 && (
          <div className="cart-points-earned mt-12">
            <span dangerouslySetInnerHTML={{ __html: t("cart.earnedPoints", { count: earn }) }} />
          </div>
        )}

        <div className="row gap-8 mt-16" style={{ justifyContent: "center" }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              setOrder(null);
              if (onOrderPlaced) onOrderPlaced();
            }}
          >
            {t("cart.viewOrders")}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setOrder(null)}
          >
            {t("cart.continueShopping")}
          </button>
        </div>
      </div>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🪴</div>
        <h3>{t("cart.title")}</h3>
        <p>{t("cart.emptyBody")}</p>
        <button
          className="btn btn-primary mt-16"
          onClick={() => window.__katherboxSetView?.("home")}
        >
          {t("cart.emptyAction")}
        </button>
      </div>
    );
  }

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShipPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-header">
        <div>
          <h2>{t("cart.headerTitle")}</h2>
          <div className="cart-subhead">
            {t("cart.subhead", {
              count: items.length,
              itemOrItems: t(items.length === 1 ? "cart.subheadItem" : "cart.subheadItems"),
              total: fmtBDT(subtotal),
            })}
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? t("cart.expandItems") : t("cart.compactView")}
        >
          {collapsed ? t("cart.expand") : t("cart.compact")}
        </button>
      </div>

      {/* Free-shipping progress */}
      <div className={`cart-freeship ${subtotal >= FREE_SHIPPING_THRESHOLD ? "is-met" : ""}`}>
        {subtotal >= FREE_SHIPPING_THRESHOLD ? (
          <span dangerouslySetInnerHTML={{ __html: t("cart.freeShippingMet") }} />
        ) : (
          <span dangerouslySetInnerHTML={{ __html: t("cart.freeShippingNote", { amount: fmtBDT(remainingForFreeShipping) }) }} />
        )}
        <div className="cart-freeship-bar">
          <div className="cart-freeship-fill" style={{ width: `${freeShipPct}%` }} />
        </div>
      </div>

      {/* Line items */}
      <div className="stack gap-12 cart-items">
        {items.map((item) => {
          const isBusy = busyId === item.ID;
          const badge = stockBadge(item.product.stock, t);
          const lineTotal = item.product.price * item.quantity;
          return (
            <article
              key={item.ID}
              className={`cart-item ${isBusy ? "is-busy" : ""}`}
            >
              <div className="cart-item-icon">
                {emojiFor(item.product.category, item.product.subcategory)}
              </div>

              <div className="cart-item-body">
                <div className="cart-item-name">{item.product.name}</div>
                <div className="cart-item-sub">
                  <span className="cart-item-subcat">
                    {(item.product.subcategory || item.product.category || "")
                      .replace(/_/g, " ")}
                  </span>
                  <span className={`cart-stock cart-stock-${badge.tone}`}>
                    {badge.icon} {badge.text}
                  </span>
                </div>
                <div className="cart-item-price">
                  {fmtBDT(item.product.price)} <span>{t("cart.each")}</span>
                </div>
              </div>

              <div className="cart-item-controls">
                <div className="qty">
                  <button
                    aria-label="decrease"
                    onClick={() => handleQty(item, item.quantity - 1)}
                    disabled={isBusy || item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    aria-label="increase"
                    onClick={() => handleQty(item, item.quantity + 1)}
                    disabled={isBusy || item.product.stock === 0}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-line">{fmtBDT(lineTotal)}</div>
                <button
                  className="cart-item-remove"
                  onClick={() => handleRemove(item)}
                  disabled={isBusy}
                  aria-label="Remove"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Summary + promo stack */}
      <div className="cart-foot">
        <div className="cart-side">
          {/* Coupon card */}
          <div className="cart-card">
            <div className="cart-card-head">
              <span className="cart-card-title">🏷️ Have a coupon?</span>
            </div>

            {couponInfo ? (
              <div className="cart-coupon-applied">
                <div className="cart-coupon-info">
                  <div className="cart-coupon-pill">
                    <strong>{couponCode}</strong>
                    <span>
                      {t("cart.couponPercentOff", { percent: couponInfo.discount_percent })}
                    </span>
                  </div>
                  <div
                    className="cart-coupon-save"
                    dangerouslySetInnerHTML={{
                      __html: t("cart.couponYouSave", { amount: fmtBDT(couponInfo.discount_amount) }),
                    }}
                  />
                </div>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={handleRemoveCoupon}
                >
                  {t("cart.removeItem")}
                </button>
              </div>
            ) : (
              <>
                <div className="cart-coupon-input">
                  <input
                    className="input"
                    placeholder={t("cart.couponInputPlaceholder")}
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyCoupon();
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponBusy || !couponCode.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    {couponBusy ? t("cart.applying") : t("cart.applyCoupon")}
                  </button>
                </div>
                {couponError && (
                  <div className="cart-err">{couponError}</div>
                )}
                <div
                  className="cart-hint"
                  dangerouslySetInnerHTML={{ __html: t("cart.couponHint") }}
                />
              </>
            )}
          </div>

          {/* Green Points card */}
          <div className="cart-card">
            <div className="cart-card-head">
              <span className="cart-card-title">{t("cart.greenPoints")}</span>
              <span
                className="cart-card-pill"
                dangerouslySetInnerHTML={{
                  __html: t("cart.pointsBalance", { count: userPoints }),
                }}
              />
            </div>
            {userPoints > 0 ? (
              <>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max={Math.min(userPoints, Math.max(0, subtotal - couponDiscount))}
                  placeholder={t("cart.redeemPlaceholder")}
                  value={pointsToUse || ""}
                  onChange={(e) =>
                    setPointsToUse(
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                />
                <div className="cart-slider-row">
                  <input
                    type="range"
                    min={0}
                    max={Math.min(userPoints, Math.max(0, subtotal - couponDiscount))}
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(Number(e.target.value))}
                    className="cart-slider"
                  />
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() =>
                      setPointsToUse(
                        Math.min(userPoints, Math.max(0, subtotal - couponDiscount))
                      )
                    }
                  >
                    {t("cart.useMax")}
                  </button>
                </div>
                {pointsDiscount > 0 && (
                  <div
                    className="cart-saved"
                    dangerouslySetInnerHTML={{
                      __html: t("cart.applyingPoints", {
                        count: pointsDiscount,
                        amount: fmtBDT(pointsDiscount),
                      }),
                    }}
                  />
                )}
              </>
            ) : (
              <div className="cart-hint">{t("cart.redeemPointsHint")}</div>
            )}
          </div>

          {/* Add-ons */}
          <div className="cart-card cart-addons">
            <label className="cart-addon-row">
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
              />
              <span className="cart-addon-icon">🎀</span>
              <span className="cart-addon-body">
                <strong>{t("cart.giftWrap")}</strong>
                <span className="cart-addon-sub">
                  {t("cart.giftWrapSub")}
                </span>
              </span>
              <span className="cart-addon-price">+{fmtBDT(GIFT_WRAP_FEE)}</span>
            </label>
          </div>
        </div>

        {/* Right column: order summary */}
        <aside className="cart-summary-card">
          <h3 className="cart-summary-title">{t("cart.orderSummary")}</h3>
          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>
                {t("cart.subtotalCount", {
                  count: items.length,
                  itemOrItems: t(items.length === 1 ? "cart.subheadItem" : "cart.subheadItems"),
                })}
              </span>
              <span>{fmtBDT(subtotal)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="cart-summary-row cart-savings">
                <span>{t("cart.couponInSummary", { code: couponCode })}</span>
                <span>−{fmtBDT(couponDiscount)}</span>
              </div>
            )}

            {pointsDiscount > 0 && (
              <div className="cart-summary-row cart-savings">
                <span>{t("cart.greenPointsInSummary")}</span>
                <span>−{fmtBDT(pointsDiscount)}</span>
              </div>
            )}

            {giftWrap && (
              <div className="cart-summary-row">
                <span>{t("cart.giftWrapInSummary")}</span>
                <span>+{fmtBDT(GIFT_WRAP_FEE)}</span>
              </div>
            )}

            <div className="cart-summary-row">
              <span>{t("cart.shipping")}</span>
              <span>
                {shipping === 0 ? (
                  <span className="cart-savings">{t("cart.shippingFree")}</span>
                ) : (
                  fmtBDT(shipping)
                )}
              </span>
            </div>

            <div className="cart-summary-row cart-summary-total">
              <span>{t("cart.totalPay")}</span>
              <strong>{fmtBDT(total)}</strong>
            </div>
          </div>

          {savings > 0 && (
            <div
              className="cart-summary-savings"
              dangerouslySetInnerHTML={{
                __html: `🎉 ${t("cart.youSaved")} <strong>${fmtBDT(savings)}</strong>`,
              }}
            />
          )}

          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="btn btn-primary btn-lg btn-block mt-12"
          >
            {checkingOut ? t("cart.placing") : t("cart.checkout", { total: fmtBDT(total) })}
          </button>
          <button
            onClick={() => window.__katherboxSetView?.("home")}
            className="btn btn-ghost btn-block mt-8"
          >
            {t("cart.continueShopping")}
          </button>

          <ul className="cart-trust">
            <li>{t("cart.trust1")}</li>
            <li>{t("cart.trust2")}</li>
            <li>{t("cart.trust3")}</li>
          </ul>
        </aside>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="cart-modal-backdrop" onClick={() => setConfirm(null)}>
          <div
            className="cart-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="cart-modal-title">{confirm.title}</h3>
            <p className="cart-modal-body">{confirm.body}</p>
            <div className="row gap-8" style={{ justifyContent: "flex-end" }}>
              <button
                className="btn btn-ghost"
                onClick={() => setConfirm(null)}
              >
                {t("actions.cancel")}
              </button>
              <button
                className={"btn " + (confirm.danger ? "btn-danger" : "btn-primary")}
                onClick={confirm.onConfirm}
              >
                {confirm.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`cart-toast cart-toast-${toast.tone}`} role="status">
          {toast.msg}
        </div>
      )}
    </div>
  );
}