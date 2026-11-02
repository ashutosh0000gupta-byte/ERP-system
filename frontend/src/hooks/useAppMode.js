import { useState, useEffect, useCallback } from "react";
import {
  shouldShowAppMode,
  setStoredViewMode,
  isNativeApp,
  isMobileDevice,
  getStoredViewMode,
} from "../utils/appMode";

export function useAppMode() {
  const [isAppMode, setIsAppMode] = useState(shouldShowAppMode);
  const [isNative, setIsNative] = useState(isNativeApp);
  const [isMobile, setIsMobile] = useState(isMobileDevice);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
      setIsAppMode(shouldShowAppMode());
    };

    const handleCustomChange = (e) => {
      const mode = e.detail;
      setIsAppMode(mode === "app");
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("snmr-view-mode-change", handleCustomChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("snmr-view-mode-change", handleCustomChange);
    };
  }, []);

  const switchMode = useCallback((mode) => {
    setStoredViewMode(mode);
    setIsAppMode(mode === "app");
  }, []);

  return {
    isAppMode,
    isNative,
    isMobile,
    switchMode,
    storedPreference: getStoredViewMode(),
  };
}
