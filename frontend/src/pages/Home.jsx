import { useEffect, useState } from "react";
import { getProducts, getGiftRecommendations } from "../api/products";
import ProductCard from "../components/ProductCard";

const emptyFilters = {
  search: "",
  category: "",
  subcategory: "",
  indoor_outdoor: "",
  min_price: "",
  max_price: "",
  sort: "newest",
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);

  // ===== Gift recommender state =====
  const [giftBudget, setGiftBudget] = useState(1500);
  const [giftOccasion, setGiftOccasion] = useState("");
  const [giftIndoor, setGiftIndoor] = useState("");
  const [giftResults, setGiftResults] = useState([]);
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftError, setGiftError] = useState("");

  const load = (f = filters, p = page) => {
    setLoading(true);
    const cleaned = { ...f, page: p, limit: 12 };
    Object.entries(cleaned).forEach(([k, v]) => {
      if (v === "" || v === null || v === undefined) delete cleaned[k];
    });
    getProducts(cleaned)
      .then((res) => {
        const data = res.data || {};
        setProducts(data.items || []);
        setTotalPages(data.total_pages || 1);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load products. Is the backend running?");
        setLoading(false);
      });
  };

  useEffect(() => {
    load(emptyFilters, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (e) => {
    e?.preventDefault?.();
    setPage(1);
    load(filters, 1);
  };

  const reset = () => {
    setFilters(emptyFilters);
    setPage(1);
    load(emptyFilters, 1);
  };

  const update = (key) => (e) =>
    setFilters({ ...filters, [key]: e.target.value });

  return (
    <div>
      <section className="hero">
        <h1>Bring nature home 🌿</h1>
        <p>
          Curated plants, handcrafted planters and gentle care essentials —
          delivered to your doorstep in Dhaka and beyond.
        </p>
      </section>

      {/* ===== SSEcommerce trust strip ===== */}
      <section className="sse-strip" aria-label="Why shop with SSEcommerce">
        <div className="sse-tile">
          <div className="sse-ico" aria-hidden="true">🔒</div>
          <div className="sse-text">
            <div className="sse-title">Secure checkout</div>
            <div className="sse-sub">SSL-encrypted payments</div>
            <span className="sse-badge">PCI · DSS</span>
          </div>
        </div>
        <div className="sse-tile">
          <div className="sse-ico" aria-hidden="true">🚚</div>
          <div className="sse-text">
            <div className="sse-title">Same-day delivery</div>
            <div className="sse-sub">Dhaka · Chattogram · Sylhet</div>
            <span className="sse-badge">FREE ৳1500+</span>
          </div>
        </div>
        <div className="sse-tile">
          <div className="sse-ico" aria-hidden="true">🌱</div>
          <div className="sse-text">
            <div className="sse-title">7-day plant guarantee</div>
            <div className="sse-sub">Free replacement if it doesn&apos;t thrive</div>
            <span className="sse-badge">RATED 4.9★</span>
          </div>
        </div>
        <div className="sse-tile">
          <div className="sse-ico" aria-hidden="true">💬</div>
          <div className="sse-text">
            <div className="sse-title">Expert care support</div>
            <div className="sse-sub">Chat with botanists · Free</div>
            <span className="sse-badge">24 / 7</span>
          </div>
        </div>
      </section>

      {/* ===== Gift recommender widget ===== */}
      <section className="card" style={{ marginBottom: 24 }}>
        <div className="row" style={{ alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 24 }}>🎁</span>
          <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Find the perfect plant gift</h2>
          <span className="spacer" />
          <span className="muted" style={{ fontSize: 13 }}>Budget-aware • occasion-matched</span>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setGiftLoading(true);
            setGiftError("");
            try {
              const { data } = await getGiftRecommendations({
                budget: giftBudget,
                occasion: giftOccasion,
                indoor: giftIndoor,
              });
              setGiftResults(data || []);
            } catch (err) {
              setGiftError(err?.response?.data?.error || err.message);
            } finally {
              setGiftLoading(false);
            }
          }}
          className="filter-bar"
          style={{ marginTop: 12 }}
        >
          <input
            className="input"
            type="number"
            min="100"
            placeholder="Budget (৳)"
            value={giftBudget}
            onChange={(e) => setGiftBudget(e.target.value)}
          />
          <select
            className="select"
            value={giftOccasion}
            onChange={(e) => setGiftOccasion(e.target.value)}
          >
            <option value="">Any occasion</option>
            <option value="birthday">Birthday</option>
            <option value="housewarming">Housewarming</option>
            <option value="thank-you">Thank-you</option>
            <option value="get-well">Get well</option>
            <option value="anniversary">Anniversary</option>
          </select>
          <select
            className="select"
            value={giftIndoor}
            onChange={(e) => setGiftIndoor(e.target.value)}
          >
            <option value="">Indoor / outdoor</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm">
            {giftLoading ? "…" : "Recommend"}
          </button>
        </form>

        {giftError && (
          <div className="empty" style={{ color: "#b00020", padding: "12px 0" }}>
            {giftError}
          </div>
        )}

        {giftResults.length > 0 && (
          <div className="product-grid" style={{ marginTop: 16 }}>
            {giftResults.map((r) => (
              <div key={r.product.ID} className="product-card">
                <div className="image">
                  <span className="emoji-img">{emojiFor(r.product.category)}</span>
                </div>
                <div className="body">
                  <span className="badge">{r.reason}</span>
                  <h3>{r.product.name}</h3>
                  <p className="desc">{r.product.description?.slice(0, 60)}…</p>
                  <div className="row" style={{ alignItems: "center" }}>
                    <span className="price">৳{r.product.price}</span>
                    <span className="spacer" />
                    <span className="muted" style={{ fontSize: 12 }}>
                      match {Math.round(r.score)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* search + filter bar */}
      <form onSubmit={apply} className="filter-bar">
        <input
          className="input"
          placeholder="🔍 Search products…"
          value={filters.search}
          onChange={update("search")}
        />
        <select
          className="select"
          value={filters.category}
          onChange={update("category")}
        >
          <option value="">All categories</option>
          <option value="plant">Plants</option>
          <option value="decor">Decor</option>
          <option value="care">Care Products</option>
        </select>
        <select
          className="select"
          value={filters.subcategory}
          onChange={update("subcategory")}
        >
          <option value="">All subcategories</option>
          <option value="indoor_plant">Indoor Plant</option>
          <option value="outdoor_plant">Outdoor Plant</option>
          <option value="plant_box">Plant Box</option>
          <option value="decor">Decor</option>
          <option value="soil">Soil</option>
          <option value="fertilizer">Fertilizer</option>
          <option value="care_kit">Care Kit</option>
        </select>
        <select
          className="select"
          value={filters.indoor_outdoor}
          onChange={update("indoor_outdoor")}
        >
          <option value="">Indoor / Outdoor</option>
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
          <option value="both">Both</option>
        </select>
        <input
          className="input"
          type="number"
          min="0"
          placeholder="Min ৳"
          value={filters.min_price}
          onChange={update("min_price")}
        />
        <input
          className="input"
          type="number"
          min="0"
          placeholder="Max ৳"
          value={filters.max_price}
          onChange={update("max_price")}
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Apply
        </button>
        <button type="button" onClick={reset} className="btn btn-ghost btn-sm">
          Reset
        </button>
      </form>

      <div className="row mt-24 mb-12">
        <h2 style={{ fontSize: "1.25rem" }}>
          {loading ? "Loading…" : `${total} item${total === 1 ? "" : "s"}`}
        </h2>
        <span className="spacer" />
        <select
          className="select"
          value={filters.sort}
          onChange={(e) => {
            const next = { ...filters, sort: e.target.value };
            setFilters(next);
            load(next, page);
          }}
          style={{ padding: "6px 10px", fontSize: 13 }}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="name_asc">Name A→Z</option>
        </select>
      </div>

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1 || loading}
            onClick={() => {
              const np = page - 1;
              setPage(np);
              load(filters, np);
            }}
          >
            ← Prev
          </button>
          <span className="muted" style={{ alignSelf: "center", fontSize: 13 }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages || loading}
            onClick={() => {
              const np = page + 1;
              setPage(np);
              load(filters, np);
            }}
          >
            Next →
          </button>
        </div>
      )}

      {loading ? (
        <div className="empty">
          <div className="emoji">🪴</div>
          <h3>Loading products…</h3>
        </div>
      ) : error ? (
        <div className="empty">
          <div className="emoji">⚠️</div>
          <h3 style={{ color: "var(--rose)" }}>{error}</h3>
        </div>
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="emoji">🍃</div>
          <h3>No products match your filters</h3>
          <p>Try widening the search or resetting filters.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.ID} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function emojiFor(category) {
  const m = { plant: "🪴", decor: "🏺", care: "🧴" };
  return m[category] || "🌿";
}
