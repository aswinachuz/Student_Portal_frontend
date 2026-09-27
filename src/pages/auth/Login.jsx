import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";
import { getFileUrl } from "../../utils/fileUrl";
import KineticGrid from "../../components/common/KineticGrid";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [schoolSettings, setSchoolSettings] = useState({
    name: "Aswin's Public School",
    logo: "",
  });

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosClient.get("/school-settings");
        if (response.data?.data) {
          setSchoolSettings({
            name: response.data.data.schoolName || "Aswin's Public School",
            logo: response.data.data.logo || "",
          });
        }
      } catch {
        // Fallback to default school settings
      }
    };

    fetchSettings();
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedIn = await login(email, password);
      navigate(`/${loggedIn.role}/dashboard`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Animated Interactive Grid Background matching Dashboard */}
      <KineticGrid />

      {/* Floating Ambient Glow Orbs for Depth */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-cyan-400/5 blur-3xl" />

      {/* Top Right Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      {/* Main Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md animate-entrance">
        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-black/70 sm:p-8">

          {/* School Emblem & Header */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-105">
              {schoolSettings.logo ? (
                <img
                  src={getFileUrl(schoolSettings.logo)}
                  alt="School Logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <GraduationCap size={28} />
              )}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {schoolSettings.name}
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Sign in to access your institutional portal
            </p>

            {/* Portal Badge */}
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-[10px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
              <span>Admin</span>
              <span>•</span>
              <span>Faculty</span>
              <span>•</span>
              <span>Student</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/90 p-3 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">

            {/* Email Field */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Email Address
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={16} />
                </div>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full rounded-lg border border-slate-300 bg-white/90 py-2.5 pr-3.5 pl-9 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Password
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-300 bg-white/90 py-2.5 pr-10 pl-9 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

          </form>

          {/* Security Notice Footer */}
          <div className="mt-6 border-t border-slate-100 pt-3 text-center dark:border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>Institutional Portal • TLS Encrypted Access</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}