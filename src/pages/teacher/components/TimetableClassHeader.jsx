import React from "react";
import { School, ShieldCheck, Info } from "lucide-react";

export default function TimetableClassHeader({ isClassTeacher, classTeacherClassroom }) {
  if (isClassTeacher && classTeacherClassroom) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-blue-200/80 bg-blue-50/70 p-3.5 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/40">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
          <ShieldCheck size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {classTeacherClassroom.name}
              {classTeacherClassroom.section ? ` - Section ${classTeacherClassroom.section}` : ""}
            </h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/80 dark:text-blue-200">
              Class Teacher
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-blue-700 dark:text-blue-300">
            You hold master editing authority to add, update, and manage period slots for this classroom.
          </p>
        </div>
      </div>
    );
  }

  if (!isClassTeacher) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-800/40">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          <Info size={18} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            Schedule View Mode
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Timetable slot modifications are exclusively reserved for the designated Class Teacher.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
