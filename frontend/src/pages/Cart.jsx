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

function stockBadge(stock) {
  if (stock === 0) return { tone: "out", text: "Out of stock", icon: "🚫" };
  if (stock <= 3) return { tone: "low", text: `Only ${stock} left`, icon: "⚠️" };
  return { tone: "ok", text: "In stock", icon: "✓" };
}

export default function Cart({ onOrderPlaced }) {
  const { user } = useAuth();
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
            ? "Please log in to see your cart."
            : "Failed to load cart."
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
        <h3>Please log in</h3>
        <p>Sign in to view items in your cart.</p>
        <button
          className="btn btn-primary mt-16"
          onClick={() => window.__katherboxSetView?.("login")}
        >
          Log in
        </button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="empty">
        <div className="emoji">🛒</div>
        <h3>Loading your cart…</h3>
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
      showToast("err", `${item.product.name} is out of stock.`);
      return;
    }
    try {
      setBusyId(item.ID);
      await updateCartItem(item.ID, next);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || "Could not update quantity.";
      showToast("err", msg);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = (item) => {
    setConfirm({
      title: "Remove item?",
      body: `${item.product.name} will be returned to stock and removed from your cart.`,
      danger: true,
      confirmText: "Remove",
      onConfirm: async () => {
        setConfirm(null);
        try {
          setBusyId(item.ID);
          await removeCartItem(item.ID);
          load();
          showToast("ok", "Item removed");
        } catch (err) {
          showToast("err", "Could not remove item.");
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
      showToast("ok", `Coupon ${code} applied — saved ${fmtBDT(data.discount_amount)}`);
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
    showToast("ok", "Coupon removed");
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    setConfirm({
      title: "Confirm order",
      body: `Place order for ${fmtBDT(total)}? ${pointsDiscount ? `You'll redeem ${pointsDiscount} green points. ` : ""}${couponDiscount ? `Coupon ${couponCode} applied. ` : ""}`,
      danger: false,
      confirmText: checkingOut ? "Placing…" : `Place order — ${fmtBDT(total)}`,
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
          showToast("ok", `Order #${res.data.order.ID} placed!`);
        } catch (err) {
          const msg = err.response?.data?.error || "Checkout failed.";
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
        <h2 style={{ color: "var(--leaf-700)" }}>Order placed!</h2>
        <p className="muted mt-8">
          Order <strong>#{order.order.ID}</strong>
        </p>

        <div className="cart-summary mt-16" style={{ textAlign: "left" }}>
          <div className="cart-summary-row"><span>Subtotal</span><strong>{fmtBDT(sub)}</strong></div>
          {disc > 0 && (
            <div className="cart-summary-row cart-savings"><span>You saved</span><strong>−{fmtBDT(disc)}</strong></div>
          )}
          <div className="cart-summary-row cart-summary-total"><span>Total paid</span><strong>{fmtBDT(order.order.total_price)}</strong></div>
        </div>

        {earn > 0 && (
          <div className="cart-points-earned mt-12">
            🌿 You earned <strong>{earn} green points</strong>
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
            View my orders
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setOrder(null)}
          >
            Continue shopping
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
        <h3>Your cart is empty</h3>
        <p>Add some plants or decor to get started.</p>
        <button
          className="btn btn-primary mt-16"
          onClick={() => window.__katherboxSetView?.("home")}
        >
          Browse the shop
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
          <h2>Your Cart</h2>
          <div className="cart-subhead">
            {items.length} {items.length === 1 ? "item" : "items"} • {fmtBDT(subtotal)}
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Expand items" : "Compact view"}
        >
          {collapsed ? "Expand ▾" : "Compact ▴"}
        </button>
      </div>

      {/* Free-shipping progress */}
      <div className={`cart-freeship ${subtotal >= FREE_SHIPPING_THRESHOLD ? "is-met" : ""}`}>
        {subtotal >= FREE_SHIPPING_THRESHOLD ? (
          <span>🎉 You unlocked <strong>free shipping!</strong></span>
        ) : (
          <span>
            🚚 Add <strong>{fmtBDT(remainingForFreeShipping)}</strong> more for free shipping.
          </span>
        )}
        <div className="cart-freeship-bar">
          <div className="cart-freeship-fill" style={{ width: `${freeShipPct}%` }} />
        </div>
      </div>

      {/* Line items */}
      <div className="stack gap-12 cart-items">
        {items.map((item) => {
          const isBusy = busyId === item.ID;
          const badge = stockBadge(item.product.stock);
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
                  {fmtBDT(item.product.price)} <span>each</span>
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
                      {couponInfo.discount_percent}% off
                    </span>
                  </div>
                  <div className="cart-coupon-save">
                    You save <strong>{fmtBDT(couponInfo.discount_amount)}</strong>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={handleRemoveCoupon}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="cart-coupon-input">
                  <input
                    className="input"
                    placeholder="Enter coupon code"
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
                    {couponBusy ? "Checking…" : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <div className="cart-err">{couponError}</div>
                )}
                <div className="cart-hint">
                  💡 Try <code>WELCOME10</code>, <code>GREEN20</code>, or <code>PLANT15</code> for demo coupons.
                </div>
              </>
            )}
          </div>

          {/* Green Points card */}
          <div className="cart-card">
            <div className="cart-card-head">
              <span className="cart-card-title">🌿 Green Points</span>
              <span className="cart-card-pill">
                Balance: <strong>{userPoints}</strong> pts
              </span>
            </div>
            {userPoints > 0 ? (
              <>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max={Math.min(userPoints, Math.max(0, subtotal - couponDiscount))}
                  placeholder={`Redeem points (1 pt = ৳1)`}
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
                    Use max
                  </button>
                </div>
                {pointsDiscount > 0 && (
                  <div className="cart-saved">
                    Applying <strong>{pointsDiscount}</strong> pts = {fmtBDT(pointsDiscount)} off
                  </div>
                )}
              </>
            ) : (
              <div className="cart-hint">
                Place orders to earn green points. 1 pt earned per ৳10 spent.
              </div>
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
                <strong>Gift wrap</strong>
                <span className="cart-addon-sub">
                  Hand-wrapped with jute ribbon
                </span>
              </span>
              <span className="cart-addon-price">+{fmtBDT(GIFT_WRAP_FEE)}</span>
            </label>
          </div>
        </div>

        {/* Right column: order summary */}
        <aside className="cart-summary-card">
          <h3 className="cart-summary-title">Order summary</h3>
          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal ({items.length} {items.length === 1 ? "item" : "items"})</span>
              <span>{fmtBDT(subtotal)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="cart-summary-row cart-savings">
                <span>Coupon ({couponCode})</span>
                <span>−{fmtBDT(couponDiscount)}</span>
              </div>
            )}

            {pointsDiscount > 0 && (
              <div className="cart-summary-row cart-savings">
                <span>Green points</span>
                <span>−{fmtBDT(pointsDiscount)}</span>
              </div>
            )}

            {giftWrap && (
              <div className="cart-summary-row">
                <span>Gift wrap</span>
                <span>+{fmtBDT(GIFT_WRAP_FEE)}</span>
              </div>
            )}

            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="cart-savings">FREE</span>
                ) : (
                  fmtBDT(shipping)
                )}
              </span>
            </div>

            <div className="cart-summary-row cart-summary-total">
              <span>Total to pay</span>
              <strong>{fmtBDT(total)}</strong>
            </div>
          </div>

          {savings > 0 && (
            <div className="cart-summary-savings">
              🎉 You save <strong>{fmtBDT(savings)}</strong> on this order
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="btn btn-primary btn-lg btn-block mt-12"
          >
            {checkingOut ? "Placing order…" : `Checkout — ${fmtBDT(total)}`}
          </button>
          <button
            onClick={() => window.__katherboxSetView?.("home")}
            className="btn btn-ghost btn-block mt-8"
          >
            Continue shopping
          </button>

          <ul className="cart-trust">
            <li>🔒 Secure checkout</li>
            <li>📦 Door-to-door delivery</li>
            <li>🌱 7-day plant guarantee</li>
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
                Cancel
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