import React from "react";
import { Clock, Coffee, Calendar } from "lucide-react";
import TimetableCell from "./TimetableCell";

export default function TimetableGrid({
  timetable,
  days,
  periods,
  isClassTeacher,
  classTeacherClassroom,
  getEntry,
  onEdit,
  onDelete,
  error,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* TABLE HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Calendar size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Weekly Timetable Grid
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Assigned subject periods across Monday through Saturday
            </p>
          </div>
        </div>

        {isClassTeacher && classTeacherClassroom && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {classTeacherClassroom.name}
            {classTeacherClassroom.section ? ` (${classTeacherClassroom.section})` : ""}
          </span>
        )}
      </div>

      {/* ERROR */}
      {error && !isClassTeacher && (
        <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* TABLE */}
      {timetable.length === 0 ? (
        <div className="p-12 text-center">
          <Clock size={32} className="mx-auto text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            No Timetable Slots Created
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {isClassTeacher
              ? "Use the form above to schedule your first classroom period."
              : "No periods have been published for this classroom."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80">
              <tr>
                <th className="sticky left-0 z-20 w-[95px] border-b border-r border-slate-200/80 bg-slate-100/90 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Day
                </th>

                {periods.slice(0, 3).map((period) => (
                  <th
                    key={period.period || period.name}
                    className="min-w-[125px] border-b border-r border-slate-200/80 px-2.5 py-2.5 text-center dark:border-slate-700"
                  >
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {period.label || `${period.name} Period`}
                    </div>
                  </th>
                ))}

                {/* BREAK */}
                <th className="min-w-[95px] border-b border-r border-slate-200/80 bg-amber-100/70 px-2 py-2.5 text-center dark:border-slate-700 dark:bg-amber-950/70">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-900 dark:text-amber-200">
                    <Coffee size={12} />
                    <span>BREAK</span>
                  </div>
                </th>

                {periods.slice(3).map((period) => (
                  <th
                    key={period.period || period.name}
                    className="min-w-[125px] border-b border-r border-slate-200/80 px-2.5 py-2.5 text-center dark:border-slate-700"
                  >
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {period.label || `${period.name} Period`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {days.map((day) => (
                <tr
                  key={day}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* DAY STICKY CELL */}
                  <td className="sticky left-0 z-10 border-r border-slate-200/80 bg-slate-50/90 px-3 py-3 text-[11px] font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {day}
                  </td>

                  {/* FIRST 3 PERIODS */}
                  {periods.slice(0, 3).map((period) => {
                    const item = getEntry(day, period.period || period.name);
                    return (
                      <TimetableCell
                        key={`${day}-${period.period || period.name}`}
                        item={item}
                        isClassTeacher={isClassTeacher}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    );
                  })}

                  {/* BREAK */}
                  <td className="border-r border-slate-200/80 bg-amber-50/60 p-2 text-center dark:border-slate-700 dark:bg-amber-950/20">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      <Coffee size={12} />
                      <span>BREAK</span>
                    </div>
                  </td>

                  {/* LAST 3 PERIODS */}
                  {periods.slice(3).map((period) => {
                    const item = getEntry(day, period.period || period.name);
                    return (
                      <TimetableCell
                        key={`${day}-${period.period || period.name}`}
                        item={item}
                        isClassTeacher={isClassTeacher}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
