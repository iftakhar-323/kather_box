import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getWishlist,
  removeFromWishlist,
} from "../api/wishlist";
import { addToCart } from "../api/cart";
import { useTranslation } from "../i18n/I18nProvider";

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
  if (stock === 0) return { tone: "out", text: t("wishlist.stockOut"), icon: "🚫" };
  if (stock <= 3) return { tone: "low", text: t("wishlist.stockLow", { count: stock }), icon: "⚠️" };
  return { tone: "ok", text: t("wishlist.stockOk"), icon: "✓" };
}

export default function Wishlist() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (tone, msg) => {
    setToast({ tone, msg });
    setTimeout(() => setToast(null), 2400);
  };

  const load = () => {
    setLoading(true);
    getWishlist()
      .then((res) => setItems(res.data || []))
      .catch(() => showToast("err", t("wishlist.loadFailed")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalValue = useMemo(
    () => items.reduce((sum, it) => sum + (it.Product?.price || 0), 0),
    [items]
  );

  if (!user) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🔒</div>
        <h3>{t("wishlist.loginTitle")}</h3>
        <p>{t("wishlist.loginBody")}</p>
        <button
          className="btn btn-primary mt-16"
          onClick={() => window.__katherboxSetView?.("login")}
        >
          {t("wishlist.loginAction")}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty">
        <div className="emoji">❤️</div>
        <h3>{t("wishlist.loading")}</h3>
      </div>
    );
  }

  const remove = (it) => {
    const name = it.Product?.name || t("wishlist.removeThisItem");
    setConfirm({
      title: t("wishlist.removeTitle"),
      body: t("wishlist.removeBody", { name }),
      danger: true,
      confirmText: t("wishlist.removeConfirm"),
      onConfirm: async () => {
        setConfirm(null);
        try {
          setBusyId(it.ID);
          await removeFromWishlist(it.ID);
          load();
          showToast("ok", t("wishlist.removed"));
        } catch {
          showToast("err", t("wishlist.removeFailed"));
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const moveToCart = async (it) => {
    if (!it.Product) return;
    if (it.Product.stock === 0) {
      showToast("err", t("wishlist.outOfStock", { name: it.Product.name }));
      return;
    }
    try {
      setBusyId(it.ID);
      await addToCart(it.Product.ID, 1);
      await removeFromWishlist(it.ID);
      showToast("ok", t("wishlist.movedToCart", { name: it.Product.name }));
      load();
    } catch (err) {
      const msg =
        err.response?.data?.error || t("wishlist.addToCartFailed");
      showToast("err", msg);
    } finally {
      setBusyId(null);
    }
  };

  const moveAllToCart = () => {
    const available = items.filter((it) => it.Product && it.Product.stock > 0);
    if (available.length === 0) {
      showToast("err", t("wishlist.nothingToMove"));
      return;
    }
    setConfirm({
      title: t("wishlist.moveAllTitle"),
      body: t("wishlist.moveAllBody", { count: available.length }),
      danger: false,
      confirmText: t("wishlist.moveCountToCart", { count: available.length }),
      onConfirm: async () => {
        setConfirm(null);
        try {
          setBulkBusy(true);
          let okCount = 0;
          let failCount = 0;
          for (const it of available) {
            try {
              await addToCart(it.Product.ID, 1);
              await removeFromWishlist(it.ID);
              okCount++;
            } catch {
              failCount++;
            }
          }
          if (okCount > 0) showToast("ok", t("wishlist.movedCountOk", { count: okCount }));
          if (failCount > 0) showToast("err", t("wishlist.movedCountFail", { count: failCount }));
          load();
        } finally {
          setBulkBusy(false);
        }
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🍃</div>
        <h3>{t("wishlist.emptyTitle")}</h3>
        <p>{t("wishlist.emptyBody")}</p>
        <button
          className="btn btn-primary mt-16"
          onClick={() => window.__katherboxSetView?.("home")}
        >
          {t("wishlist.emptyAction")}
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page" style={{ maxWidth: 920 }}>
      {/* Header */}
      <div className="cart-header">
        <div>
          <h2>{t("wishlist.headerTitle")}</h2>
          <div className="cart-subhead">
            {t("wishlist.subhead", {
              count: items.length,
              itemOrItems: t(
                items.length === 1 ? "wishlist.subheadItem" : "wishlist.subheadItems"
              ),
              total: fmtBDT(totalValue),
            })}
          </div>
        </div>
        <button
          onClick={moveAllToCart}
          disabled={bulkBusy}
          className="btn btn-primary btn-sm"
        >
          {bulkBusy ? t("wishlist.moving") : t("wishlist.moveAllLabel")}
        </button>
      </div>

      {/* Items */}
      <div className="stack gap-12 cart-items">
        {items.map((it) => {
          const p = it.Product;
          if (!p) return null;
          const isBusy = busyId === it.ID;
          const badge = stockBadge(p.stock, t);
          return (
            <article
              key={it.ID}
              className={`cart-item ${isBusy ? "is-busy" : ""}`}
            >
              <div className="cart-item-icon">
                {emojiFor(p.category, p.subcategory)}
              </div>

              <div className="cart-item-body">
                <div className="cart-item-name">{p.name}</div>
                <div className="cart-item-sub">
                  <span className="cart-item-subcat">
                    {(p.subcategory || p.category || "").replace(/_/g, " ")}
                  </span>
                  <span className={`cart-stock cart-stock-${badge.tone}`}>
                    {badge.icon} {badge.text}
                  </span>
                </div>
                <div className="cart-item-price">{fmtBDT(p.price)}</div>
              </div>

              <div className="cart-item-controls">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => moveToCart(it)}
                  disabled={isBusy || p.stock === 0}
                  title={p.stock === 0 ? t("wishlist.stockOut") : t("wishlist.moveToCartTitle")}
                >
                  {p.stock === 0 ? t("wishlist.soldOut") : t("wishlist.moveToCartLabel")}
                </button>
                <button
                  className="cart-item-remove"
                  onClick={() => remove(it)}
                  disabled={isBusy}
                  aria-label={t("actions.remove")}
                  title={t("actions.remove")}
                >
                  ✕
                </button>
              </div>
            </article>
          );
        })}
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
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>
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