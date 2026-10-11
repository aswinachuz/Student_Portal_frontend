import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  CheckCheck,
  RefreshCw,
  Table as TableIcon,
  CalendarCheck,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { getTodayDate, formatDate } from "../../utils/dateUtils";

export default function TeacherAttendance() {
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState({}); // { [teacherId]: { status, remarks } }
  const [date, setDate] = useState(getTodayDate());
  const [viewMode, setViewMode] = useState("daily"); // "daily" | "monthly"

  // Monthly register state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [monthlyRecords, setMonthlyRecords] = useState({}); // { [teacherId]: { [dateStr]: status } }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = getTodayDate();

  // ==========================================
  // FETCH TEACHERS
  // ==========================================
  const fetchTeachers = async () => {
    try {
      const response = await axiosClient.get("/admin/teachers");
      const list = response.data?.data || response.data || [];
      setTeachers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("FETCH TEACHERS ERROR:", err);
      setError("Failed to load teachers list.");
    }
  };

  // ==========================================
  // FETCH DAILY ATTENDANCE
  // ==========================================
  const fetchDailyAttendance = async (targetDate) => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/teacher-attendance", {
        params: { date: targetDate },
      });

      const records = response.data?.data || [];
      const map = {};

      records.forEach((record) => {
        const teacherId = record.teacher?._id || record.teacher;
        if (teacherId) {
          map[teacherId] = {
            status: record.status || "Present",
            remarks: record.remarks || "",
          };
        }
      });

      setAttendance(map);
    } catch (err) {
      console.error("FETCH DAILY ATTENDANCE ERROR:", err);
      setError(err.response?.data?.message || "Failed to load attendance for selected date.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH MONTHLY ATTENDANCE
  // ==========================================
  const fetchMonthlyAttendance = async (monthStr) => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/teacher-attendance", {
        params: { month: monthStr },
      });

      const records = response.data?.data || [];
      const map = {};

      records.forEach((record) => {
        const teacherId = record.teacher?._id || record.teacher;
        if (!teacherId || !record.date) return;

        const d = new Date(record.date);
        const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

        if (!map[teacherId]) {
          map[teacherId] = {};
        }
        map[teacherId][dateKey] = record.status;
      });

      setMonthlyRecords(map);
    } catch (err) {
      console.error("FETCH MONTHLY ATTENDANCE ERROR:", err);
      setError(err.response?.data?.message || "Failed to load monthly attendance register.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Fetch when date or view changes
  useEffect(() => {
    if (viewMode === "daily") {
      fetchDailyAttendance(date);
    } else {
      fetchMonthlyAttendance(currentMonth);
    }
  }, [date, viewMode, currentMonth]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleStatusChange = (teacherId, newStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [teacherId]: {
        ...(prev[teacherId] || { remarks: "" }),
        status: newStatus,
      },
    }));
    setSuccess("");
    setError("");
  };

  const handleRemarksChange = (teacherId, newRemarks) => {
    setAttendance((prev) => ({
      ...prev,
      [teacherId]: {
        ...(prev[teacherId] || { status: "Present" }),
        remarks: newRemarks,
      },
    }));
  };

  const markAll = (status) => {
    const updated = { ...attendance };
    teachers.forEach((t) => {
      updated[t._id] = {
        ...(updated[t._id] || { remarks: "" }),
        status,
      };
    });
    setAttendance(updated);
    setSuccess("");
    setError("");
  };

  // Save daily attendance
  const handleSaveDaily = async () => {
    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (teachers.length === 0) {
      setError("No teachers to record attendance for.");
      return;
    }

    // Default unmarked teachers to "Present"
    const attendanceRecords = teachers.map((teacher) => ({
      teacherId: teacher._id,
      status: attendance[teacher._id]?.status || "Present",
      remarks: attendance[teacher._id]?.remarks || "",
    }));

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await axiosClient.post("/teacher-attendance", {
        date,
        attendanceRecords,
      });

      setSuccess(response.data?.message || "Teacher attendance saved successfully.");
      await fetchDailyAttendance(date);
    } catch (err) {
      console.error("SAVE TEACHER ATTENDANCE ERROR:", err);
      setError(err.response?.data?.message || "Failed to save teacher attendance.");
    } finally {
      setSaving(false);
    }
  };

  // Handle monthly register cell change
  const handleMonthlyCellChange = async (teacherId, cellDate, newStatus) => {
    if (!newStatus) return;

    // Optimistically update
    setMonthlyRecords((prev) => ({
      ...prev,
      [teacherId]: {
        ...(prev[teacherId] || {}),
        [cellDate]: newStatus,
      },
    }));

    try {
      await axiosClient.post("/teacher-attendance", {
        date: cellDate,
        attendanceRecords: [
          {
            teacherId,
            status: newStatus,
            remarks: "",
          },
        ],
      });
      setSuccess(`Updated attendance for ${cellDate}.`);
    } catch (err) {
      console.error("UPDATE CELL ERROR:", err);
      setError(err.response?.data?.message || "Failed to update attendance cell.");
      await fetchMonthlyAttendance(currentMonth);
    }
  };

  // ==========================================
  // STATS & FILTERING
  // ==========================================
  const dailyStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let onLeave = 0;
    let unmarked = 0;

    teachers.forEach((t) => {
      const s = attendance[t._id]?.status;
      if (s === "Present") present++;
      else if (s === "Absent") absent++;
      else if (s === "Half Day") halfDay++;
      else if (s === "On Leave") onLeave++;
      else unmarked++;
    });

    return {
      total: teachers.length,
      present,
      absent,
      halfDay,
      onLeave,
      unmarked,
    };
  }, [teachers, attendance]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.phone?.includes(searchTerm);

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      const status = attendance[teacher._id]?.status || "Unmarked";
      return status.toLowerCase() === statusFilter.toLowerCase();
    });
  }, [teachers, searchTerm, statusFilter, attendance]);

  // Days in selected month for monthly view
  const [mYear, mMonth] = currentMonth.split("-").map(Number);
  const daysInMonth = new Date(mYear, mMonth, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return `${currentMonth}-${String(day).padStart(2, "0")}`;
  });

  return (
    <div className="space-y-4">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="text-blue-600 dark:text-blue-400" size={24} />
            Teacher Attendance
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Administrate and record daily attendance for faculty members.
          </p>
        </div>

        {/* MODE TOGGLE */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("daily")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "daily"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calendar size={13} />
            Daily Marking
          </button>
          <button
            type="button"
            onClick={() => setViewMode("monthly")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "monthly"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TableIcon size={13} />
            Monthly Register
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-xs font-medium text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-300">
          {success}
        </div>
      )}

      {/* DAILY VIEW */}
      {viewMode === "daily" && (
        <>
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Faculty
              </span>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {dailyStats.total}
              </p>
            </div>
            <div className="rounded-xl border border-green-200 dark:border-green-900/60 bg-green-50/50 dark:bg-green-950/30 p-3.5 shadow-xs">
              <span className="text-[10px] font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">
                Present
              </span>
              <p className="mt-1 text-xl font-bold text-green-700 dark:text-green-300">
                {dailyStats.present}
              </p>
            </div>
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 p-3.5 shadow-xs">
              <span className="text-[10px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
                Absent
              </span>
              <p className="mt-1 text-xl font-bold text-red-700 dark:text-red-300">
                {dailyStats.absent}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-3.5 shadow-xs">
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Half Day
              </span>
              <p className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-300">
                {dailyStats.halfDay}
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 p-3.5 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                On Leave
              </span>
              <p className="mt-1 text-xl font-bold text-blue-700 dark:text-blue-300">
                {dailyStats.onLeave}
              </p>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Date & Search */}
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5">
                  <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Date:
                  </span>
                  <input
                    type="date"
                    value={date}
                    max={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
                  />
                </div>

                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search faculty name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 dark:bg-slate-800 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              {/* Batch Actions & Save */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => markAll("Present")}
                  className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-green-700"
                >
                  <CheckCheck size={14} />
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAll("Absent")}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-red-700"
                >
                  <XCircle size={14} />
                  All Absent
                </button>
                <button
                  type="button"
                  onClick={handleSaveDaily}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </div>
          </div>

          {/* TEACHER LIST TABLE */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="px-4 py-3">Faculty Member</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        Loading faculty attendance...
                      </td>
                    </tr>
                  ) : filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        No teachers found.
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher) => {
                      const currentStatus = attendance[teacher._id]?.status || "Present";
                      const currentRemarks = attendance[teacher._id]?.remarks || "";

                      return (
                        <tr
                          key={teacher._id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                        >
                          {/* Teacher Name & Avatar */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-950 dark:text-blue-300">
                                {teacher.name?.charAt(0)?.toUpperCase() || "T"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  {teacher.name}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {teacher.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            <div>{teacher.phone || "—"}</div>
                            <div className="text-[10px] text-slate-400">
                              {teacher.gender || ""}
                            </div>
                          </td>

                          {/* Attendance Status Selector */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {[
                                { key: "Present", label: "P", color: "green" },
                                { key: "Absent", label: "A", color: "red" },
                                { key: "Half Day", label: "HD", color: "amber" },
                                { key: "On Leave", label: "OL", color: "blue" },
                              ].map((opt) => {
                                const active = currentStatus === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => handleStatusChange(teacher._id, opt.key)}
                                    className={`h-7 px-2.5 rounded-md text-[10px] font-bold transition ${
                                      active
                                        ? opt.color === "green"
                                          ? "bg-green-600 text-white shadow-xs"
                                          : opt.color === "red"
                                          ? "bg-red-600 text-white shadow-xs"
                                          : opt.color === "amber"
                                          ? "bg-amber-600 text-white shadow-xs"
                                          : "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                                    title={`Mark as ${opt.key}`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* Remarks */}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              placeholder="Add optional note..."
                              value={currentRemarks}
                              onChange={(e) => handleRemarksChange(teacher._id, e.target.value)}
                              className="w-full rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER SAVE BUTTON */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 px-4 py-3">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Attendance is marked by administrator on behalf of faculty.
              </span>
              <button
                type="button"
                onClick={handleSaveDaily}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* MONTHLY REGISTER VIEW */}
      {viewMode === "monthly" && (
        <div className="space-y-3">
          {/* MONTH SELECTOR BAR */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Month:
              </span>
              <input
                type="month"
                value={currentMonth}
                max={today.substring(0, 7)}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-semibold text-slate-900 dark:text-white dark:bg-slate-800 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-slate-600 dark:text-slate-400 text-[10px]">Present</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-slate-600 dark:text-slate-400 text-[10px]">Absent</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-400 text-[10px]">Half Day</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 dark:text-slate-400 text-[10px]">On Leave</span>
              </div>
            </div>
          </div>

          {/* MONTHLY TABLE */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-max border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <th className="sticky left-0 z-20 min-w-[180px] bg-slate-50 dark:bg-slate-800 px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">
                      Faculty Member
                    </th>
                    {monthDays.map((dStr) => {
                      const dayNum = dStr.split("-")[2];
                      const isTodayCell = dStr === today;
                      const isFuture = dStr > today;
                      return (
                        <th
                          key={dStr}
                          className={`min-w-[42px] border border-slate-200 dark:border-slate-700 px-1 py-1.5 text-center text-[10px] font-semibold ${
                            isTodayCell
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                              : isFuture
                              ? "bg-slate-100 text-slate-400 dark:bg-slate-850"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {dayNum}
                        </th>
                      );
                    })}
                    <th className="sticky right-0 z-20 min-w-[70px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {teachers.map((teacher) => {
                    const teacherMonthData = monthlyRecords[teacher._id] || {};
                    let presentCount = 0;
                    let totalMarked = 0;

                    monthDays.forEach((dStr) => {
                      const st = teacherMonthData[dStr];
                      if (st) {
                        totalMarked++;
                        if (st === "Present") presentCount += 1;
                        else if (st === "Half Day") presentCount += 0.5;
                        else if (st === "On Leave") presentCount += 1; // leave considered non-penalty
                      }
                    });

                    const pct = totalMarked > 0 ? ((presentCount / totalMarked) * 100).toFixed(1) : "—";

                    return (
                      <tr key={teacher._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 font-medium text-slate-900 dark:text-white">
                          <div className="truncate max-w-[170px]" title={teacher.name}>
                            {teacher.name}
                          </div>
                        </td>

                        {monthDays.map((dStr) => {
                          const isFuture = dStr > today;
                          const st = teacherMonthData[dStr];

                          return (
                            <td
                              key={dStr}
                              className={`border border-slate-200 dark:border-slate-700 p-0.5 text-center ${
                                isFuture ? "bg-slate-50/50 dark:bg-slate-850" : ""
                              }`}
                            >
                              {isFuture ? (
                                <span className="text-slate-300 dark:text-slate-600">—</span>
                              ) : (
                                <select
                                  value={st || ""}
                                  onChange={(e) =>
                                    handleMonthlyCellChange(teacher._id, dStr, e.target.value)
                                  }
                                  className={`h-6 w-8 rounded text-[9px] font-bold text-center outline-none cursor-pointer border ${
                                    st === "Present"
                                      ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                                      : st === "Absent"
                                      ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                                      : st === "Half Day"
                                      ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                                      : st === "On Leave"
                                      ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                                      : "bg-white text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                  }`}
                                >
                                  <option value="">-</option>
                                  <option value="Present">P</option>
                                  <option value="Absent">A</option>
                                  <option value="Half Day">HD</option>
                                  <option value="On Leave">OL</option>
                                </select>
                              )}
                            </td>
                          );
                        })}

                        <td className="sticky right-0 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-2 text-center font-bold text-slate-800 dark:text-slate-200 text-[10px]">
                          {pct !== "—" ? `${pct}%` : pct}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
