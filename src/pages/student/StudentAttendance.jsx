import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Calendar,
  AlertCircle,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import StatCard from "../../components/common/StatCard";
import { formatDate } from "../../utils/dateUtils";

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axiosClient.get("/attendance");
        setAttendance(response.data || []);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const present = attendance.filter((r) => r.status === "Present").length;
  const absent = attendance.filter((r) => r.status === "Absent").length;
  const dutyLeave = attendance.filter((r) => r.status === "Duty Leave").length;
  const attended = present + dutyLeave;
  const percentage =
    attendance.length > 0 ? Math.round((attended / attendance.length) * 100) : 0;

  const getStatusBadge = (status) => {
    if (status === "Present") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 size={11} />
          Present
        </span>
      );
    }
    if (status === "Duty Leave") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
          <Sparkles size={11} />
          Duty Leave
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
        <XCircle size={11} />
        Absent
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
            <CalendarCheck size={12} />
            Attendance Register
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Attendance Records
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track your daily institutional roll call and cumulative attendance rate.
        </p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Overall Attendance"
          value={`${percentage}%`}
          icon={CalendarCheck}
          color={percentage >= 75 ? "emerald" : "amber"}
          trend={`${attended} of ${attendance.length} days attended`}
          trendColor={
            percentage >= 75
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }
        />

        <StatCard
          title="Days Present"
          value={present}
          icon={CheckCircle2}
          color="emerald"
          trend="Full sessions"
          trendColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Days Absent"
          value={absent}
          icon={XCircle}
          color="rose"
          trend={absent > 0 ? "Absences logged" : "No absences"}
          trendColor={
            absent > 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-emerald-600 dark:text-emerald-400"
          }
        />

        <StatCard
          title="Duty Leave"
          value={dutyLeave}
          icon={Sparkles}
          color="cyan"
          trend="Approved leaves"
          trendColor="text-cyan-600 dark:text-cyan-400"
        />
      </div>

      {/* PROGRESS METER */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Mandatory Requirement Progress
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {percentage}% / 75% Target
          </span>
        </div>

        <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage >= 75 ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>0%</span>
          <span className="font-medium text-slate-600 dark:text-slate-400">
            {percentage >= 75
              ? "✓ You satisfy the minimum attendance quota"
              : "⚠ Your attendance is below the 75% requirement"}
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* ATTENDANCE HISTORY TABLE */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Daily Attendance History
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Chronological log of your session attendance
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {attendance.length} Total Records
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : attendance.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <p className="text-xs text-slate-400">No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  <th className="px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3.5 py-2.5 text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendance.map((record) => (
                  <tr
                    key={record._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-3.5 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      {getStatusBadge(record.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
