import React from "react";

export default function AttendanceActionBar({
  search,
  setSearch,
  isCurrentMonth,
  todaySubmitted,
  saving,
  onMarkAllPresent,
  onMarkAllAbsent,
  onSubmit,
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-3 shadow-sm dark:border-slate-700 dark:bg-gray-800">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs outline-none focus:border-blue-500 xl:max-w-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />

        {isCurrentMonth && !todaySubmitted && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onMarkAllPresent}
              className="rounded-md bg-green-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-green-700"
            >
              All Present
            </button>

            <button
              type="button"
              onClick={onMarkAllAbsent}
              className="rounded-md bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-700"
            >
              All Absent
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Submitting..." : "Submit Today"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
