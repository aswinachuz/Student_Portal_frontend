import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";

import AssignmentCreateForm from "./components/AssignmentCreateForm";
import AssignmentFilterBar from "./components/AssignmentFilterBar";
import AssignmentCard from "./components/AssignmentCard";
import AssignmentSubmissionsView from "./components/AssignmentSubmissionsView";

export default function TeacherAssignments() {
  const toast = useToast();
  const confirm = useConfirm();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  const [gradingId, setGradingId] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  const [filterClassroom, setFilterClassroom] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [classTeacherClassroom, setClassTeacherClassroom] = useState(null);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    subject: "",
    classroom: "",
    dueDate: "",
  });

  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [createError, setCreateError] = useState("");

  const deleteAssignment = async (assignmentId) => {
    const confirmed = await confirm({
      title: "Delete Assignment",
      message: "Are you sure you want to delete this assignment?",
      confirmText: "Delete",
      cancelText: "Cancel"
    });

    if (!confirmed) {
      return;
    }

    try {
      await axiosClient.delete(`/assignments/${assignmentId}`);
      setAssignments((previous) =>
        previous.filter((assignment) => assignment._id !== assignmentId)
      );
      toast.success("Assignment deleted successfully");
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error(error.response?.data?.message || "Unable to delete assignment");
    }
  };

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setAssignmentForm({
      title: "",
      description: "",
      subject: "",
      classroom: "",
      dueDate: "",
    });
    setCreateError("");
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/assignments");
      setAssignments(response.data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error(error.response?.data?.message || "Unable to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentOptions = async () => {
    try {
      const [subjectsResponse, assignmentResponse] = await Promise.all([
        axiosClient.get("/subjects"),
        axiosClient.get("/teaching-assignments"),
      ]);

      const allSubjects = subjectsResponse.data?.data || [];
      const assignmentData = assignmentResponse.data || {};
      const teachingAssignmentData = assignmentData.data || [];

      setTeacherAssignments(
        Array.isArray(teachingAssignmentData) ? teachingAssignmentData : []
      );

      const teacherClassroom = assignmentData.classTeacherClassroom || null;
      const teacherClassrooms = Array.isArray(assignmentData.classrooms)
        ? assignmentData.classrooms
        : [];

      setSubjects(allSubjects);
      setClassTeacherClassroom(teacherClassroom);

      const availableClassrooms = [...teacherClassrooms];

      if (
        teacherClassroom?._id &&
        !availableClassrooms.some((classroom) => classroom._id === teacherClassroom._id)
      ) {
        availableClassrooms.unshift(teacherClassroom);
      }

      setClassrooms(availableClassrooms);

      if (teacherClassroom?._id) {
        setFilterClassroom(teacherClassroom._id);
        setAssignmentForm((previous) => ({
          ...previous,
          classroom: previous.classroom || teacherClassroom._id,
        }));
      } else if (availableClassrooms.length === 1) {
        setFilterClassroom(availableClassrooms[0]._id);
        setAssignmentForm((previous) => ({
          ...previous,
          classroom: previous.classroom || availableClassrooms[0]._id,
        }));
      }
    } catch (error) {
      console.error("Failed to load assignment options:", error);
      setCreateError(error.response?.data?.message || "Failed to load subjects and classroom");
    }
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    setCreateError("");

    const { title, description, subject, classroom, dueDate } = assignmentForm;

    if (!title.trim() || !description.trim() || !subject || !classroom || !dueDate) {
      setCreateError("Please fill in all assignment fields.");
      return;
    }

    try {
      setCreatingAssignment(true);
      const response = await axiosClient.post("/assignments", {
        title: title.trim(),
        description: description.trim(),
        subject,
        classroom,
        dueDate,
      });

      const newAssignment = response.data;
      setAssignments((previous) => [newAssignment, ...previous]);
      closeCreateForm();
      toast.success("Assignment created successfully");
    } catch (error) {
      console.error("Error creating assignment:", error);
      setCreateError(error.response?.data?.message || "Unable to create assignment");
    } finally {
      setCreatingAssignment(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchAssignmentOptions();
  }, []);

  const viewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionLoading(true);

    try {
      const response = await axiosClient.get(`/submissions/assignment/${assignment._id}`);
      setSubmissions(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error(error.response?.data?.message || "Unable to fetch submissions");
    } finally {
      setSubmissionLoading(false);
    }
  };

  const startGrading = (submission) => {
    setGradingId(submission._id);
    setScore(submission.score !== undefined && submission.score !== null ? submission.score : "");
    setFeedback(submission.feedback || "");
  };

  const saveGrade = async (submissionId) => {
    if (score === "") {
      toast.error("Please enter a score");
      return;
    }

    try {
      const response = await axiosClient.put(`/submissions/${submissionId}`, {
        score: Number(score),
        feedback,
      });

      const updatedSubmission = response.data?.data;
      setSubmissions((previous) =>
        previous.map((submission) => (submission._id === submissionId ? updatedSubmission : submission))
      );

      setGradingId(null);
      setScore("");
      setFeedback("");
      toast.success("Grade saved successfully");
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error(error.response?.data?.message || "Unable to save grade");
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const assignmentClassroom = assignment.classroom?._id || "";
    const assignmentSubject = assignment.subject?._id || "";
    const searchText = filterSearch.trim().toLowerCase();
    const matchesClassroom = !filterClassroom || assignmentClassroom === filterClassroom;
    const matchesSubject = !filterSubject || assignmentSubject === filterSubject;
    const matchesSearch =
      !searchText ||
      assignment.title?.toLowerCase().includes(searchText) ||
      assignment.description?.toLowerCase().includes(searchText);

    return matchesClassroom && matchesSubject && matchesSearch;
  });

  const filterSubjects = subjects.filter((subject) => {
    if (!filterClassroom) {
      return assignments.some((assignment) => assignment.subject?._id === subject._id);
    }

    if (classTeacherClassroom?._id === filterClassroom) {
      return subject.classroom?._id === filterClassroom;
    }

    return teacherAssignments.some((assignment) => {
      const assignmentClassroom = assignment.classroom?._id || assignment.classroom;
      const assignmentSubject = assignment.subject?._id || assignment.subject;

      return (
        String(assignmentClassroom) === String(filterClassroom) &&
        String(assignmentSubject) === String(subject._id)
      );
    });
  });

  if (loading) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm dark:bg-gray-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xs font-bold text-slate-900 dark:text-white">Assignments</h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            View assignments and manage student submissions.
          </p>
        </div>

        {!selectedAssignment && (
          <button
            type="button"
            onClick={() => {
              setCreateError("");
              setShowCreateForm(true);
            }}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Add Assignment
          </button>
        )}
      </div>

      {!selectedAssignment && (
        <AssignmentCreateForm
          show={showCreateForm}
          onClose={closeCreateForm}
          onSubmit={createAssignment}
          form={assignmentForm}
          onChange={handleAssignmentChange}
          subjects={subjects}
          classrooms={classrooms}
          creating={creatingAssignment}
          error={createError}
        />
      )}

      {!selectedAssignment && !showCreateForm && (
        <AssignmentFilterBar
          filterClassroom={filterClassroom}
          setFilterClassroom={setFilterClassroom}
          filterSubject={filterSubject}
          setFilterSubject={setFilterSubject}
          filterSearch={filterSearch}
          setFilterSearch={setFilterSearch}
          classrooms={classrooms}
          filterSubjects={filterSubjects}
          totalCount={assignments.length}
          filteredCount={filteredAssignments.length}
          onReset={() => {
            setFilterClassroom(classTeacherClassroom?._id || "");
            setFilterSubject("");
            setFilterSearch("");
          }}
        />
      )}

      {!selectedAssignment && (
        <>
          {filteredAssignments.length === 0 ? (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-5 text-center shadow-sm dark:bg-gray-900">
              <p className="text-slate-500 dark:text-slate-400">
                No assignments match the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  onViewSubmissions={viewSubmissions}
                  onDelete={deleteAssignment}
                />
              ))}
            </div>
          )}
        </>
      )}

      <AssignmentSubmissionsView
        selectedAssignment={selectedAssignment}
        onBack={() => {
          setSelectedAssignment(null);
          setSubmissions([]);
        }}
        submissions={submissions}
        loading={submissionLoading}
        gradingId={gradingId}
        score={score}
        setScore={setScore}
        feedback={feedback}
        setFeedback={setFeedback}
        onStartGrading={startGrading}
        onSaveGrade={saveGrade}
        onCancelGrading={() => {
          setGradingId(null);
          setScore("");
          setFeedback("");
        }}
      />
    </div>
  );
}