import React, { useEffect, useMemo, useState } from "react";
import { Clock, Calendar, Coffee, User, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import { DAYS, STUDENT_PERIODS as PERIODS } from "../../constants/timetable";
import axiosClient from "../../api/axiosClient";

export default function StudentTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosClient.get("/timetable");
        setTimetable(
          Array.isArray(response.data?.data) ? response.data.data : []
        );
      } catch (err) {
        console.error("Error fetching timetable:", err);
        setError(err.response?.data?.message || "Unable to load timetable.");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const getEntry = (day, period) => {
    const periodKey = period.period || period.key;
    return timetable.find(
      (item) =>
        item.day === day &&
        (item.period === periodKey ||
          (periodKey === "1st" && item.startTime?.startsWith("09")) ||
          (periodKey === "2nd" && item.startTime?.startsWith("10")) ||
          (periodKey === "3rd" && item.startTime?.startsWith("11")) ||
          (periodKey === "4th" &&
            (item.startTime?.startsWith("12") || item.startTime?.startsWith("13"))) ||
          (periodKey === "5th" && item.startTime?.startsWith("14")) ||
          (periodKey === "6th" && item.startTime?.startsWith("15")))
    );
  };

  const todayDayName = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
  }, []);

  const todayPeriods = useMemo(() => {
    return PERIODS.map((period) => {
      if (period.isBreak) return { ...period, isBreak: true };
      const entry = getEntry(todayDayName, period);
      return { ...period, entry };
    });
  }, [timetable, todayDayName]);

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Loading class timetable...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Calendar size={12} />
            Academic Schedule
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Today is {todayDayName}
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Weekly Class Timetable
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          View your daily class periods, allocated course subjects, and assigned teachers.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* TODAY'S SCHEDULE HIGHLIGHT CARD */}
      {timetable.length > 0 && (
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-white p-4 shadow-sm dark:border-indigo-950/80 dark:bg-slate-900 dark:from-indigo-950/30 dark:via-blue-950/20">
          <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2.5 dark:border-indigo-900/40">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white shadow-xs">
                <Sparkles size={13} />
              </div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Today's Classes ({todayDayName})
              </h2>
            </div>
            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
              Live Daily Strip
            </span>
          </div>

          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
            {todayPeriods.map((p, idx) => {
              if (p.isBreak) {
                return (
                  <div
                    key={`today-break-${idx}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300"
                  >
                    <Coffee size={14} />
                    <span className="font-semibold text-[11px]">Lunch Break</span>
                  </div>
                );
              }

              const hasClass = p.entry?.subject?.name;

              return (
                <div
                  key={`today-p-${p.key || idx}`}
                  className={`flex min-w-[140px] shrink-0 flex-col justify-between rounded-lg border p-2.5 text-xs transition ${
                    hasClass
                      ? "border-blue-200 bg-white shadow-xs dark:border-blue-900/70 dark:bg-slate-800"
                      : "border-slate-200/80 bg-slate-50/50 opacity-60 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {p.label}
                    </span>
                  </div>

                  <p className="mt-1 font-bold text-slate-900 dark:text-white truncate">
                    {p.entry?.subject?.name || "No Class"}
                  </p>

                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    <User size={10} />
                    <span>{p.entry?.teacher?.name || "Unassigned"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL WEEKLY TIMETABLE GRID */}
      {timetable.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <Calendar size={32} className="mx-auto text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            No Timetable Published
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Your class teacher has not entered any timetable periods for this session.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Complete Weekly Roster
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Weekly schedules across all 6 instruction periods
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Monday – Saturday
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800">
            <table className="w-full min-w-[1050px] border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="sticky left-0 z-20 min-w-[100px] border-b border-r border-slate-200/80 bg-slate-100/90 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Day
                  </th>

                  {PERIODS.map((period) => (
                    <th
                      key={period.key}
                      className={`min-w-[135px] border-b border-r border-slate-200/80 px-3 py-2.5 text-center dark:border-slate-700 ${
                        period.isBreak
                          ? "bg-amber-100/70 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <div className="text-[11px] font-bold">{period.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {DAYS.map((day) => {
                  const isCurrentDay = day === todayDayName;

                  return (
                    <tr
                      key={day}
                      className={`transition-colors ${
                        isCurrentDay
                          ? "bg-blue-50/20 dark:bg-blue-950/20"
                          : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      }`}
                    >
                      {/* DAY STICKY CELL */}
                      <td className="sticky left-0 z-10 border-r border-slate-200/80 bg-slate-50/90 px-3 py-3 text-[11px] font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          {isCurrentDay && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                          )}
                          <span>{day}</span>
                        </div>
                      </td>

                      {PERIODS.map((period) => {
                        if (period.isBreak) {
                          return (
                            <td
                              key={`${day}-${period.key}`}
                              className="border-r border-slate-200/80 bg-amber-50/60 p-2 text-center dark:border-slate-700 dark:bg-amber-950/20"
                            >
                              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                <Coffee size={12} />
                                <span>BREAK</span>
                              </div>
                            </td>
                          );
                        }

                        const entry = getEntry(day, period);

                        return (
                          <td
                            key={`${day}-${period.key}`}
                            className="border-r border-slate-200/80 p-2 align-top dark:border-slate-700"
                          >
                            {entry ? (
                              <div className="min-h-[76px] rounded-lg border border-blue-200/90 bg-blue-50/60 p-2.5 shadow-2xs transition hover:border-blue-400 hover:shadow-xs dark:border-blue-900/60 dark:bg-blue-950/40">
                                <p className="text-[11px] font-bold text-blue-900 dark:text-blue-100 truncate">
                                  {entry.subject?.name || "Subject"}
                                </p>

                                <div className="mt-2 flex items-center gap-1 border-t border-blue-100/80 pt-1.5 text-[10px] text-slate-600 dark:border-blue-900/60 dark:text-slate-300">
                                  <User size={11} className="text-blue-500" />
                                  <span className="truncate">
                                    {entry.teacher?.name || "Teacher"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex min-h-[76px] items-center justify-center rounded-lg border border-dashed border-slate-200/60 bg-slate-50/30 text-slate-300 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-600">
                                <span className="text-[10px]">—</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
