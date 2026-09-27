import React from "react";
import { User, Pencil, Trash2 } from "lucide-react";

export default function TimetableCell({
  item,
  isClassTeacher,
  onEdit,
  onDelete,
}) {
  return (
    <td className="border-r border-slate-200/80 p-2 align-top dark:border-slate-700">
      {!item ? (
        <div className="flex min-h-[76px] items-center justify-center rounded-lg border border-dashed border-slate-200/60 bg-slate-50/20 text-slate-300 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-600">
          <span className="text-xs">—</span>
        </div>
      ) : (
        <div className="group/cell relative min-h-[76px] rounded-lg border border-blue-200/90 bg-blue-50/60 p-2.5 shadow-2xs transition hover:border-blue-400 hover:shadow-xs dark:border-blue-900/60 dark:bg-blue-950/40">
          {/* SUBJECT */}
          <p className="truncate text-[11px] font-bold text-blue-950 dark:text-blue-100">
            {item.subject?.name || "Subject"}
          </p>

          {/* TEACHER */}
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300">
            <User size={10} className="shrink-0 text-blue-500" />
            <span className="truncate">{item.teacher?.name || "Teacher"}</span>
          </div>

          {/* ACTIONS FOR CLASS TEACHER */}
          {isClassTeacher && (
            <div className="mt-2 flex items-center gap-1 border-t border-blue-100/80 pt-1.5 dark:border-blue-900/60">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 transition hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/60"
                title="Edit Slot"
              >
                <Pencil size={9} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(item._id)}
                className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold text-rose-600 transition hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950/60"
                title="Delete Slot"
              >
                <Trash2 size={9} />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </td>
  );
}
