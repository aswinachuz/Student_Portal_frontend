import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axiosClient from "../api/axiosClient";
import { getFileUrl } from "../utils/fileUrl";

const SchoolSettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  schoolName: "Manchester Public School",
  logo: "/school-logo.png",
};

const STORAGE_KEY = "school_settings_cache";

const normalizeSchoolName = (name) => {
  if (!name) return DEFAULT_SETTINGS.schoolName;
  if (name.toLowerCase().includes("aswin") || name === "Manchester International School") {
    return DEFAULT_SETTINGS.schoolName;
  }
  return name;
};

export const SchoolSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          schoolName: normalizeSchoolName(parsed.schoolName),
          logo: parsed.logo || DEFAULT_SETTINGS.logo,
        };
      }
    } catch {
      // Fallback to defaults
    }
    return DEFAULT_SETTINGS;
  });

  const fetchSettings = useCallback(async () => {
    try {
      const response = await axiosClient.get("/school-settings");
      if (response.data?.data) {
        const remoteLogo = response.data.data.logo;
        const newSettings = {
          schoolName: normalizeSchoolName(response.data.data.schoolName),
          logo: remoteLogo ? getFileUrl(remoteLogo) : DEFAULT_SETTINGS.logo,
        };
        setSettings(newSettings);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch {
          // ignore localStorage error
        }
      }
    } catch (error) {
      console.warn("Could not refresh school settings from server:", error?.message);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateLocalSettings = useCallback((newPartialSettings) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newPartialSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  }, []);

  const value = useMemo(
    () => ({
      schoolName: settings.schoolName,
      logo: settings.logo,
      refreshSettings: fetchSettings,
      updateLocalSettings,
      defaultLogo: DEFAULT_SETTINGS.logo,
    }),
    [settings, fetchSettings, updateLocalSettings]
  );

  return (
    <SchoolSettingsContext.Provider value={value}>
      {children}
    </SchoolSettingsContext.Provider>
  );
};

export const useSchoolSettings = () => {
  const context = useContext(SchoolSettingsContext);
  if (!context) {
    return {
      schoolName: DEFAULT_SETTINGS.schoolName,
      logo: DEFAULT_SETTINGS.logo,
      refreshSettings: () => {},
      updateLocalSettings: () => {},
      defaultLogo: DEFAULT_SETTINGS.logo,
    };
  }
  return context;
};

export default SchoolSettingsContext;
