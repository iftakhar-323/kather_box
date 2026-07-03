import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Navbar({ setView }) {
  const { user, logout } = useAuth();

  return (
    <div style={navStyles.bar}>
      <span style={navStyles.logo} onClick={() => setView("home")}>
        KatherBox 🌿
      </span>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: "12px" }}>Hi, {user.name}</span>
            <button onClick={logout} style={navStyles.button}>
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => setView("login")} style={navStyles.button}>
            Login
          </button>
        )}
      </div>
    </div>
  );
}

function MainApp() {
  const [view, setView] = useState("home");

  return (
    <div>
      <Navbar setView={setView} />
      {view === "home" && <Home />}
      {view === "login" && (
        <Login onSwitch={() => setView("register")} onSuccess={() => setView("home")} />
      )}
      {view === "register" && (
        <Register onSwitch={() => setView("login")} onSuccess={() => setView("home")} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;

const navStyles = {
  bar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    borderBottom: "1px solid #333",
  },
  logo: { fontWeight: "bold", cursor: "pointer", fontSize: "18px" },
  button: {
    background: "#4a7c4a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
  },
};