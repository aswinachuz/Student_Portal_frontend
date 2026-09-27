import React from "react";
import { ShieldCheck, Info, School } from "lucide-react";

export default function SubjectRoleBanner({ isClassTeacher, classTeacherClassroom }) {
  if (isClassTeacher && classTeacherClassroom) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-blue-200/80 bg-blue-50/70 p-3.5 text-xs text-blue-900 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
          <ShieldCheck size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              Class Teacher Privileges
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/80 dark:text-blue-200">
              {classTeacherClassroom.name}
              {classTeacherClassroom.section ? ` - Sec ${classTeacherClassroom.section}` : ""}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-blue-700 dark:text-blue-300">
            You have full administrative authority to add curriculum subjects and assign subject teachers for this classroom.
          </p>
        </div>
      </div>
    );
  }

  if (!isClassTeacher) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          <Info size={17} />
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            Subject Faculty View
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            You are viewing the specific academic subjects assigned to your teaching schedule.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
