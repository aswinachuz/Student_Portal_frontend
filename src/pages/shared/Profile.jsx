import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  GraduationCap,
  School,
  Lock,
  Camera,
  Pencil,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { getFileUrl } from "../../utils/fileUrl";
import { formatDate } from "../../utils/dateUtils";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    password: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await axiosClient.get("/auth/profile");
      setProfile(response.data);

      setFormData({
        name: response.data.name || "",
        phone: response.data.phone || "",
        dateOfBirth: response.data.dateOfBirth
          ? new Date(response.data.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: response.data.gender || "",
        address: response.data.address || "",
        password: "",
      });

      setPhotoPreview(getFileUrl(response.data.avatar));
    } catch (err) {
      console.error("PROFILE ERROR:", err);
      setError("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be less than 5 MB.");
      return;
    }

    setError("");
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("dateOfBirth", formData.dateOfBirth);
      data.append("gender", formData.gender);
      data.append("address", formData.address);

      if (formData.password.trim()) {
        data.append("password", formData.password);
      }

      if (photo) {
        data.append("avatar", photo);
      }

      const response = await axiosClient.put("/auth/profile", data);
      setProfile(response.data);

      setFormData({
        name: response.data.name || "",
        phone: response.data.phone || "",
        dateOfBirth: response.data.dateOfBirth
          ? new Date(response.data.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: response.data.gender || "",
        address: response.data.address || "",
        password: "",
      });

      setPhoto(null);
      setPhotoPreview(getFileUrl(response.data.avatar));
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setPhoto(null);
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
      dateOfBirth: profile?.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: profile?.gender || "",
      address: profile?.address || "",
      password: "",
    });
    setPhotoPreview(getFileUrl(profile?.avatar));
    setError("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Loading personal profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
        {error || "Profile could not be loaded."}
      </div>
    );
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
          <Shield size={11} />
          Administrator
        </span>
      );
    }
    if (role === "teacher") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
          <GraduationCap size={11} />
          Faculty Member
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
        <School size={11} />
        Enrolled Student
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* ================= HERO PROFILE BANNER ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Cover Gradient Strip */}
        <div className="h-28 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 opacity-90 sm:h-32" />

        {/* Profile Identity Bar */}
        <div className="relative px-5 pb-5 pt-0 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="relative -mt-12 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl font-bold text-white shadow-lg dark:border-slate-900">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}

                {editing && (
                  <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/50 text-white backdrop-blur-[2px] transition hover:bg-black/60">
                    <Camera size={20} />
                    <span className="mt-1 text-[9px] font-medium">Update</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                    {profile.name}
                  </h1>
                  {getRoleBadge(profile.role)}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail size={13} className="text-slate-400" />
                    {profile.email}
                  </span>
                  {(profile.rollNumber || profile.teacherId) && (
                    <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                      ID: {profile.rollNumber || profile.teacherId}
                    </span>
                  )}
                  {profile.classroom && (
                    <span className="flex items-center gap-1">
                      <School size={13} className="text-slate-400" />
                      {profile.classroom.name}
                      {profile.classroom.section
                        ? ` - ${profile.classroom.section}`
                        : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setMessage("");
                    setError("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
                >
                  <Pencil size={13} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    <X size={13} />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Check size={13} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ALERT NOTIFICATIONS */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ================= PROFILE DETAILS GRID ================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* PERSONAL DETAILS (2 COLS) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Personal Information
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Primary identity and personal demographics
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {/* FULL NAME */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <User size={12} className="text-blue-500" />
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                    {profile.name || "-"}
                  </p>
                )}
              </div>

              {/* PHONE */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Phone size={12} className="text-emerald-500" />
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 9876543210"
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                    {profile.phone || "Not specified"}
                  </p>
                )}
              </div>

              {/* DATE OF BIRTH */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Calendar size={12} className="text-purple-500" />
                  Date of Birth
                </label>
                {editing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                    {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : "Not specified"}
                  </p>
                )}
              </div>

              {/* GENDER */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <User size={12} className="text-cyan-500" />
                  Gender
                </label>
                {editing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                    {profile.gender || "Not specified"}
                  </p>
                )}
              </div>

              {/* ADDRESS */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 sm:col-span-2 dark:border-slate-800 dark:bg-slate-800/40">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <MapPin size={12} className="text-rose-500" />
                  Residential Address
                </label>
                {editing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Enter your residential address..."
                    className="mt-1.5 w-full resize-none rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-900 dark:text-white">
                    {profile.address || "No address provided."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY & CREDENTIALS (1 COL) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Account & Security
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Institutional credentials and access
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {/* Institutional ID */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Institutional ID
                </p>
                <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                  {profile.rollNumber || profile.teacherId || "N/A"}
                </p>
              </div>

              {/* Email */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </p>
                <p className="mt-1 truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                  {profile.email}
                </p>
              </div>

              {/* Password Change Option */}
              {editing && (
                <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Lock size={12} className="text-amber-500" />
                    Change Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep unchanged"
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 pr-8 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="mt-1 text-[9px] text-slate-400">
                    Enter at least 6 characters if updating.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
