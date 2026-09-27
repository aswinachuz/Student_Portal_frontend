import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  School,
  Megaphone,
  CalendarCheck,
  ChevronRight,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import axiosClient from "../../api/axiosClient";
import { formatDateTime } from "../../utils/dateUtils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    counts: {
      students: 0,
      teachers: 0,
      classes: 0,
    },
    recentAnnouncements: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await axiosClient.get("/admin/stats");
        setStats(data);
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const announcementCount =
    stats.recentAnnouncements?.length || 0;

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Administrator Dashboard
        </h1>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Monitor school activity, manage resources, and stay updated with important announcements.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={loading ? "..." : stats.counts.students}
          icon={GraduationCap}
          color="blue"
          trend="Currently enrolled"
        />

        <StatCard
          title="Faculty Teachers"
          value={loading ? "..." : stats.counts.teachers}
          icon={Users}
          color="green"
          trend="Active faculty"
        />

        <StatCard
          title="Total Classes"
          value={loading ? "..." : stats.counts.classes}
          icon={School}
          color="purple"
          trend="Across all sections"
        />

        <StatCard
          title="Announcements"
          value={loading ? "..." : announcementCount}
          icon={Megaphone}
          color="amber"
          trend="Broadcasted updates"
        />
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* QUICK MANAGEMENT SHORTCUTS */}
        <div className="space-y-3 lg:col-span-2">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Administrative Management
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Quick access to school administration and core controls
                </p>
              </div>

              <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                Quick Actions
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">

              <Link
                to="/admin/teachers"
                className="group flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3 transition hover:border-blue-500 hover:bg-blue-50/40 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-400">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      Teacher Management
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Add, update and assign teachers
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/admin/classrooms"
                className="group flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3 transition hover:border-indigo-500 hover:bg-indigo-50/40 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-400">
                    <School size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                      Classes & Sections
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Manage classrooms & class teachers
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/admin/attendance"
                className="group flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3 transition hover:border-amber-500 hover:bg-amber-50/40 dark:border-slate-700 dark:hover:border-amber-500 dark:hover:bg-amber-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-600 transition group-hover:bg-amber-600 group-hover:text-white dark:bg-amber-950 dark:text-amber-400">
                    <CalendarCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 transition group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                      Attendance Correction
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      View and override daily registers
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/admin/announcements"
                className="group flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3 transition hover:border-purple-500 hover:bg-purple-50/40 dark:border-slate-700 dark:hover:border-purple-500 dark:hover:bg-purple-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-100 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-950 dark:text-purple-400">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 transition group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                      Broadcast Notices
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Publish announcements to school
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 transition group-hover:translate-x-0.5" />
              </Link>

            </div>
          </div>
        </div>

        {/* RECENT ANNOUNCEMENTS */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 dark:border-slate-700">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recent Announcements
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Latest updates
              </p>
            </div>

            <Link
              to="/admin/announcements"
              className="text-[10px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {announcementCount === 0 ? (
              <div className="px-4 py-8 text-center">
                <Megaphone size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  No active announcements
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                  Published announcements will show here.
                </p>
              </div>
            ) : (
              stats.recentAnnouncements.slice(0, 4).map((item) => (
                <div
                  key={item._id}
                  className="px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <Megaphone size={14} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xs font-semibold text-slate-800 dark:text-white">
                        {item.title}
                      </h3>

                      <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                        {item.content}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500">
                        <span>By {item.author?.name || "Admin"}</span>
                        {item.createdAt && (
                          <>
                            <span>•</span>
                            <span>{formatDateTime(item.createdAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
