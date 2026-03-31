import { useState, useEffect } from "react";

const TOKEN_KEY = "admin_token";

export function useAdmin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isVerifying, setIsVerifying] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      return;
    }
    fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsVerifying(false));
  }, []);

  async function login(password) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error("Fel lösenord");
    const { token: t } = await res.json();
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }

  async function logout() {
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  return {
    isLoggedIn: !!token,
    isVerifying,
    login,
    logout,
    authHeader: token ? { Authorization: `Bearer ${token}` } : {},
  };
}
