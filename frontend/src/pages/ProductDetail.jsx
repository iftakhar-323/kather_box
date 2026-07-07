import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProduct } from "../api/products";
import { addToCart } from "../api/cart";
import { CompareStore, SaveForLaterStore, RecentStore } from "../utils/kb";
import { useToast } from "../components/Toast";
import { useTranslation } from "../i18n/I18nProvider";
import ReviewsSection from "../components/ReviewsSection";

function emojiFor(category) {
  if (category === "plant") return "🌿";
  if (category === "care") return "🧴";
  return "🪵";
}

export default function ProductDetail({ productId, onBack }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [inCompare, setInCompare] = useState(CompareStore.has(productId));
  const [inSaved, setInSaved] = useState(SaveForLaterStore.has(productId));

  useEffect(() => {
    setLoading(true);
    getProduct(productId)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
        // Push to recently-viewed the moment we have the data
        RecentStore.push(res.data);
        window.dispatchEvent(new Event("kb:recent-changed"));
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="empty">
        <div className="emoji">🪴</div>
        <h3>{t("productDetail.loading")}</h3>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="empty">
        <div className="emoji">🤔</div>
        <h3>{t("productDetail.notFound")}</h3>
        <button className="btn btn-secondary mt-16" onClick={onBack}>
          {t("productDetail.backToShop")}
        </button>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!user) {
      const goLogin = window.confirm(t("productDetail.loginPrompt"));
      if (goLogin) window.__katherboxSetView?.("login");
      return;
    }
    try {
      setStatus("loading");
      await addToCart(product.ID, 1);
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const btnLabel =
    status === "loading"
      ? t("productDetail.btnAdding")
      : status === "added"
      ? t("productDetail.btnAdded")
      : status === "error"
      ? t("productDetail.btnFailed")
      : t("productDetail.btnAdd");

  const stockOk = product.stock > 0;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <button onClick={onBack} className="btn btn-ghost mb-16">
        {t("productDetail.backToShop")}
      </button>

      <div
        className="card card-pad-lg"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 320px) 1fr",
          gap: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 60%), linear-gradient(160deg, var(--leaf-50), var(--leaf-100))",
            borderRadius: "var(--radius-lg)",
            fontSize: 120,
            aspectRatio: "1 / 1",
          }}
        >
          {emojiFor(product.category)}
        </div>

        <div>
          <h1 style={{ marginBottom: 8 }}>{product.name}</h1>

          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            <span className="tag">{product.category}</span>
            {product.subcategory && (
              <span className="tag tag-bark">
                {product.subcategory.replace(/_/g, " ")}
              </span>
            )}
            {product.indoor_outdoor && (
              <span className="tag tag-info">{product.indoor_outdoor}</span>
            )}
          </div>

          <div
            style={{
              fontFamily: "var(--heading)",
              fontWeight: 700,
              fontSize: 30,
              color: "var(--leaf-700)",
              marginTop: 16,
            }}
          >
            ৳{Number(product.price).toLocaleString()}
          </div>

          <div
            className="mt-8 mb-16"
            style={{
              color: stockOk ? "var(--leaf-700)" : "var(--rose)",
              fontWeight: 600,
            }}
          >
            {stockOk
              ? product.stock < 5
                ? t("productDetail.stockLow", { count: product.stock })
                : t("productDetail.stockIn", { count: product.stock })
              : t("productDetail.stockOut")}
          </div>

          <p
            style={{
              lineHeight: 1.65,
              color: "var(--ink-500)",
              marginBottom: 20,
            }}
          >
            {product.description || t("productDetail.noDescription")}
          </p>

          <button
            onClick={handleAdd}
            disabled={!stockOk || status === "loading"}
            className="btn btn-primary btn-lg"
            style={{
              background: status === "added" ? "var(--success)" : undefined,
            }}
          >
            {btnLabel}
          </button>

          <div className="row gap-8 mt-12" style={{ flexWrap: "wrap" }}>
            <button
              className={"btn btn-secondary btn-sm" + (inCompare ? "" : "")}
              onClick={() => {
                if (!product) return;
                const r = CompareStore.toggle(product);
                if (r === "full") { toast.err(t("productDetail.compareFullToast")); return; }
                setInCompare(r);
                window.dispatchEvent(new Event("kb:compare-changed"));
                toast.ok(r ? t("productDetail.compareAddedToast") : t("productDetail.compareRemovedToast"));
              }}
              title={t("productDetail.compareTitle")}
            >
              {inCompare ? t("productDetail.compareAdded") : t("productDetail.compareAdd")}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (!product) return;
                if (SaveForLaterStore.has(product.ID)) {
                  SaveForLaterStore.remove(product.ID);
                  setInSaved(false);
                  toast.ok(t("productDetail.saveRemovedToast"));
                } else {
                  SaveForLaterStore.add(product);
                  setInSaved(true);
                  toast.ok(t("productDetail.saveAddedToast"));
                }
                window.dispatchEvent(new Event("kb:save-changed"));
              }}
              title={t("productDetail.saveTitle")}
            >
              {inSaved ? t("productDetail.saveAdded") : t("productDetail.saveAdd")}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (!product) return;
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({ title: product.name, text: product.description, url }).catch(() => {});
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(url);
                  toast.ok(t("productDetail.shareCopied"));
                } else {
                  toast.info(t("productDetail.shareInfo", { url }));
                }
              }}
              title={t("productDetail.shareTitle")}
            >
              {t("productDetail.share")}
            </button>
          </div>
        </div>
      </div>
      <ReviewsSection productId={product.ID} />
    </div>
  );
}
