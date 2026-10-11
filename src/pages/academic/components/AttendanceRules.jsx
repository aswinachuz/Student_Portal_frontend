import React from "react";

export default function AttendanceRules() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 px-4 py-3 dark:border-blue-900 dark:bg-blue-950">
      <h3 className="text-xs font-semibold text-blue-900 dark:text-blue-200">
        Attendance Rules
      </h3>
      <ul className="mt-1.5 space-y-0.5 text-[10px] text-blue-700 dark:text-blue-300">
        <li>• The Class Teacher has full authority to mark and edit classroom attendance.</li>
        <li>• Attendance for any past date or today can be entered or edited at any time.</li>
        <li>• Future dates cannot be marked.</li>
        <li>• Present (P), Absent (A), and Duty Leave (DL) statuses are supported.</li>
        <li>• Duty Leave counts as Present towards the attendance percentage.</li>
        <li>• Changes can be saved per date or across the monthly register.</li>
      </ul>
    </div>
  );
}
