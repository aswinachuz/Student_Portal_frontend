import React from "react";
import { getFileUrl } from "../../../utils/fileUrl";

export default function AssignmentSubmissionsView({
  selectedAssignment,
  onBack,
  submissions,
  loading,
  gradingId,
  score,
  setScore,
  feedback,
  setFeedback,
  onStartGrading,
  onSaveGrade,
  onCancelGrading,
}) {
  if (!selectedAssignment) return null;

  return (
    <div className="space-y-3">
      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-gray-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        ← Back to Assignments
      </button>

      {/* ASSIGNMENT DETAILS */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:bg-gray-900">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white">
          {selectedAssignment.title}
        </h2>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          {selectedAssignment.description}
        </p>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Due Date: {new Date(selectedAssignment.dueDate).toLocaleString()}
        </p>
      </div>

      {/* SUBMISSION LOADING */}
      {loading ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:bg-gray-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading submissions...
          </p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-5 text-center shadow-sm dark:bg-gray-900">
          <p className="text-slate-500 dark:text-slate-400">
            No students have submitted this assignment yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div
              key={submission._id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:bg-gray-900"
            >
              {/* STUDENT */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4 dark:border-slate-700">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  {submission.student?.name || "Student"}
                </h3>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Roll Number: {submission.student?.rollNumber || "-"}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Email: {submission.student?.email || "-"}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                  Submitted:{" "}
                  {submission.submittedAt
                    ? new Date(submission.submittedAt).toLocaleString()
                    : "-"}
                </div>
              </div>

              {/* ANSWER */}
              <div className="mt-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  Student Answer
                </h4>
                <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-xs leading-6 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {submission.content || "No written answer provided."}
                </div>
              </div>

              {/* FILE */}
              <div className="mt-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  Attachment
                </h4>
                {submission.attachmentUrl ? (
                  <a
                    href={getFileUrl(submission.attachmentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    📎 Open Submitted File
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    No file attached.
                  </p>
                )}
              </div>

              {/* CURRENT GRADE */}
              <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-900 p-4 dark:bg-slate-800">
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Score:</span>{" "}
                  {submission.score !== undefined && submission.score !== null
                    ? submission.score
                    : "Not graded"}
                </p>
                <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Feedback:</span>{" "}
                  {submission.feedback || "No feedback yet"}
                </p>
              </div>

              {/* GRADING */}
              {gradingId === submission._id ? (
                <div className="mt-2 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-3 dark:border-slate-700">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="Enter score"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Teacher Feedback
                    </label>
                    <textarea
                      rows="2"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Enter feedback for the student..."
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onSaveGrade(submission._id)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Save Grade
                    </button>
                    <button
                      onClick={onCancelGrading}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onStartGrading(submission)}
                  className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  {submission.score !== undefined && submission.score !== null
                    ? "Edit Grade"
                    : "Grade Submission"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
