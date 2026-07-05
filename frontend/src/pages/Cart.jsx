import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../api/cart";
import { checkout } from "../api/orders";
import { getMe } from "../api/auth";
import { applyCoupon } from "../api/coupons";

function emojiFor(category) {
  if (category === "plant") return "🌿";
  if (category === "care") return "🧴";
  return "🪵";
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
  const [couponInfo, setCouponInfo] = useState(null); // {discount_amount, ...}
  const [couponError, setCouponError] = useState("");
  const [userPoints, setUserPoints] = useState(0);
  const [giftWrap, setGiftWrap] = useState(false);

  const load = () => {
    setLoading(true);
    getCart()
      .then((res) => {
        setCart(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load cart. Are you logged in?");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      load();
      // refresh user's Green Points from /auth/me
      getMe()
        .then((res) => setUserPoints(res.data.points || 0))
        .catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🔒</div>
        <h3>Please log in</h3>
        <p>Sign in to view items in your cart.</p>
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

  const items = cart?.items || [];
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Live-computed preview discount
  const couponDiscount = couponInfo?.discount_amount || 0;
  const pointsDiscount = pointsToUse || 0;
  const giftWrapFee = giftWrap ? 50 : 0;
  const previewTotal = Math.max(
    0,
    total - couponDiscount - pointsDiscount + giftWrapFee
  );

  const handleQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try {
      setBusyId(item.id);
      await updateCartItem(item.id, newQty);
      load();
    } catch (err) {
      console.error(err);
      alert("Could not update quantity.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item) => {
    if (!window.confirm(`Remove ${item.product.name} from cart?`)) return;
    try {
      setBusyId(item.id);
      await removeCartItem(item.id);
      load();
    } catch (err) {
      console.error(err);
      alert("Could not remove item.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCheckout = async () => {
    if (!window.confirm(`Place order for ৳${total.toFixed(2)}?`)) return;
    try {
      setCheckingOut(true);
      const res = await checkout({
        coupon_code: couponInfo ? couponCode : "",
        points_to_redeem: pointsToUse || 0,
        gift_wrap: giftWrap,
      });
      setOrder(res.data);
      // refresh points after spending/earning
      getMe().then((r) => setUserPoints(r.data.points || 0)).catch(() => {});
      load();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error || "Checkout failed. Is your cart empty?";
      alert(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  const applyCoupon = async () => {
    setCouponError("");
    setCouponInfo(null);
    try {
      const { data } = await applyCoupon(couponCode, total);
      setCouponInfo(data);
    } catch (err) {
      setCouponError(err?.response?.data?.error || err.message);
    }
  };

  if (order) {
    return (
      <div
        className="card card-pad-lg"
        style={{ maxWidth: 520, margin: "32px auto", textAlign: "center" }}
      >
        <div style={{ fontSize: 56 }}>🎉</div>
        <h2 style={{ color: "var(--leaf-700)" }}>Order placed!</h2>
        <p className="muted mt-8">
          Order <strong>#{order.ID}</strong> — ৳{order.total_price.toFixed(2)}
        </p>
        <p className="muted">Status: {order.status}</p>
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

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <h2 className="mb-16">Your Cart</h2>

      <div className="stack gap-12">
        {items.map((item) => {
          const isBusy = busyId === item.id;
          return (
            <div
              key={item.id}
              className="row-card"
              style={{ opacity: isBusy ? 0.6 : 1, pointerEvents: isBusy ? "none" : "auto" }}
            >
              <div className="row-icon">{emojiFor(item.product.category)}</div>

              <div className="row-meta">
                <div className="title">{item.product.name}</div>
                <div className="sub">৳{item.product.price} each</div>
              </div>

              <div className="qty">
                <button
                  onClick={() => handleQty(item, -1)}
                  disabled={isBusy || item.quantity <= 1}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQty(item, +1)} disabled={isBusy}>
                  +
                </button>
              </div>

              <div
                style={{
                  minWidth: 90,
                  textAlign: "right",
                  fontWeight: 700,
                  color: "var(--text-h)",
                }}
              >
                ৳{(item.product.price * item.quantity).toFixed(2)}
              </div>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleRemove(item)}
                disabled={isBusy}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="total-row">
        <span>Subtotal</span>
        <span>৳{total.toFixed(2)}</span>
      </div>

      {/* ===== Coupon ===== */}
      <div className="card mt-12" style={{ padding: 14 }}>
        <div className="row gap-8" style={{ alignItems: "center" }}>
          <input
            className="input"
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
          <button onClick={applyCoupon} className="btn btn-secondary btn-sm">
            Apply
          </button>
        </div>
        {couponInfo && (
          <div className="muted" style={{ marginTop: 8, fontSize: 13, color: "var(--leaf-700)" }}>
            ✓ Coupon applied — you save ৳{couponInfo.discount_amount.toFixed(2)} (
            {couponInfo.discount_percent}% off)
          </div>
        )}
        {couponError && (
          <div className="muted" style={{ marginTop: 8, fontSize: 13, color: "var(--rose)" }}>
            {couponError}
          </div>
        )}
      </div>

      {/* ===== Green Points ===== */}
      <div className="card mt-12" style={{ padding: 14 }}>
        <div className="row" style={{ alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>🌿</span>
          <strong>Green Points</strong>
          <span className="spacer" />
          <span className="muted" style={{ fontSize: 13 }}>
            Balance: {userPoints} pts (1 pt = ৳1)
          </span>
        </div>
        <input
          className="input mt-8"
          type="number"
          min="0"
          max={Math.min(userPoints, total)}
          placeholder="Points to redeem"
          value={pointsToUse || ""}
          onChange={(e) =>
            setPointsToUse(
              Math.min(Math.max(0, Number(e.target.value) || 0), userPoints, total)
            )
          }
        />
      </div>

      {/* ===== Gift wrap ===== */}
      <label
        className="card mt-12"
        style={{ padding: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <input
          type="checkbox"
          checked={giftWrap}
          onChange={(e) => setGiftWrap(e.target.checked)}
        />
        <span style={{ fontSize: 22 }}>🎀</span>
        <span>
          Gift wrap this order
          <span className="muted" style={{ marginLeft: 6, fontSize: 13 }}>
            +৳50
          </span>
        </span>
      </label>

      {/* ===== Live preview total ===== */}
      <div className="total-row">
        <span>Total to pay</span>
        <span>৳{previewTotal.toFixed(2)}</span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={checkingOut}
        className="btn btn-primary btn-lg btn-block mt-16"
      >
        {checkingOut ? "Placing order…" : `Checkout — ৳${previewTotal.toFixed(2)}`}
      </button>
    </div>
  );
}