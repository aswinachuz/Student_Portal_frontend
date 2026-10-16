import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

export default function CapacitorManager() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Hide splash screen smoothly on app load
    SplashScreen.hide().catch(() => {});

    // Setup hardware back button handling on Android
    let backListener;
    const setupBackButton = async () => {
      backListener = await CapApp.addListener("backButton", ({ canGoBack }) => {
        const rootPaths = [
          "/login",
          "/student/dashboard",
          "/teacher/dashboard",
          "/admin/dashboard",
        ];

        if (rootPaths.includes(location.pathname)) {
          CapApp.exitApp();
        } else if (canGoBack || window.history.length > 1) {
          navigate(-1);
        } else {
          CapApp.exitApp();
        }
      });
    };

    setupBackButton();

    return () => {
      if (backListener?.remove) {
        backListener.remove();
      }
    };
  }, [location.pathname, navigate]);

  // Sync status bar with theme if on native mobile
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const isDark = document.documentElement.classList.contains("dark");
    StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    }).catch(() => {});

    StatusBar.setBackgroundColor({
      color: isDark ? "#0f172a" : "#f8fafc",
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}
