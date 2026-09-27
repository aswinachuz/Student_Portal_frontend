import React, { useEffect, useState } from "react";
import { Moon, Sun, Menu, LogOut, Shield, GraduationCap, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
  };

  const getRoleIcon = () => {
    if (user?.role === "admin") return <Shield size={12} className="text-amber-500" />;
    if (user?.role === "teacher") return <UserCheck size={12} className="text-emerald-500" />;
    return <GraduationCap size={12} className="text-blue-500" />;
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-[54px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/85 px-3.5 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85 sm:px-5">
      {/* Left Side */}
      <div className="flex items-center gap-2.5 min-w-0">
        {toggleSidebar && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            title="Toggle Menu"
          >
            <Menu size={19} />
          </button>
        )}

        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">
            Student Portal
          </h2>
          <p className="hidden text-[10px] text-slate-500 dark:text-slate-400 sm:block">
            School Management System
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {darkMode ? (
            <Sun size={16} strokeWidth={2} />
          ) : (
            <Moon size={16} strokeWidth={2} />
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/70 py-1 pl-1.5 pr-2.5 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
            {initials}
          </div>

          <div className="hidden text-left sm:block">
            <p className="max-w-[130px] truncate text-xs font-semibold leading-none text-slate-900 dark:text-white">
              {user?.name || "User"}
            </p>
            <div className="mt-0.5 flex items-center gap-1">
              {getRoleIcon()}
              <span className="text-[10px] capitalize leading-none text-slate-500 dark:text-slate-400">
                {user?.role || ""}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}