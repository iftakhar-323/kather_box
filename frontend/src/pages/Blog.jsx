import { useEffect, useState } from "react";
import { getBlogPosts, getBlogCategories } from "../api/blog";
import { useTranslation } from "../i18n/I18nProvider";
// real names used; backend returns { posts, total, page }

function fmtDate(s) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function Blog() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [cats, setCats] = useState([]);
  const [cat, setCat] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 9;

  useEffect(() => {
    getBlogCategories()
      .then((r) => setCats(r.data?.categories || r.data?.items || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getBlogPosts({
      category: cat || undefined,
      search: search || undefined,
      page,
      page_size: pageSize,
    })
      .then((r) => {
        setPosts(r.data?.posts || r.data?.items || []);
        setTotal(r.data?.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cat, search, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>{t("blog.head")}</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        {t("blog.subhead")}
      </p>

      <div
        className="row"
        style={{ gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        <input
          className="input"
          placeholder={t("blog.searchPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ flex: 1, minWidth: 220 }}
        />
        <button
          className={"btn btn-sm " + (cat === "" ? "btn-primary" : "btn-secondary")}
          onClick={() => {
            setCat("");
            setPage(1);
          }}
        >
          {t("blog.all")}
        </button>
        {cats.map((c) => (
          <button
            key={c.id || c.slug}
            className={
              "btn btn-sm " + (cat === (c.slug || c.id) ? "btn-primary" : "btn-secondary")
            }
            onClick={() => {
              setCat(c.slug || c.id);
              setPage(1);
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">
          <div className="emoji">⏳</div>
          <h3>{t("blog.loading")}</h3>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty">
          <div className="emoji">📭</div>
          <h3>{t("blog.emptyHeading")}</h3>
          <p className="muted">{t("blog.emptyBody")}</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {posts.map((p) => (
            <article
              key={p.id}
              className="card"
              style={{ overflow: "hidden", cursor: "pointer" }}
              onClick={() => window.__katherboxSetView?.(`blog-${p.slug || p.id}`)}
            >
              <div
                style={{
                  height: 140,
                  background:
                    "linear-gradient(135deg, var(--leaf-100), var(--leaf-200))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 56,
                }}
              >
                {p.cover_emoji || "🌿"}
              </div>
              <div style={{ padding: 16 }}>
                {p.category_name && (
                  <span className="tag tag-leaf">{p.category_name}</span>
                )}
                <h3 style={{ margin: "8px 0" }}>{p.title}</h3>
                <p
                  className="muted"
                  style={{
                    fontSize: 14,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {p.excerpt || p.body?.slice(0, 120)}
                </p>
                <div
                  className="row muted"
                  style={{ fontSize: 12, marginTop: 12, gap: 8 }}
                >
                  <span>{fmtDate(p.published_at || p.created_at)}</span>
                  <span>·</span>
                  <span>{t("blog.minRead", { n: p.read_min || 3 })}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div
          className="row"
          style={{ justifyContent: "center", gap: 8, marginTop: 24 }}
        >
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("blog.prev")}
          </button>
          <span className="muted">
            {t("blog.pageOf", { page, total: totalPages })}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("blog.nextBtn")}
          </button>
        </div>
      )}
    </div>
  );
}
