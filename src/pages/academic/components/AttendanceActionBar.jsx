import React from "react";
import { Calendar, Save, CheckCheck, XCircle, Award } from "lucide-react";

export default function AttendanceActionBar({
  search,
  setSearch,
  selectedDate,
  setSelectedDate,
  today,
  saving,
  modifiedDatesCount = 0,
  onMarkAllPresent,
  onMarkAllAbsent,
  onMarkAllDutyLeave,
  onSaveDate,
  onSaveAll,
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-3 shadow-sm dark:border-slate-700 dark:bg-gray-800">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Search & Active Date Picker */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <input
            type="text"
            placeholder="Search student by name, roll, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />

          <div className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1">
            <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Active Date:
            </span>
            <input
              type="date"
              value={selectedDate || today}
              max={today}
              onChange={(e) => setSelectedDate && setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Batch Actions & Save */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onMarkAllPresent}
            className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-green-700"
            title="Mark all students Present for active date"
          >
            <CheckCheck size={13} />
            All Present
          </button>

          <button
            type="button"
            onClick={onMarkAllAbsent}
            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-red-700"
            title="Mark all students Absent for active date"
          >
            <XCircle size={13} />
            All Absent
          </button>

          {onMarkAllDutyLeave && (
            <button
              type="button"
              onClick={onMarkAllDutyLeave}
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-blue-700"
              title="Mark all students Duty Leave for active date"
            >
              <Award size={13} />
              All Duty Leave
            </button>
          )}

          <button
            type="button"
            onClick={() => onSaveDate && onSaveDate(selectedDate)}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={13} />
            {saving ? "Saving..." : `Save Date (${selectedDate})`}
          </button>

          {modifiedDatesCount > 1 && onSaveAll && (
            <button
              type="button"
              onClick={onSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50 animate-pulse"
              title="Save all changes made across multiple dates in the table"
            >
              <Save size={13} />
              Save All ({modifiedDatesCount} days)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
