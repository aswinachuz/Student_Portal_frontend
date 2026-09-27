import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { getFileUrl } from "../../utils/fileUrl";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [assignmentResponse, submissionResponse] =
        await Promise.all([
          axiosClient.get("/assignments"),
          axiosClient.get("/submissions/my"),
        ]);

      setAssignments(
        assignmentResponse.data?.data ||
          assignmentResponse.data ||
          []
      );

      setSubmissions(
        submissionResponse.data?.data || []
      );
    } catch (error) {
      console.error("Error fetching assignments:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSubmission = (assignmentId) => {
    return submissions.find(
      (submission) =>
        submission.assignment?._id === assignmentId
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Maximum 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setMessage("File size must be less than 10 MB.");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !selectedFile) {
      setMessage(
        "Please enter your answer or upload a file."
      );
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const formData = new FormData();

      formData.append(
        "assignmentId",
        selectedAssignment._id
      );

      if (content.trim()) {
        formData.append("content", content.trim());
      }

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await axiosClient.post(
        "/submissions",
        formData
      );

      setMessage(
        "Assignment submitted successfully."
      );

      setContent("");
      setSelectedFile(null);
      setSelectedAssignment(null);

      await fetchData();
    } catch (error) {
      console.error(
        "Error submitting assignment:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to submit assignment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading assignments...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          My Assignments
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          View your assignments and submit your answers.
        </p>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950 px-3 py-2 text-xs text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
          {message}
        </div>
      )}

      {/* ASSIGNMENT LIST */}
      {assignments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No assignments available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {assignments.map((assignment) => {
            const submission = getSubmission(assignment._id);

            return (
              <div
                key={assignment._id}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >

                {/* ASSIGNMENT HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {assignment.title}
                    </h2>

                    <p className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                      {assignment.description}
                    </p>
                  </div>

                  {submission ? (
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-green-100 px-2 py-1 text-[9px] font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                      ✓ Submitted
                    </span>
                  ) : new Date() <= new Date(assignment.dueDate) ? (
                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[9px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      Open
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-[9px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                      Closed
                    </span>
                  )}
                </div>

                {/* ASSIGNMENT DETAILS */}
                <div className="mt-3 space-y-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                  <p>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Due Date:
                    </span>{" "}
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>

                  {submission && (
                    <>
                      <p>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Submitted:
                        </span>{" "}
                        {new Date(
                          submission.submittedAt
                        ).toLocaleDateString()}
                      </p>

                      {submission.score !== undefined &&
                        submission.score !== null && (
                          <p>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Score:
                            </span>{" "}
                            {submission.score}
                          </p>
                        )}

                      {submission.feedback && (
                        <p>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Teacher Feedback:
                          </span>{" "}
                          {submission.feedback}
                        </p>
                      )}

                      {submission.attachmentUrl && (
                        <a
                          href={getFileUrl(submission.attachmentUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block pt-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline dark:text-blue-400"
                        >
                          📎 View Submitted File
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                {!submission && (
                  <>
                    {new Date() <= new Date(assignment.dueDate) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setContent("");
                          setSelectedFile(null);
                          setMessage("");
                        }}
                        className="mt-3 rounded-md bg-blue-600 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-blue-700"
                      >
                        Submit Assignment
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="mt-3 cursor-not-allowed rounded-md bg-slate-400 px-3 py-1.5 text-[10px] font-semibold text-white"
                      >
                        Submission Closed
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMISSION FORM */}
      {selectedAssignment && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Submit: {selectedAssignment.title}
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              Enter your answer or upload your assignment file.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* TEXT ANSWER */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Your Answer
              </label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Enter your assignment answer..."
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-50 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/40"
              />
            </div>

            {/* FILE UPLOAD */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Upload Assignment File
              </label>

              <div className="rounded-md border border-dashed border-slate-300 dark:border-slate-600 p-3 dark:border-slate-600">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="block w-full text-[10px] text-slate-600 dark:text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 dark:bg-blue-950 file:px-3 file:py-1.5 file:text-[10px] file:font-semibold file:text-blue-700 dark:text-blue-300 hover:file:bg-blue-100 dark:text-slate-300 dark:file:bg-blue-950 dark:file:text-blue-300"
                />

                <p className="mt-2 text-[9px] leading-4 text-slate-500 dark:text-slate-400">
                  Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG
                  <br />
                  Maximum file size: 10 MB
                </p>

                {selectedFile && (
                  <div className="mt-2 rounded-md bg-slate-50 dark:bg-slate-900 px-3 py-2 dark:bg-slate-800">
                    <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      📎 Selected File
                    </p>

                    <p className="mt-0.5 break-all text-[10px] text-slate-600 dark:text-slate-400">
                      {selectedFile.name}
                    </p>

                    <p className="mt-0.5 text-[9px] text-slate-500 dark:text-slate-500">
                      {(
                        selectedFile.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-blue-600 px-4 py-1.5 text-[10px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Assignment"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedAssignment(null);
                  setContent("");
                  setSelectedFile(null);
                  setMessage("");
                }}
                className="rounded-md border border-slate-300 dark:border-slate-600 px-4 py-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
