import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Reminders from "./pages/Reminders";
import Seasonal from "./pages/Seasonal";
import Subscriptions from "./pages/Subscriptions";
import Consultations from "./pages/Consultations";
import Corporate from "./pages/Corporate";
import Community from "./pages/Community";
// Sprint A — profile + auth + static pages
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StaticPage from "./pages/StaticPage";
import EmailVerifyBanner from "./components/EmailVerifyBanner";
import Notifications from "./components/Notifications";

const NAV_ITEMS = [
  { key: "home",          label: "Shop" },
  { key: "wishlist",      label: "Wishlist" },
  { key: "cart",          label: "Cart" },
  { key: "orders",        label: "Orders" },
  { key: "subscriptions", label: "Boxes 📦" },
  { key: "consultations", label: "Experts 🌱" },
  { key: "corporate",     label: "Corporate 🏢" },
  { key: "community",     label: "Community" },
  { key: "reminders",     label: "Care 🌿" },
  { key: "seasonal",      label: "Seasonal" },
];

// Sprint A — supported static-page slugs
const STATIC_SLUGS = ["about", "contact", "faq", "privacy", "terms", "shipping", "refund"];

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-line">
            <span className="leaf">🌿</span>
            <span>KatherBox</span>
          </span>
          <p className="footer-tagline">
            Hand-curated indoor plants, subscriptions, expert consultations
            and corporate gifting — grown with love in Dhaka.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("home"); }}>All plants</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("subscriptions"); }}>Subscription boxes</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("consultations"); }}>Expert consultations</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("corporate"); }}>Corporate gifting</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("about"); }}>About us</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("contact"); }}>Contact</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("faq"); }}>FAQ</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("shipping"); }}>Shipping policy</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("refund"); }}>Refund policy</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("privacy"); }}>Privacy policy</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); window.__katherboxSetView?.("terms"); }}>Terms & conditions</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Get in touch</h4>
          <div className="footer-contact">
            <div className="row">📧 hello@katherbox.com</div>
            <div className="row">📞 +880 1700 000 000</div>
            <div className="row">📍 House 12, Road 7, Dhanmondi, Dhaka</div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} KatherBox. All rights reserved.</span>
        <div className="socials">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">◎</a>
          <a href="#" aria-label="Twitter">𝕏</a>
          <a href="#" aria-label="YouTube">▶</a>
        </div>
      </div>
    </footer>
  );
}

function Navbar({ view, setView }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <header className="navbar">
      <div className="nav-inner">
        <span className="nav-brand" onClick={() => setView("home")}>
          <span className="leaf">🌿</span>
          <span>KatherBox</span>
        </span>

        {user && (
          <nav className="nav-links" aria-label="Primary">
            {NAV_ITEMS.map((it) => (
              <button
                key={it.key}
                onClick={() => setView(it.key)}
                className={
                  "nav-link" +
                  (view === it.key ||
                  (it.key === "home" && view.startsWith("product-"))
                    ? " is-active"
                    : "")
                }
              >
                {it.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => setView("admin")}
                className={
                  "nav-link" + (view === "admin" ? " is-active" : "")
                }
                style={{ color: "var(--rose)" }}
              >
                Admin
              </button>
            )}
          </nav>
        )}

        <span className="nav-spacer" />

        {user ? (
          <>
            <button
              className={"btn btn-ghost btn-sm" + (view === "profile" ? " is-active" : "")}
              onClick={() => setView("profile")}
              title="Edit profile, password, addresses"
            >
              <span className="avatar">
                {(user.name || "?").trim().charAt(0).toUpperCase()}
              </span>
              <span style={{ marginLeft: 6 }}>{user.name?.split(" ")[0]}</span>
            </button>
            <button onClick={logout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => setView("login")} className="btn btn-primary btn-sm">
            Login
          </button>
        )}
      </div>
    </header>
  );
}

function MainApp() {
  const { user } = useAuth();
  const [view, setView] = useState("home");
  // Carries data between ForgotPassword → ResetPassword flow (email + dev token)
  const [resetContext, setResetContext] = useState({ email: "", token: "" });

  // expose setView globally so deeply nested components (e.g. ProductCard)
  // can navigate without prop-drilling through the entire tree.
  useEffect(() => {
    window.__katherboxSetView = setView;
    return () => {
      if (window.__katherboxSetView === setView) {
        delete window.__katherboxSetView;
      }
    };
  }, []);

  return (
    <div className="app-shell">
      <Navbar view={view} setView={setView} />
      {user && <EmailVerifyBanner user={user} />}

      <main className="page">
        {view === "home" && <Home />}
        {view === "login" && (
          <Login
            onSwitch={() => setView("register")}
            onSuccess={() => setView("home")}
            onGoToForgot={() => {
              setResetContext({ email: "", token: "" });
              setView("forgot-password");
            }}
          />
        )}
        {view === "register" && (
          <Register
            onSwitch={() => setView("login")}
            onSuccess={() => setView("home")}
          />
        )}
        {view === "forgot-password" && (
          <ForgotPassword
            onSwitchToLogin={() => setView("login")}
            onSwitchToReset={(email, token) => {
              setResetContext({ email, token });
              setView("reset-password");
            }}
          />
        )}
        {view === "reset-password" && (
          <ResetPassword
            prefillEmail={resetContext.email}
            prefillToken={resetContext.token}
            onDone={() => setView("login")}
            onSwitchToLogin={() => setView("login")}
          />
        )}
        {view === "profile" && (
          <Profile onExit={() => setView("home")} />
        )}
        {STATIC_SLUGS.includes(view) && <StaticPage slug={view} />}
        {view === "cart" && <Cart onOrderPlaced={() => setView("orders")} />}
        {view === "orders" && <Orders />}
        {view === "admin" && <Admin />}
        {view === "wishlist" && <Wishlist />}
        {view === "reminders" && <Reminders />}
        {view === "seasonal" && <Seasonal />}
        {view === "subscriptions" && <Subscriptions />}
        {view === "consultations" && <Consultations />}
        {view === "corporate" && <Corporate />}
        {view === "community" && <Community />}
        {view.startsWith("product-") && (
          <ProductDetail
            productId={Number(view.replace("product-", ""))}
            onBack={() => setView("home")}
          />
        )}
      </main>

      {user && <Notifications />}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}