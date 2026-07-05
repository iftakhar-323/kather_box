import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser) setUser(JSON.parse(storedUser));

    // If we have a token, refresh user info from the server on mount.
    // This keeps the navbar/role badge in sync after admin promotion or profile edits.
    if (token && !storedUser) {
      getMe()
        .then((res) => {
          const u = res.data;
          localStorage.setItem("user", JSON.stringify(u));
          setUser(u);
        })
        .catch(() => {
          // token invalid — clear it silently
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        });
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Re-fetch the user from the server and update local state.
  // Called after profile updates so the navbar shows the latest name/phone.
  const refreshUser = async () => {
    try {
      const res = await getMe();
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    } catch (e) {
      // token invalid → force logout
      logout();
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}