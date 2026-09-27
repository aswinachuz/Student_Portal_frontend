import React from "react";

export default function AttendanceRules() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 px-4 py-3 dark:border-blue-900 dark:bg-blue-950">
      <h3 className="text-xs font-semibold text-blue-900 dark:text-blue-200">
        Attendance Rules
      </h3>
      <ul className="mt-1.5 space-y-0.5 text-[10px] text-blue-700 dark:text-blue-300">
        <li>• Only the Class Teacher can submit attendance.</li>
        <li>• Today's attendance can be entered before submission.</li>
        <li>• Once submitted, today's attendance is locked.</li>
        <li>• Previous attendance is read-only for teachers.</li>
        <li>• Future dates cannot be marked.</li>
        <li>• Duty Leave counts as Present.</li>
        <li>• Admin can correct attendance.</li>
      </ul>
    </div>
  );
}
