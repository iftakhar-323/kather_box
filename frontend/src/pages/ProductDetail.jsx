import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProduct } from "../api/products";
import { addToCart } from "../api/cart";

function emojiFor(category) {
  if (category === "plant") return "🌿";
  if (category === "care") return "🧴";
  return "🪵";
}

export default function ProductDetail({ productId, onBack }) {
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    setLoading(true);
    getProduct(productId)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
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
        <h3>Loading product…</h3>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="empty">
        <div className="emoji">🤔</div>
        <h3>Product not found</h3>
        <button className="btn btn-secondary mt-16" onClick={onBack}>
          ← Back to shop
        </button>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!user) {
      const goLogin = window.confirm("Log in to add items to your cart?");
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
      ? "Adding…"
      : status === "added"
      ? "Added to cart ✓"
      : status === "error"
      ? "Failed"
      : "Add to cart";

  const stockOk = product.stock > 0;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <button onClick={onBack} className="btn btn-ghost mb-16">
        ← Back to shop
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
                ? `Only ${product.stock} left in stock`
                : `In stock (${product.stock})`
              : "Out of stock"}
          </div>

          <p
            style={{
              lineHeight: 1.65,
              color: "var(--ink-500)",
              marginBottom: 20,
            }}
          >
            {product.description || "No description provided."}
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
        </div>
      </div>
    </div>
  );
}
