import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  BookOpen,
  Award,
  Megaphone,
  Clock,
  FileText,
  Calendar,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/common/StatCard";
import { formatDate, formatDateTime } from "../../utils/dateUtils";

export default function StudentDashboard() {
  const { user } = useAuth();

  const [marks, setMarks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [marksRes, assignmentsRes, attendanceRes, announcementsRes] =
          await Promise.allSettled([
            axiosClient.get("/marks"),
            axiosClient.get("/assignments"),
            axiosClient.get("/attendance"),
            axiosClient.get("/announcements"),
          ]);

        if (!isMounted) return;

        if (marksRes.status === "fulfilled") {
          setMarks(marksRes.value.data.data || []);
        } else {
          console.error("Error fetching marks:", marksRes.reason);
        }

        if (assignmentsRes.status === "fulfilled") {
          setAssignments(assignmentsRes.value.data || []);
        } else {
          console.error("Error fetching assignments:", assignmentsRes.reason);
        }

        if (attendanceRes.status === "fulfilled") {
          setAttendance(attendanceRes.value.data || []);
        } else {
          console.error("Error fetching attendance:", attendanceRes.reason);
        }

        if (announcementsRes.status === "fulfilled") {
          const aData = Array.isArray(announcementsRes.value.data?.data)
            ? announcementsRes.value.data.data
            : [];
          setAnnouncements(aData);
        } else {
          console.error("Error fetching announcements:", announcementsRes.reason);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // =====================================================
  // ATTENDANCE CALCULATIONS (MEMOIZED SINGLE-PASS)
  // =====================================================

  const {
    presentCount,
    dutyLeaveCount,
    absentCount,
    attendedCount,
    attendancePercentage,
  } = useMemo(() => {
    let present = 0;
    let absent = 0;
    let duty = 0;

    for (const record of attendance) {
      if (record.status === "Present") present++;
      else if (record.status === "Absent") absent++;
      else if (record.status === "Duty Leave") duty++;
    }

    const attended = present + duty;
    const pct =
      attendance.length > 0
        ? Math.round((attended / attendance.length) * 100)
        : 0;

    return {
      presentCount: present,
      absentCount: absent,
      dutyLeaveCount: duty,
      attendedCount: attended,
      attendancePercentage: pct,
    };
  }, [attendance]);

  // Overall Average Score from marks
  const averageGradeScore = useMemo(() => {
    if (!marks.length) return null;
    let totalObt = 0;
    let totalMax = 0;
    marks.forEach((m) => {
      const obt = Number(m.marksObtained);
      const max = Number(m.maxMarks);
      if (!isNaN(obt) && !isNaN(max) && max > 0) {
        totalObt += obt;
        totalMax += max;
      }
    });
    return totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : null;
  }, [marks]);

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Loading student dashboard...
        </p>
      </div>
    );
  }

  const getGradeBadge = (grade) => {
    if (!grade) return null;
    const g = grade.toUpperCase();
    if (g.startsWith("A")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    }
    if (g.startsWith("B")) {
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
    }
    if (g.startsWith("C")) {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    }
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
  };

  const getAttendanceStatusBadge = (status) => {
    if (status === "Present") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 size={11} />
          Present
        </span>
      );
    }
    if (status === "Duty Leave") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
          <Sparkles size={11} />
          Duty Leave
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
        <XCircle size={11} />
        Absent
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* ================= HERO GREETING BANNER ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-transparent p-5 dark:border-slate-800/80 dark:bg-slate-900/60 dark:from-blue-950/40 dark:via-indigo-950/20">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
                <GraduationCap size={12} />
                Student Portal
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Welcome back, {user?.name || "Student"}! 👋
            </h1>

            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              Track your attendance, manage upcoming assignments, and inspect academic scores.
            </p>
          </div>

          {/* Quick Academic Status Pill */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl border border-slate-200/90 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Overall Attendance
              </p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-extrabold ${
                    attendancePercentage >= 75
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {attendancePercentage}%
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {attendancePercentage >= 75 ? "• Healthy" : "• Low"}
                </span>
              </div>
            </div>

            {averageGradeScore !== null && (
              <div className="rounded-xl border border-slate-200/90 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Avg. Score
                </p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {averageGradeScore}%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    • Graded
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= 4 KEY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Attendance Rate"
          value={`${attendancePercentage}%`}
          icon={CalendarCheck}
          color={attendancePercentage >= 75 ? "emerald" : "amber"}
          trend={`${attendedCount} of ${attendance.length} days`}
          trendColor={
            attendancePercentage >= 75
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }
        />

        <StatCard
          title="My Assignments"
          value={assignments.length}
          icon={BookOpen}
          color="blue"
          trend="Current coursework"
          trendColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Exam Records"
          value={marks.length}
          icon={Award}
          color="purple"
          trend="Graded assessments"
          trendColor="text-purple-600 dark:text-purple-400"
        />

        <StatCard
          title="Announcements"
          value={announcements.length}
          icon={Megaphone}
          color="amber"
          trend="Institutional notices"
          trendColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* ================= QUICK ACTION NAVIGATION ================= */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Student Quick Navigation
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Access your timetable, attendance records, exam results, and assignments
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Portals
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/student/timetable"
            className="group flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-indigo-500 hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                  Weekly Timetable
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Class periods & subjects
                </p>
              </div>
            </div>
            <ChevronRight
              size={15}
              className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600"
            />
          </Link>

          <Link
            to="/student/assignments"
            className="group flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  Assignments
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Due tasks & homework
                </p>
              </div>
            </div>
            <ChevronRight
              size={15}
              className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
            />
          </Link>

          <Link
            to="/student/attendance"
            className="group flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-emerald-500 hover:bg-emerald-50/30 dark:border-slate-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                  Attendance Record
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Monthly log & percentage
                </p>
              </div>
            </div>
            <ChevronRight
              size={15}
              className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
            />
          </Link>

          <Link
            to="/student/marks"
            className="group flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-purple-500 hover:bg-purple-50/30 dark:border-slate-800 dark:hover:border-purple-500 dark:hover:bg-purple-950/20"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                  Exam Results
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Grades & faculty remarks
                </p>
              </div>
            </div>
            <ChevronRight
              size={15}
              className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-purple-600"
            />
          </Link>
        </div>
      </div>

      {/* ================= ANNOUNCEMENTS / BULLETINS ================= */}
      {announcements.length > 0 && (
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Megaphone size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  School Announcements
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Recent updates and notices from the administration
                </p>
              </div>
            </div>

            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              {announcements.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {announcements.slice(0, 2).map((announcement) => (
              <div
                key={announcement._id}
                className="relative rounded-lg border border-slate-200/80 bg-slate-50/60 p-3.5 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  {announcement.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {announcement.content}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>
                    By:{" "}
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {announcement.author?.name || "School Administration"}
                    </span>
                  </span>
                  <span>{formatDateTime(announcement.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MAIN TWO-COLUMN SECTION ================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* LEFT COLUMN: ATTENDANCE DEEP DIVE */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CalendarCheck size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Attendance Summary
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Breakdown of logged attendance sessions
                  </p>
                </div>
              </div>

              <Link
                to="/student/attendance"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View Full Log
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {/* Attendance Progress Meter */}
            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Attendance Progress
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {attendancePercentage}%
                </span>
              </div>

              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    attendancePercentage >= 75
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, attendancePercentage)}%` }}
                />
              </div>

              <div className="mt-1.5 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span>0%</span>
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Target: 75%
                </span>
                <span>100%</span>
              </div>
            </div>

            {/* Attendance Category Cards */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-2.5 text-center dark:border-emerald-900/30 dark:bg-emerald-950/20">
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Present
                </p>
                <p className="mt-0.5 text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {presentCount}
                </p>
              </div>

              <div className="rounded-lg border border-cyan-100 bg-cyan-50/40 p-2.5 text-center dark:border-cyan-900/30 dark:bg-cyan-950/20">
                <p className="text-[10px] font-medium text-cyan-600 dark:text-cyan-400">
                  Duty Leave
                </p>
                <p className="mt-0.5 text-lg font-bold text-cyan-700 dark:text-cyan-300">
                  {dutyLeaveCount}
                </p>
              </div>

              <div className="rounded-lg border border-rose-100 bg-rose-50/40 p-2.5 text-center dark:border-rose-900/30 dark:bg-rose-950/20">
                <p className="text-[10px] font-medium text-rose-600 dark:text-rose-400">
                  Absent
                </p>
                <p className="mt-0.5 text-lg font-bold text-rose-700 dark:text-rose-300">
                  {absentCount}
                </p>
              </div>
            </div>

            {/* Recent Attendance Entries */}
            <div className="mt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Recent Records
              </p>

              {attendance.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400">
                  No attendance records logged yet.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                      <tr>
                        <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Date
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {attendance.slice(0, 5).map((record) => (
                        <tr
                          key={record._id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {getAttendanceStatusBadge(record.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ASSIGNMENTS & MARKS */}
        <div className="space-y-4">
          {/* UPCOMING ASSIGNMENTS */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Class Assignments
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Assigned coursework and homework tasks
                  </p>
                </div>
              </div>

              <Link
                to="/student/assignments"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View All ({assignments.length})
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              {assignments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                  <p className="text-xs text-slate-400">No active assignments</p>
                </div>
              ) : (
                assignments.slice(0, 3).map((assignment) => (
                  <div
                    key={assignment._id}
                    className="group rounded-lg border border-slate-200/80 p-3 transition hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-500"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                          {assignment.subject?.name || "Subject"}
                        </span>
                        <h3 className="mt-1 text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {assignment.title}
                        </h3>
                        {assignment.description && (
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {assignment.description}
                          </p>
                        )}
                      </div>

                      {assignment.dueDate && (
                        <div className="shrink-0 text-right">
                          <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <Clock size={10} />
                            Due: {formatDate(assignment.dueDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECENT MARKS */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Award size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Examination Results
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Recent grades and teacher assessments
                  </p>
                </div>
              </div>

              <Link
                to="/student/marks"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                All Marks ({marks.length})
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="mt-3">
              {marks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                  <p className="text-xs text-slate-400">No marks recorded yet</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                      <tr>
                        <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Subject / Exam
                        </th>
                        <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Score
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {marks.slice(0, 4).map((mark) => (
                        <tr
                          key={mark._id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-3 py-2">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {mark.subject?.name || mark.subject || "Subject"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {mark.examType || "Assessment"}
                            </p>
                          </td>
                          <td className="px-3 py-2 text-center font-medium text-slate-700 dark:text-slate-300">
                            {mark.marksObtained} / {mark.maxMarks}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${getGradeBadge(
                                mark.grade
                              )}`}
                            >
                              {mark.grade || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
