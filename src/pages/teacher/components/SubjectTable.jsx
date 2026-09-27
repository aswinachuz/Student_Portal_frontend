import React from "react";
import { BookOpen, Pencil, Trash2, Plus, UserPlus, UserCheck, School } from "lucide-react";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value._id || "";
  return value;
};

export default function SubjectTable({
  subjects,
  isClassTeacher,
  teachers,
  assignmentSaving,
  getAssignmentForSubject,
  onSaveTeacherAssignment,
  onRemoveTeacherAssignment,
  onEdit,
  onDelete,
  onAdd,
}) {
  if (subjects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <BookOpen size={24} />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
          No Subjects Found
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {isClassTeacher
            ? "No subjects have been configured for your classroom yet."
            : "No subjects are currently assigned to your teaching profile."}
        </p>

        {isClassTeacher && (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
          >
            <Plus size={14} />
            Add First Subject
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <BookOpen size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Curriculum Subjects
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {subjects.length} course subject{subjects.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>

        {isClassTeacher && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Manage Mode
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th className="px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                #
              </th>
              <th className="px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Subject Name
              </th>
              <th className="px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Code
              </th>
              <th className="px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Classroom
              </th>
              <th className="min-w-[220px] px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Assigned Faculty
              </th>
              {isClassTeacher && (
                <th className="px-3.5 py-2.5 text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {subjects.map((subject, index) => {
              const classroomId = getId(subject.classroom);
              const assignment = getAssignmentForSubject(subject._id, classroomId);
              const isSaving = assignmentSaving === subject._id;

              return (
                <tr
                  key={subject._id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-3.5 py-3 text-[11px] font-medium text-slate-400">
                    {index + 1}
                  </td>

                  <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">
                    {subject.name}
                  </td>

                  <td className="px-3.5 py-3">
                    <span className="inline-block rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {subject.code}
                    </span>
                  </td>

                  <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                      <School size={11} className="text-slate-400" />
                      {subject.classroom?.name || "-"}
                      {subject.classroom?.section
                        ? ` (${subject.classroom.section})`
                        : ""}
                    </span>
                  </td>

                  <td className="px-3.5 py-3">
                    {isClassTeacher ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={assignment?.teacher?._id || ""}
                          onChange={(e) =>
                            onSaveTeacherAssignment(subject, e.target.value)
                          }
                          disabled={isSaving}
                          className="w-full max-w-[200px] rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white disabled:opacity-50"
                        >
                          <option value="">Choose Teacher</option>
                          {teachers.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>

                        {assignment && (
                          <button
                            type="button"
                            onClick={() => onRemoveTeacherAssignment(subject)}
                            disabled={isSaving}
                            className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        <UserCheck size={13} className="text-emerald-500" />
                        {assignment?.teacher?.name || "Assigned to you"}
                      </span>
                    )}
                  </td>

                  {isClassTeacher && (
                    <td className="px-3.5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(subject)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                          title="Edit Subject"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(subject._id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                          title="Delete Subject"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
