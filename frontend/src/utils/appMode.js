import { Capacitor } from "@capacitor/core";

/**
 * Checks whether the application is running inside the native Android/iOS APK container.
 */
export const isNativeApp = () => {
  try {
    return typeof window !== "undefined" && Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

/**
 * Checks whether the current device is a mobile phone or tablet screen.
 */
export const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  const isSmallScreen = window.innerWidth <= 768;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  return isSmallScreen || isMobileUA;
};

/**
 * Get stored view mode preference ('app' | 'desktop')
 */
export const getStoredViewMode = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("snmr_view_mode");
  } catch {
    return null;
  }
};

/**
 * Store view mode preference and notify listeners
 */
export const setStoredViewMode = (mode) => {
  try {
    localStorage.setItem("snmr_view_mode", mode);
    window.dispatchEvent(new CustomEvent("snmr-view-mode-change", { detail: mode }));
  } catch {}
};

/**
 * Determines whether the Mobile App interface should be displayed.
 *
 * Rules:
 * 1. Running inside Native APK (Capacitor): ALWAYS App Mode by default.
 *    (Only switches to desktop if user explicitly taps 'Desktop View' during this session).
 * 2. Running on Mobile Screen / Phone: App Mode by default unless user explicitly chose 'desktop'.
 * 3. Running on Desktop browser: Desktop Mode by default unless user chose 'app' (e.g. testing app).
 */
export const shouldShowAppMode = () => {
  if (typeof window === "undefined") return false;

  const native = isNativeApp();
  const stored = getStoredViewMode();

  // Inside Android APK
  if (native) {
    return stored !== "desktop";
  }

  // On Mobile Device / Small Screen
  const mobile = isMobileDevice();
  if (mobile) {
    return stored !== "desktop";
  }

  // On Desktop Screen (> 768px)
  return stored === "app";
};
