/**
 * API base instance
 * Talks to the real backend (see .env → VITE_API_URL).
 *
 * Auth flow:
 *   - Request interceptor attaches the JWT access token (hrms_token).
 *   - Response interceptor rotates the access token via the refresh token
 *     (hrms_refresh) when a 401 is returned, then retries the original request.
 *   - If rotation fails, the session is cleared and the user is sent to /login.
 *
 * AuthContext calls this for login/logout; every module service calls it too.
 */

import axios from "axios";
import { useState, useEffect } from "react";

// Global active request tracker for UI progress bars & spinners
let activeRequestsCount = 0;
const emitLoadingChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("hrms:loading", {
        detail: {
          isLoading: activeRequestsCount > 0,
          count: activeRequestsCount,
        },
      })
    );
  }
};

export const useIsApiLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      setIsLoading(Boolean(e.detail?.isLoading));
    };
    window.addEventListener("hrms:loading", handler);
    return () => window.removeEventListener("hrms:loading", handler);
  }, []);
  return isLoading;
};

export const getDefaultApiUrl = () => {
  const saved = localStorage.getItem("hrms_api_url");
  if (saved && saved.trim() && !saved.includes("localhost") && !saved.includes("10.226.189.152")) {
    return saved.trim();
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes("localhost") && !envUrl.includes("10.226.189.152")) {
    return envUrl.trim();
  }

  // Default to live Render cloud backend
  return "https://hrms-backend-qjfb.onrender.com/api";
};

export const setCustomApiUrl = (url) => {
  if (!url || !url.trim()) {
    localStorage.removeItem("hrms_api_url");
    api.defaults.baseURL = getDefaultApiUrl();
  } else {
    let clean = url.trim();
    if (!clean.endsWith("/api") && !clean.endsWith("/api/")) {
      clean = clean.replace(/\/+$/, "") + "/api";
    }
    localStorage.setItem("hrms_api_url", clean);
    api.defaults.baseURL = clean;
  }
};

const api = axios.create({
  baseURL: getDefaultApiUrl(),
  // 30 s: generous enough for cold-start Docker containers and heavy DB queries.
  // If the backend is genuinely down, users see a friendly message rather than a hang.
  timeout: 30000,
});

// ── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    activeRequestsCount++;
    emitLoadingChange();

    config.baseURL = getDefaultApiUrl();
    const token = localStorage.getItem("hrms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    activeRequestsCount = Math.max(0, activeRequestsCount - 1);
    emitLoadingChange();
    return Promise.reject(error);
  }
);

// ── Response interceptor (silent token refresh on 401) ─────────────────────
let refreshing = null;

async function tryRefresh() {
  const refreshToken = localStorage.getItem("hrms_refresh");
  if (!refreshToken) throw new Error("No refresh token");
  const baseUrl = getDefaultApiUrl();
  const res = await axios.post(`${baseUrl}/auth/refresh`, { refreshToken });
  const { token, refreshToken: newRefresh, permissions } = res.data?.data ?? {};
  if (!token) throw new Error("Refresh failed");
  localStorage.setItem("hrms_token", token);
  if (newRefresh) localStorage.setItem("hrms_refresh", newRefresh);
  if (permissions) localStorage.setItem("hrms_permissions", JSON.stringify(permissions));
  return token;
}

api.interceptors.response.use(
  (response) => {
    activeRequestsCount = Math.max(0, activeRequestsCount - 1);
    emitLoadingChange();
    return response;
  },
  async (error) => {
    activeRequestsCount = Math.max(0, activeRequestsCount - 1);
    emitLoadingChange();

    const original = error.config;

    // Only attempt rotation for real auth failures, once per request.
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      try {
        // Single-flight: concurrent 401s share one refresh call.
        refreshing = refreshing || tryRefresh().finally(() => { refreshing = null; });
        const token = await refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        localStorage.removeItem("hrms_token");
        localStorage.removeItem("hrms_refresh");
        localStorage.removeItem("hrms_role");
        localStorage.removeItem("hrms_permissions");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    // Do NOT expose raw stack traces — re-throw a clean, user-friendly object.
    const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
    const isNetwork = error.code === "ERR_NETWORK" || error.message === "Network Error";

    return Promise.reject({
      status: error.response?.status || 0,
      data: error.response?.data,
      message:
        error.response?.data?.message ||
        (isTimeout ? "Request timed out — the server is taking too long. Please try again." : null) ||
        (isNetwork ? "Cannot reach the server. Check your connection or try again shortly." : null) ||
        error.message ||
        "An unexpected error occurred. Please try again.",
      isTimeout,
      isNetwork,
    });
  }
);

export default api;
