import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  BookOpen,
  Award,
  GraduationCap,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  School,
  Megaphone,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/common/StatCard";
import AnnouncementToast from "../../components/common/AnnouncementToast";
import { getTodayDate, formatDate } from "../../utils/dateUtils";

export default function TeacherDashboard() {
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState(null);
  const [classroom, setClassroom] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. GET TEACHER ASSIGNMENTS
      const assignmentResponse = await axiosClient.get("/teaching-assignments");
      const assignmentData = assignmentResponse.data || {};
      const classTeacherClassroom = assignmentData.classTeacherClassroom || null;
      const assignedClassrooms = Array.isArray(assignmentData.classrooms)
        ? assignmentData.classrooms
        : [];

      let selectedClassroom = classTeacherClassroom;
      if (!selectedClassroom?._id) {
        selectedClassroom = assignedClassrooms[0] || null;
      }

      if (!selectedClassroom?._id) {
        setClassroom(null);
        setStudents([]);
      } else {
        setClassroom(selectedClassroom);
      }

      // Parallelize remaining requests
      const today = getTodayDate();
      const [
        studentsRes,
        marksRes,
        attendanceRes,
        submissionRes,
        announcementRes,
      ] = await Promise.allSettled([
        axiosClient.get("/teacher/students"),
        axiosClient.get("/marks?limit=1000"),
        selectedClassroom?._id
          ? axiosClient.get("/attendance", {
              params: {
                classroomId: selectedClassroom._id,
                startDate: today,
                endDate: today,
              },
            })
          : Promise.resolve({ data: [] }),
        axiosClient.get("/submissions/pending"),
        axiosClient.get("/announcements"),
      ]);

      // Parse Students
      if (studentsRes.status === "fulfilled") {
        const responseData = studentsRes.value.data || {};
        const allStudents = Array.isArray(responseData.data)
          ? responseData.data
          : Array.isArray(responseData.students)
          ? responseData.students
          : [];

        if (selectedClassroom?._id) {
          const classStudents = allStudents.filter((student) => {
            const studentClassroom =
              student.classroom?._id || student.classroom;
            return (
              studentClassroom?.toString() === selectedClassroom._id.toString()
            );
          });
          setStudents(classStudents);
        } else {
          setStudents(allStudents);
        }
      } else {
        console.error("STUDENT DASHBOARD ERROR:", studentsRes.reason);
        setStudents([]);
      }

      // Parse Marks
      if (marksRes.status === "fulfilled") {
        const marksData = Array.isArray(marksRes.value.data?.data)
          ? marksRes.value.data.data
          : [];
        setMarks(marksData);
      } else {
        console.error("MARKS DASHBOARD ERROR:", marksRes.reason);
        setMarks([]);
      }

      // Parse Attendance
      if (attendanceRes.status === "fulfilled") {
        const resData = attendanceRes.value.data;
        const attendanceData = Array.isArray(resData)
          ? resData
          : Array.isArray(resData?.data)
          ? resData.data
          : [];
        setAttendance(attendanceData);
      } else {
        console.error("ATTENDANCE DASHBOARD ERROR:", attendanceRes.reason);
        setAttendance([]);
      }

      // Parse Pending Submissions
      if (submissionRes.status === "fulfilled") {
        const submissionData = Array.isArray(submissionRes.value.data?.data)
          ? submissionRes.value.data.data
          : [];
        setPendingSubmissions(submissionData);
      } else {
        console.error("SUBMISSION DASHBOARD ERROR:", submissionRes.reason);
        setPendingSubmissions([]);
      }

      // Parse Announcements
      if (announcementRes.status === "fulfilled") {
        const aData = announcementRes.value.data;
        const announcementData = Array.isArray(aData?.data)
          ? aData.data
          : Array.isArray(aData)
          ? aData
          : [];
        setNewAnnouncement(announcementData.length > 0 ? announcementData[0] : null);
      } else {
        console.error("ANNOUNCEMENT DASHBOARD ERROR:", announcementRes.reason);
        setNewAnnouncement(null);
      }
    } catch (err) {
      console.error("TEACHER DASHBOARD ERROR:", err);
      setError(
        err.response?.data?.message || "Unable to load teacher dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Attendance metrics
  const today = getTodayDate();
  const todayAttendance = useMemo(() => {
    return attendance.filter((item) => {
      if (!item.date) return false;
      const attendanceDate = new Date(item.date).toISOString().split("T")[0];
      return attendanceDate === today;
    });
  }, [attendance, today]);

  const presentToday = useMemo(() => {
    return todayAttendance.filter(
      (item) => item.status === "Present" || item.status === "Duty Leave"
    ).length;
  }, [todayAttendance]);

  const absentToday = useMemo(() => {
    return todayAttendance.filter((item) => item.status === "Absent").length;
  }, [todayAttendance]);

  const attendanceTotalMarked = presentToday + absentToday;
  const attendanceRate =
    attendanceTotalMarked > 0
      ? Math.round((presentToday / attendanceTotalMarked) * 100)
      : students.length > 0 && presentToday > 0
      ? Math.round((presentToday / students.length) * 100)
      : 0;

  // Student demographics
  const boys = useMemo(() => {
    return students.filter((s) => s.gender === "Male").length;
  }, [students]);

  const girls = useMemo(() => {
    return students.filter((s) => s.gender === "Female").length;
  }, [students]);

  // Exam marks calculations
  const { firstTerm, midterm, final, firstTermPct, midtermPct, finalPct } =
    useMemo(() => {
      const calcPct = (list) => {
        if (!list.length) return 0;
        let obt = 0;
        let max = 0;
        list.forEach((m) => {
          obt += Number(m.marksObtained || 0);
          max += Number(m.maxMarks || 0);
        });
        return max > 0 ? Math.round((obt / max) * 100) : 0;
      };

      const ft = marks.filter((m) => m.examType === "first_term");
      const mt = marks.filter((m) => m.examType === "Midterm");
      const fn = marks.filter((m) => m.examType === "Final");

      return {
        firstTerm: ft,
        midterm: mt,
        final: fn,
        firstTermPct: calcPct(ft),
        midtermPct: calcPct(mt),
        finalPct: calcPct(fn),
      };
    }, [marks]);

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Loading faculty dashboard...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* NEW ANNOUNCEMENT POPUP TOAST */}
      <AnnouncementToast
        announcement={newAnnouncement}
        onClose={() => setNewAnnouncement(null)}
        onView={() => {
          window.location.href = "/teacher/announcements";
        }}
      />

      <div className="space-y-4">
        {/* ================= HERO GREETING BANNER ================= */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-transparent p-5 dark:border-slate-800/80 dark:bg-slate-900/60 dark:from-blue-950/40 dark:via-indigo-950/20">
          <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
                  <School size={12} />
                  Faculty Management
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
                Welcome back, {user?.name || "Teacher"}! 👨‍🏫
              </h1>

              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                Monitor classroom attendance, evaluate coursework, and review examination grades.
              </p>
            </div>

            {/* Classroom Info Pill */}
            <div className="flex shrink-0 items-center gap-2">
              {classroom ? (
                <div className="rounded-xl border border-blue-200/80 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-sm dark:border-blue-900/50 dark:bg-slate-900/95">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Assigned Class
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                    {classroom.name}
                    {classroom.section ? ` - Sec ${classroom.section}` : ""}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Role
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                    Subject Faculty
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ================= 4 KEY STAT CARDS ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Class Students"
            value={students.length}
            icon={Users}
            color="blue"
            trend={`${boys} Boys • ${girls} Girls`}
            trendColor="text-blue-600 dark:text-blue-400"
          />

          <StatCard
            title="Present Today"
            value={presentToday}
            icon={UserCheck}
            color="emerald"
            trend={
              absentToday > 0
                ? `${absentToday} absent today`
                : "All students present"
            }
            trendColor={
              absentToday > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
            }
          />

          <StatCard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            icon={CalendarCheck}
            color={attendanceRate >= 75 ? "cyan" : "amber"}
            trend="Today's attendance"
            trendColor={
              attendanceRate >= 75
                ? "text-cyan-600 dark:text-cyan-400"
                : "text-amber-600 dark:text-amber-400"
            }
          />

          <StatCard
            title="Pending Reviews"
            value={pendingSubmissions.length}
            icon={Clock}
            color="orange"
            trend={
              pendingSubmissions.length > 0
                ? "Submissions awaiting grade"
                : "All caught up"
            }
            trendColor={
              pendingSubmissions.length > 0
                ? "text-orange-600 dark:text-orange-400"
                : "text-emerald-600 dark:text-emerald-400"
            }
          />
        </div>

        {/* ================= QUICK TEACHING OPERATIONS GRID ================= */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Faculty Operations & Workflows
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Quick actions for attendance, grading, curriculum and assignment tasks
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Actions
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/teacher/attendance"
              className="group flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-emerald-500 hover:bg-emerald-50/30 dark:border-slate-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                    Mark Attendance
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Record or edit daily roll call
                  </p>
                </div>
              </div>
              <ChevronRight
                size={15}
                className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
              />
            </Link>

            <Link
              to="/teacher/marks"
              className="group flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-purple-500 hover:bg-purple-50/30 dark:border-slate-800 dark:hover:border-purple-500 dark:hover:bg-purple-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <Award size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                    Marks & Grading
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Enter test scores & remarks
                  </p>
                </div>
              </div>
              <ChevronRight
                size={15}
                className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-purple-600"
              />
            </Link>

            <Link
              to="/teacher/assignments"
              className="group flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    Class Assignments
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Post homework & submissions
                  </p>
                </div>
              </div>
              <ChevronRight
                size={15}
                className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
              />
            </Link>

            <Link
              to="/teacher/timetable"
              className="group flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-indigo-500 hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    Teaching Timetable
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Weekly periods & slots
                  </p>
                </div>
              </div>
              <ChevronRight
                size={15}
                className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600"
              />
            </Link>

            <Link
              to="/teacher/students"
              className="group flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-cyan-500 hover:bg-cyan-50/30 dark:border-slate-800 dark:hover:border-cyan-500 dark:hover:bg-cyan-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-400">
                    Students Roster
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Classroom directory & rolls
                  </p>
                </div>
              </div>
              <ChevronRight
                size={15}
                className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-cyan-600"
              />
            </Link>

            <Link
              to="/teacher/subjects"
              className="group flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-amber-500 hover:bg-amber-50/30 dark:border-slate-800 dark:hover:border-amber-500 dark:hover:bg-amber-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                    Allocated Subjects
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Curricula & subjects list
                  </p>
                </div>
              </div>
              <ChevronRight
                size={15}
                className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-amber-600"
              />
            </Link>
          </div>
        </div>

        {/* ================= MAIN TWO-COLUMN SECTION ================= */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* LEFT COLUMN: ATTENDANCE & EXAM PERFORMANCE */}
          <div className="space-y-4">
            {/* TODAY'S ATTENDANCE BREAKDOWN */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CalendarCheck size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Today's Attendance Status
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Classroom roll call summary for {formatDate(today)}
                    </p>
                  </div>
                </div>

                <Link
                  to="/teacher/attendance"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Manage
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              {/* Attendance Progress Meter */}
              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Attendance Rate
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {attendanceRate}%
                  </span>
                </div>

                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, attendanceRate)}%` }}
                  />
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="rounded border border-slate-200/80 bg-white py-1.5 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Total Roster
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {students.length}
                    </p>
                  </div>
                  <div className="rounded border border-emerald-200/80 bg-emerald-50/60 py-1.5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Present
                    </p>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {presentToday}
                    </p>
                  </div>
                  <div className="rounded border border-rose-200/80 bg-rose-50/60 py-1.5 dark:border-rose-900/40 dark:bg-rose-950/30">
                    <p className="text-[10px] text-rose-600 dark:text-rose-400">
                      Absent
                    </p>
                    <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                      {absentToday}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gender Demographics Bar */}
              <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  Class Gender Ratio:
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    {boys} Boys
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    {girls} Girls
                  </span>
                </div>
              </div>
            </div>

            {/* EXAM TERM PERFORMANCE */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Award size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Exam Term Averages
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Class academic score breakdown across exam phases
                    </p>
                  </div>
                </div>

                <Link
                  to="/teacher/marks"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Gradebook
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {/* First Term */}
                <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      First Term
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {firstTerm.length} entries
                    </span>
                  </div>
                  <p className="mt-1.5 text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {firstTermPct}%
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${firstTermPct}%` }}
                    />
                  </div>
                </div>

                {/* Midterm */}
                <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Midterm
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {midterm.length} entries
                    </span>
                  </div>
                  <p className="mt-1.5 text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {midtermPct}%
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${midtermPct}%` }}
                    />
                  </div>
                </div>

                {/* Final */}
                <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Final Exam
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {final.length} entries
                    </span>
                  </div>
                  <p className="mt-1.5 text-xl font-extrabold text-purple-600 dark:text-purple-400">
                    {finalPct}%
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${finalPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PENDING SUBMISSIONS & ANNOUNCEMENT */}
          <div className="space-y-4">
            {/* PENDING ASSIGNMENT SUBMISSIONS */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Submissions Awaiting Grading
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Student work ready for evaluation
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                  {pendingSubmissions.length} Pending
                </span>
              </div>

              <div className="mt-3">
                {pendingSubmissions.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                    <CheckCircle2
                      size={28}
                      className="mx-auto text-emerald-500 opacity-80"
                    />
                    <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No Pending Submissions
                    </p>
                    <p className="text-[10px] text-slate-400">
                      All submitted assignments have been evaluated.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            Student / Roll
                          </th>
                          <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            Assignment
                          </th>
                          <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pendingSubmissions.slice(0, 5).map((submission) => (
                          <tr
                            key={submission._id}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                          >
                            <td className="px-3 py-2">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {submission.student?.name || "Student"}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Roll: {submission.student?.rollNumber || "-"}
                              </p>
                            </td>

                            <td className="px-3 py-2">
                              <span className="inline-block max-w-[150px] truncate rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {submission.assignment?.title || "Assignment"}
                              </span>
                              <p className="mt-0.5 text-[9px] text-slate-400">
                                {submission.submittedAt
                                  ? formatDate(submission.submittedAt)
                                  : "-"}
                              </p>
                            </td>

                            <td className="px-3 py-2 text-right">
                              <Link
                                to="/teacher/assignments"
                                className="inline-flex items-center gap-0.5 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                              >
                                Grade
                                <ArrowUpRight size={10} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* RECENT ANNOUNCEMENT BULLETIN */}
            {newAnnouncement && (
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Megaphone size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Latest Institutional Notice
                      </h2>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        School broadcast announcement
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/teacher/announcements"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    All Notices
                    <ArrowUpRight size={13} />
                  </Link>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                    {newAnnouncement.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {newAnnouncement.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>
                      From:{" "}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {newAnnouncement.author?.name || "Administration"}
                      </span>
                    </span>
                    <span>
                      {newAnnouncement.createdAt
                        ? formatDate(newAnnouncement.createdAt)
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}