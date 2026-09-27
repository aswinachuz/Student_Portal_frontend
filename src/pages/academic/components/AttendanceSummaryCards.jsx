import React from "react";

// =====================================================
// SUMMARY CARD
// =====================================================
function SummaryCard({ title, value, type }) {
  let classes = "rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-2.5 shadow-sm dark:border-slate-700 dark:bg-gray-800";
  if (type === "present") {
    classes = "rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 px-3 py-2.5 dark:border-green-800 dark:bg-green-950";
  }
  if (type === "absent") {
    classes = "rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2.5 dark:border-red-800 dark:bg-red-950";
  }
  if (type === "duty") {
    classes = "rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 px-3 py-2.5 dark:border-blue-800 dark:bg-blue-950";
  }
  return (
    <div className={classes}>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function AttendanceSummaryCards({ totalStudents, classSummary }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <SummaryCard title="Students" value={totalStudents} />
      <SummaryCard title="Present Today" value={classSummary.present} type="present" />
      <SummaryCard title="Absent Today" value={classSummary.absent} type="absent" />
      <SummaryCard title="Duty Leave Today" value={classSummary.dutyLeave} type="duty" />
    </div>
  );
}
