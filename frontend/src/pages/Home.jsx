import { useEffect, useState } from "react";
import { getProducts, getGiftRecommendations } from "../api/products";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "../i18n/I18nProvider";

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
  const { t } = useTranslation();
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
        setError(t("home.loadFailed"));
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
        <h1>{t("home.heroTitleFull")}</h1>
        <p>
          {t("home.heroSubtitleFull")}
        </p>
      </section>

      {/* ===== KatherBox trust strip ===== */}
      <section className="sse-strip" aria-label={t("home.trustStripLabel")}>
        <div className="sse-tile">
          <div className="sse-ico" aria-hidden="true">🔒</div>
          <div className="sse-text">
            <div className="sse-title">{t("home.trust1Title")}</div>
            <div className="sse-sub">{t("home.trust1Sub")}</div>
            <span className="sse-badge">{t("home.trust1Badge")}</span>
          </div>
        </div>
        <div className="sse-tile">
          <div className="sse-ico" aria-hidden="true">🚚</div>
          <div className="sse-text">
            <div className="sse-title">{t("home.trust2Title")}</div>
            <div className="sse-sub">{t("home.trust2Sub")}</div>
            <span className="sse-badge">{t("home.trust2Badge")}</span>
          </div>
        </div>
        <div className="sse-tile">
          <div className="sse-ico" aria-hidden="true">🌱</div>
          <div className="sse-text">
            <div className="sse-title">{t("home.trust3Title")}</div>
            <div className="sse-sub">{t("home.trust3Sub")}</div>
            <span className="sse-badge">{t("home.trust3Badge")}</span>
          </div>
        </div>
        <div className="sse-tile">
          <div className="sse-ico" aria-hidden="true">💬</div>
          <div className="sse-text">
            <div className="sse-title">{t("home.trust4Title")}</div>
            <div className="sse-sub">{t("home.trust4Sub")}</div>
            <span className="sse-badge">{t("home.trust4Badge")}</span>
          </div>
        </div>
      </section>

      {/* ===== Gift recommender widget ===== */}
      <section className="card" style={{ marginBottom: 24 }}>
        <div className="row" style={{ alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 24 }}>🎁</span>
          <h2 style={{ margin: 0, fontSize: "1.15rem" }}>{t("home.giftTitle")}</h2>
          <span className="spacer" />
          <span className="muted" style={{ fontSize: 13 }}>{t("home.giftSubtitle")}</span>
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
            placeholder={t("home.giftBudgetPlaceholder")}
            value={giftBudget}
            onChange={(e) => setGiftBudget(e.target.value)}
          />
          <select
            className="select"
            value={giftOccasion}
            onChange={(e) => setGiftOccasion(e.target.value)}
          >
            <option value="">{t("home.giftOccasionAny")}</option>
            <option value="birthday">{t("home.giftOccasionBirthday")}</option>
            <option value="housewarming">{t("home.giftOccasionHousewarming")}</option>
            <option value="thank-you">{t("home.giftOccasionThankyou")}</option>
            <option value="get-well">{t("home.giftOccasionGetwell")}</option>
            <option value="anniversary">{t("home.giftOccasionAnniversary")}</option>
          </select>
          <select
            className="select"
            value={giftIndoor}
            onChange={(e) => setGiftIndoor(e.target.value)}
          >
            <option value="">{t("home.giftIndoorOutdoorAny")}</option>
            <option value="indoor">{t("home.giftIndoor")}</option>
            <option value="outdoor">{t("home.giftOutdoor")}</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm">
            {giftLoading ? "…" : t("home.giftRecommend")}
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
                      {t("home.giftMatch", { score: Math.round(r.score) })}
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
          placeholder={t("home.searchPlaceholder")}
          value={filters.search}
          onChange={update("search")}
        />
        <select
          className="select"
          value={filters.category}
          onChange={update("category")}
        >
          <option value="">{t("home.allCategories")}</option>
          <option value="plant">{t("home.categoryPlants")}</option>
          <option value="decor">{t("home.categoryDecor")}</option>
          <option value="care">{t("home.categoryCare")}</option>
        </select>
        <select
          className="select"
          value={filters.subcategory}
          onChange={update("subcategory")}
        >
          <option value="">{t("home.allSubcategories")}</option>
          <option value="indoor_plant">{t("home.subIndoorPlant")}</option>
          <option value="outdoor_plant">{t("home.subOutdoorPlant")}</option>
          <option value="plant_box">{t("home.subPlantBox")}</option>
          <option value="decor">{t("home.subDecor")}</option>
          <option value="soil">{t("home.subSoil")}</option>
          <option value="fertilizer">{t("home.subFertilizer")}</option>
          <option value="care_kit">{t("home.subCareKit")}</option>
        </select>
        <select
          className="select"
          value={filters.indoor_outdoor}
          onChange={update("indoor_outdoor")}
        >
          <option value="">{t("home.indoorOutdoorAny")}</option>
          <option value="indoor">{t("home.giftIndoor")}</option>
          <option value="outdoor">{t("home.giftOutdoor")}</option>
          <option value="both">{t("home.indoorOutdoorBoth")}</option>
        </select>
        <input
          className="input"
          type="number"
          min="0"
          placeholder={t("home.minPricePlaceholder")}
          value={filters.min_price}
          onChange={update("min_price")}
        />
        <input
          className="input"
          type="number"
          min="0"
          placeholder={t("home.maxPricePlaceholder")}
          value={filters.max_price}
          onChange={update("max_price")}
        />
        <button type="submit" className="btn btn-primary btn-sm">
          {t("home.apply")}
        </button>
        <button type="button" onClick={reset} className="btn btn-ghost btn-sm">
          {t("home.reset")}
        </button>
      </form>

      <div className="row mt-24 mb-12">
        <h2 style={{ fontSize: "1.25rem" }}>
          {loading
            ? t("home.loading")
            : t(total === 1 ? "home.totalItems" : "home.totalItemsPlural", { count: total })}
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
          <option value="newest">{t("home.sortNewest")}</option>
          <option value="price_asc">{t("home.sortPriceAsc")}</option>
          <option value="price_desc">{t("home.sortPriceDesc")}</option>
          <option value="name_asc">{t("home.sortNameAsc")}</option>
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
            {t("home.prev")}
          </button>
          <span className="muted" style={{ alignSelf: "center", fontSize: 13 }}>
            {t("home.pageOf", { page, total: totalPages })}
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
            {t("home.next")}
          </button>
        </div>
      )}

      {loading ? (
        <div className="empty">
          <div className="emoji">🪴</div>
          <h3>{t("home.loadingProducts")}</h3>
        </div>
      ) : error ? (
        <div className="empty">
          <div className="emoji">⚠️</div>
          <h3 style={{ color: "var(--rose)" }}>{error}</h3>
        </div>
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="emoji">🍃</div>
          <h3>{t("home.noMatchTitle")}</h3>
          <p>{t("home.noMatchBody")}</p>
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
