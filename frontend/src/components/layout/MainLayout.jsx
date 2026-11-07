/**
 * MainLayout
 * Wraps every authenticated page with Sidebar + Navbar.
 *
 * Responsiveness:
 *   - Desktop (>768px): Sidebar sits to the left, content takes remaining width.
 *   - Mobile (≤768px): Sidebar renders as an overlay. A backdrop closes it.
 *
 * sidebarOpen state is lifted here so Navbar's toggle button and Sidebar
 * both read from the same source.
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAppMode } from "../../hooks/useAppMode";
import { useIsApiLoading } from "../../services/api";

const SIDEBAR_STORAGE_KEY = "proteccio_sidebar_open";

export default function MainLayout({ children }) {
  const { isMobile: isDeviceMobile, switchMode } = useAppMode();
  const location = useLocation();
  const isApiLoading = useIsApiLoading();
  const [isNavigating, setIsNavigating] = useState(false);

  // Trigger top loading bar whenever user navigates or route changes
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  const showGlobalLoading = isNavigating || isApiLoading;

  // Load sidebar open state from localStorage, default to true on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) return JSON.parse(stored);
    } catch {}
    return window.innerWidth > 768;
  });

  // Track whether we're on a mobile-sized screen
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-close sidebar when resizing to mobile
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Persist sidebar open state
  useEffect(() => {
    if (!isMobile) {
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(sidebarOpen));
      } catch {}
    }
  }, [sidebarOpen, isMobile]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar  = () => setSidebarOpen(false);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--background)", overflow: "hidden", position: "relative" }}>

      {/* ── Desktop Global Top Progress Loading Bar ── */}
      {showGlobalLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "3.5px",
            zIndex: 99999,
            overflow: "hidden",
            background: "rgba(15, 118, 110, 0.12)",
            pointerEvents: "none",
          }}
        >
          <div
            className="hrms-top-progress-bar"
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #0d9488, #2dd4bf, #0f766e)",
              borderRadius: "0 3px 3px 0",
              boxShadow: "0 0 10px rgba(45, 212, 191, 0.9)",
            }}
          />
        </div>
      )}

      {/* ── Mobile overlay backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(13,27,42,0.5)",
            backdropFilter: "blur(2px)",
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <div style={{
        // On mobile, position the sidebar absolutely so it overlays content
        position: isMobile ? "fixed" : "relative",
        zIndex: isMobile ? 50 : "auto",
        top: 0, left: 0, height: "100vh",
        // Slide the sidebar off-screen when closed on mobile
        transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <Sidebar isOpen={isMobile ? true : sidebarOpen} />
      </div>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

        {/* ── Quick Switch Banner on Mobile Screens ── */}
        {(isMobile || isDeviceMobile) && (
          <div style={{
            background: "linear-gradient(90deg, #0f766e, #0d9488)",
            color: "#ffffff",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            zIndex: 30,
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🖥️ Desktop View Active</span>
            </div>
            <button
              onClick={() => {
                switchMode("app");
                window.location.href = "/";
              }}
              style={{
                background: "#ffffff",
                color: "#0f766e",
                border: "none",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
            >
              📱 Switch to App Mode ⚡
            </button>
          </div>
        )}

        <main style={{
          flex: 1,
          background: "var(--background)",
          padding: isMobile ? "14px 16px" : "28px 32px",
          overflowY: "auto",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
