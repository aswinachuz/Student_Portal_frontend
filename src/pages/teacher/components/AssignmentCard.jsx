import React from "react";

export default function AssignmentCard({ assignment, onViewSubmissions, onDelete }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
            {assignment.title}
          </h2>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {assignment.description}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
        <p>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            Subject:
          </span>{" "}
          {assignment.subject?.name || "-"}
        </p>
        <p>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            Class:
          </span>{" "}
          {assignment.classroom?.name || "-"}
          {assignment.classroom?.section ? ` - ${assignment.classroom.section}` : ""}
        </p>
        <p>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            Due Date:
          </span>{" "}
          {new Date(assignment.dueDate).toLocaleString()}
        </p>
      </div>

      <div className="mt-2 flex gap-3">
        <button
          onClick={() => onViewSubmissions(assignment)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          View Submissions
        </button>

        <button
          onClick={() => onDelete(assignment._id)}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
