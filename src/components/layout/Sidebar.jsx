import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  School,
  CalendarCheck,
  Megaphone,
  Award,
  FileText,
  GraduationCap,
  BookOpen,
  Clock,
  UserCircle,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import axiosClient from "../../api/axiosClient";
import { getFileUrl } from "../../utils/fileUrl";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [logo, setLogo] = useState("");
  const fileInputRef = useRef(null);

  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

  // =====================================================
  // GET SCHOOL LOGO
  // =====================================================

  const getSchoolLogo = async () => {
    try {
      const response = await axiosClient.get("/school-settings");

      const schoolLogo = response.data.data?.logo || "";

      setLogo(schoolLogo);
    } catch (error) {
      console.error("Error loading school logo:", error);
    }
  };

  useEffect(() => {
    getSchoolLogo();
  }, []);

  // =====================================================
  // GET UNREAD ANNOUNCEMENTS
  // =====================================================

  const getUnreadAnnouncements = async () => {
    if (user?.role !== "teacher" || !user?._id) {
      setUnreadAnnouncements(0);
      return;
    }

    try {
      const response = await axiosClient.get("/announcements");

      const announcements = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const storageKey = `readAnnouncements_${user._id}`;

      const storedReadIds = localStorage.getItem(storageKey);

      let readIds = [];

      if (storedReadIds) {
        try {
          const parsedIds = JSON.parse(storedReadIds);

          if (Array.isArray(parsedIds)) {
            readIds = parsedIds;
          }
        } catch (storageError) {
          console.error(
            "READ ANNOUNCEMENT STORAGE ERROR:",
            storageError
          );

          readIds = [];
        }
      }

      const unreadCount = announcements.filter(
        (announcement) => !readIds.includes(announcement._id)
      ).length;

      setUnreadAnnouncements(unreadCount);
    } catch (error) {
      console.error(
        "Error loading unread announcements:",
        error
      );

      setUnreadAnnouncements(0);
    }
  };

  // =====================================================
  // LOAD UNREAD COUNT
  // =====================================================

  useEffect(() => {
    getUnreadAnnouncements();

    const handleAnnouncementRead = () => {
      getUnreadAnnouncements();
    };

    window.addEventListener(
      "announcementRead",
      handleAnnouncementRead
    );

    return () => {
      window.removeEventListener(
        "announcementRead",
        handleAnnouncementRead
      );
    };
  }, [user?._id, user?.role]);

  // =====================================================
  // LOGO URL
  // =====================================================

  const getLogoUrl = () => {
    return getFileUrl(logo);
  };

  // =====================================================
  // ADMIN - CHANGE LOGO
  // =====================================================

  const handleLogoChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const formData = new FormData();

    formData.append("logo", file);

    try {
      const response = await axiosClient.put(
        "/school-settings/logo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newLogo = response.data.data?.logo || "";

      setLogo(newLogo);

      toast.success("School logo updated successfully.");
    } catch (error) {
      console.error("Logo upload error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to upload school logo."
      );
    }

    event.target.value = "";
  };

  // =====================================================
  // ADMIN - REMOVE LOGO
  // =====================================================

  const removeLogo = async () => {
    const confirmRemove = await confirm({
      title: "Remove Logo",
      message: "Are you sure you want to remove the school logo?",
      confirmText: "Remove",
      cancelText: "Cancel"
    });

    if (!confirmRemove) {
      return;
    }

    try {
      await axiosClient.delete("/school-settings/logo");

      setLogo("");

      toast.success("School logo removed.");
    } catch (error) {
      console.error("Remove logo error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to remove school logo."
      );
    }
  };

  // =====================================================
  // SIDEBAR LINKS
  // =====================================================

  const links = [
    // COMMON
    {
      name: "Dashboard",
      path: `/${user?.role}/dashboard`,
      icon: LayoutDashboard,
    },

    // ADMIN
    {
      name: "Teacher Management",
      path: "/admin/teachers",
      roles: ["admin"],
      icon: Users,
    },
    {
      name: "Classes & Sections",
      path: "/admin/classrooms",
      roles: ["admin"],
      icon: School,
    },
    {
      name: "Attendance Correction",
      path: "/admin/attendance",
      roles: ["admin"],
      icon: CalendarCheck,
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
      roles: ["admin"],
      icon: Megaphone,
    },

    // TEACHER
    {
      name: "Marks & Grades",
      path: "/marks",
      roles: ["teacher"],
      icon: Award,
    },
    {
      name: "Attendance",
      path: "/attendance",
      roles: ["teacher"],
      icon: CalendarCheck,
    },
    {
      name: "Assignments",
      path: "/teacher/assignments",
      roles: ["teacher"],
      icon: FileText,
    },
    {
      name: "Student Management",
      path: "/teacher/students",
      roles: ["teacher"],
      icon: GraduationCap,
    },
    {
      name: "Announcements",
      path: "/teacher/announcements",
      roles: ["teacher"],
      icon: Megaphone,
    },
    {
      name: "Subject Management",
      path: "/teacher/subjects",
      roles: ["teacher"],
      icon: BookOpen,
    },
    {
      name: "Timetable",
      path: "/teacher/timetable",
      roles: ["teacher"],
      icon: Clock,
    },

    // STUDENT
    {
      name: "Marks & Grades",
      path: "/student/marks",
      roles: ["student"],
      icon: Award,
    },
    {
      name: "Attendance",
      path: "/student/attendance",
      roles: ["student"],
      icon: CalendarCheck,
    },
    {
      name: "Assignments",
      path: "/student/assignments",
      roles: ["student"],
      icon: FileText,
    },
    {
      name: "Timetable",
      path: "/student/timetable",
      roles: ["student"],
      icon: Clock,
    },

    // COMMON
    {
      name: "Profile Settings",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  // =====================================================
  // FILTER LINKS BY ROLE
  // =====================================================

  const visibleLinks = links.filter(
    (link) =>
      !link.roles ||
      link.roles.includes(user?.role)
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 transform border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 transition-transform duration-200 ease-in-out dark:border-slate-700 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* =================================================
            SIDEBAR HEADER
        ================================================= */}

        <div className="flex h-[52px] items-center gap-2 border-b border-slate-200 dark:border-slate-700 px-3 dark:border-slate-700">

          {/* SCHOOL LOGO */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">

            {logo ? (
              <img
                src={getLogoUrl()}
                alt="School Logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                LOGO
              </span>
            )}

          </div>

          {/* SCHOOL NAME */}
          <div className="min-w-0 flex-1">

            <h1 className="truncate text-xs font-bold text-slate-800 dark:text-white">
              Aswin's Public School
            </h1>

            {/* ADMIN LOGO CONTROLS */}
            {user?.role === "admin" && (
              <div className="mt-0.5 flex items-center gap-1.5">

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="text-[9px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:text-blue-400"
                >
                  {logo ? "Change" : "Upload"}
                </button>

                {logo && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-[9px] font-medium text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    Remove
                  </button>
                )}

              </div>
            )}

          </div>

          {/* HIDDEN FILE INPUT */}
          {user?.role === "admin" && (
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />
          )}

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="space-y-0.5 p-2.5">

          {visibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={`${link.name}-${link.path}`}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-50/90 dark:bg-blue-950/60 font-semibold text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  }`
                }
              >
                {Icon && (
                  <Icon
                    size={16}
                    className="shrink-0 transition-transform group-hover:scale-110"
                  />
                )}

                <span className="min-w-0 flex-1 truncate">
                  {link.name}
                </span>

                {/* TEACHER UNREAD ANNOUNCEMENT BADGE */}
                {link.name === "Announcements" &&
                  link.roles?.includes("teacher") &&
                  user?.role === "teacher" &&
                  unreadAnnouncements > 0 && (
                    <span className="ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                      {unreadAnnouncements}
                    </span>
                  )}
              </NavLink>
            );
          })}

        </nav>

      </aside>
    </>
  );
}