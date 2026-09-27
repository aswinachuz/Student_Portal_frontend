import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  School,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";

import SubjectFormModal from "./components/SubjectFormModal";
import SubjectTable from "./components/SubjectTable";
import SubjectRoleBanner from "./components/SubjectRoleBanner";
import StatCard from "../../components/common/StatCard";

export default function TeacherSubjects() {
  const toast = useToast();
  const confirm = useConfirm();

  const [allSubjects, setAllSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [classTeacherClassroom, setClassTeacherClassroom] = useState(null);
  const [isClassTeacher, setIsClassTeacher] = useState(false);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    code: "",
    classroom: "",
  });

  // --------------------------------------------------
  // GET ID HELPER
  // --------------------------------------------------

  const getId = (value) => {
    if (!value) return "";
    if (typeof value === "object") return value._id || "";
    return value;
  };

  // --------------------------------------------------
  // FETCH SUBJECTS
  // --------------------------------------------------

  const fetchSubjects = async () => {
    try {
      const response = await axiosClient.get("/subjects");

      const data = response.data?.data || response.data || [];

      setAllSubjects(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching subjects:", error);

      setError(
        error.response?.data?.message || "Unable to fetch subjects"
      );

      return [];
    }
  };

  // --------------------------------------------------
  // FETCH TEACHING ASSIGNMENTS
  // --------------------------------------------------

  const fetchTeacherAssignments = async () => {
    try {
      const response = await axiosClient.get("/teaching-assignments");

      const data = response.data?.data || [];

      setAssignments(Array.isArray(data) ? data : []);

      const classTeacher =
        response.data?.isClassTeacher === true;

      setIsClassTeacher(classTeacher);

      const teacherClassroom =
        response.data?.classTeacherClassroom || null;

      setClassTeacherClassroom(teacherClassroom);

      // Only a Class Teacher can manage subject teachers.
      if (classTeacher) {
        try {
          const teacherResponse =
            await axiosClient.get(
              "/teaching-assignments/teachers"
            );

          setTeachers(
            teacherResponse.data?.data || []
          );
        } catch (teacherError) {
          console.error(
            "Error fetching teachers:",
            teacherError
          );

          setTeachers([]);
        }
      } else {
        setTeachers([]);
      }

      return {
        assignments: Array.isArray(data) ? data : [],
        isClassTeacher: classTeacher,
        classTeacherClassroom: teacherClassroom,
      };
    } catch (error) {
      if (error.response?.status === 403) {
        setIsClassTeacher(false);
        setAssignments([]);
        setTeachers([]);
        setClassTeacherClassroom(null);

        return {
          assignments: [],
          isClassTeacher: false,
          classTeacherClassroom: null,
        };
      }

      console.error(
        "Error fetching teacher assignments:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to fetch teacher assignments"
      );

      return {
        assignments: [],
        isClassTeacher: false,
        classTeacherClassroom: null,
      };
    }
  };

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      await Promise.all([
        fetchSubjects(),
        fetchTeacherAssignments(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // CLASSROOMS
  // --------------------------------------------------

  const visibleClassrooms = useMemo(() => {
    // Class Teacher manages only their own classroom.
    if (isClassTeacher && classTeacherClassroom) {
      return [classTeacherClassroom];
    }

    // Subject Teacher sees only classrooms from their
    // teaching assignments.
    const classroomMap = new Map();

    assignments.forEach((assignment) => {
      const classroom = assignment.classroom;

      if (classroom?._id) {
        classroomMap.set(
          String(classroom._id),
          classroom
        );
      }
    });

    return Array.from(classroomMap.values());
  }, [
    isClassTeacher,
    classTeacherClassroom,
    assignments,
  ]);

  // --------------------------------------------------
  // SUBJECTS VISIBLE TO THIS TEACHER
  // --------------------------------------------------

  const visibleSubjects = useMemo(() => {
    if (isClassTeacher) {
      // Class Teacher manages subjects belonging to
      // their own classroom.
      if (!classTeacherClassroom?._id) {
        return [];
      }

      return allSubjects.filter(
        (subject) =>
          String(getId(subject.classroom)) ===
          String(classTeacherClassroom._id)
      );
    }

    // Subject Teacher sees only subjects assigned to them.
    const assignedKeys = new Set(
      assignments.map((assignment) => {
        return `${getId(
          assignment.classroom
        )}_${getId(assignment.subject)}`;
      })
    );

    return allSubjects.filter((subject) => {
      const subjectClassroomId =
        getId(subject.classroom);

      return Array.from(assignedKeys).some(
        (key) =>
          key ===
          `${subjectClassroomId}_${subject._id}`
      );
    });
  }, [
    isClassTeacher,
    classTeacherClassroom,
    allSubjects,
    assignments,
  ]);

  // --------------------------------------------------
  // FIND ASSIGNMENT
  // --------------------------------------------------

  const getAssignmentForSubject = (
    subjectId,
    classroomId
  ) => {
    return assignments.find((assignment) => {
      const assignmentSubjectId = getId(
        assignment.subject
      );

      const assignmentClassroomId = getId(
        assignment.classroom
      );

      return (
        String(assignmentSubjectId) ===
          String(subjectId) &&
        String(assignmentClassroomId) ===
          String(classroomId)
      );
    });
  };

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    // Only Class Teacher can create subjects.
    if (!isClassTeacher) {
      return;
    }

    setEditingSubject(null);
    setError("");
    setMessage("");

    setForm({
      name: "",
      code: "",
      classroom: classTeacherClassroom?._id || "",
    });

    setShowForm(true);
  };

  const openEditForm = (subject) => {
    // Only Class Teacher can edit subjects.
    if (!isClassTeacher) {
      return;
    }

    setEditingSubject(subject);
    setError("");
    setMessage("");

    setForm({
      name: subject.name || "",
      code: subject.code || "",
      classroom: getId(subject.classroom),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSubject(null);

    setForm({
      name: "",
      code: "",
      classroom: classTeacherClassroom?._id || "",
    });
  };

  // --------------------------------------------------
  // SAVE SUBJECT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isClassTeacher) {
      setError(
        "Only the Class Teacher can manage subjects."
      );
      return;
    }

    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Subject name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Subject code is required.");
      return;
    }

    if (!form.classroom) {
      setError("Please select a classroom.");
      return;
    }

    // Prevent Class Teacher from changing the subject
    // to another classroom.
    if (
      classTeacherClassroom?._id &&
      String(form.classroom) !==
        String(classTeacherClassroom._id)
    ) {
      setError(
        "You can manage subjects only for your own classroom."
      );
      return;
    }

    try {
      setSaving(true);

      const data = {
        name: form.name.trim(),
        code: form.code.trim(),
        classroom: form.classroom,
      };

      if (editingSubject) {
        await axiosClient.put(
          `/subjects/${editingSubject._id}`,
          data
        );

        setMessage(
          "Subject updated successfully."
        );
      } else {
        await axiosClient.post(
          "/subjects",
          data
        );

        setMessage(
          "Subject added successfully."
        );
      }

      closeForm();

      await fetchSubjects();
    } catch (error) {
      console.error(
        "Error saving subject:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to save subject"
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE SUBJECT
  // --------------------------------------------------

  const deleteSubject = async (id) => {
    if (!isClassTeacher) {
      setError(
        "Only the Class Teacher can delete subjects."
      );
      return;
    }

    const confirmed = await confirm({
      title: "Delete Subject",
      message: "Are you sure you want to delete this subject?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await axiosClient.delete(
        `/subjects/${id}`
      );

      setMessage(
        "Subject deleted successfully."
      );

      await fetchSubjects();
      await fetchTeacherAssignments();
    } catch (error) {
      console.error(
        "Error deleting subject:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete subject"
      );
    }
  };

  // --------------------------------------------------
  // ASSIGN / CHANGE TEACHER
  // --------------------------------------------------

  const saveTeacherAssignment = async (
    subject,
    teacherId
  ) => {
    if (!isClassTeacher) {
      setError(
        "Only the Class Teacher can assign subject teachers."
      );
      return;
    }

    if (!teacherId) {
      return;
    }

    const classroomId = getId(
      subject.classroom
    );

    // Safety check.
    if (
      classTeacherClassroom?._id &&
      String(classroomId) !==
        String(classTeacherClassroom._id)
    ) {
      setError(
        "You can assign teachers only for your own classroom."
      );
      return;
    }

    const existingAssignment =
      getAssignmentForSubject(
        subject._id,
        classroomId
      );

    try {
      setAssignmentSaving(subject._id);
      setError("");
      setMessage("");

      if (existingAssignment) {
        await axiosClient.put(
          `/teaching-assignments/${existingAssignment._id}`,
          {
            teacher: teacherId,
          }
        );

        setMessage(
          "Teacher changed successfully."
        );
      } else {
        await axiosClient.post(
          "/teaching-assignments",
          {
            subject: subject._id,
            teacher: teacherId,
          }
        );

        setMessage(
          "Teacher assigned successfully."
        );
      }

      await fetchTeacherAssignments();
    } catch (error) {
      console.error(
        "Teacher assignment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to assign teacher"
      );
    } finally {
      setAssignmentSaving("");
    }
  };

  // --------------------------------------------------
  // REMOVE TEACHER
  // --------------------------------------------------

  const removeTeacherAssignment = async (
    subject
  ) => {
    if (!isClassTeacher) {
      setError(
        "Only the Class Teacher can remove subject teachers."
      );
      return;
    }

    const classroomId = getId(
      subject.classroom
    );

    const assignment =
      getAssignmentForSubject(
        subject._id,
        classroomId
      );

    if (!assignment) {
      return;
    }

    const confirmed = await confirm({
      title: "Remove Teacher",
      message: "Remove this teacher from the subject?",
      confirmText: "Remove",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      setAssignmentSaving(subject._id);
      setError("");
      setMessage("");

      await axiosClient.delete(
        `/teaching-assignments/${assignment._id}`
      );

      setMessage(
        "Teacher assignment removed."
      );

      await fetchTeacherAssignments();
    } catch (error) {
      console.error(
        "Remove teacher error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to remove teacher"
      );
    } finally {
      setAssignmentSaving("");
    }
  };

  // --------------------------------------------------
  // COUNTS
  // IMPORTANT:
  // This useMemo must be ABOVE the loading return.
  // --------------------------------------------------

  const totalCount = visibleSubjects.length;

  const assignedCount = useMemo(() => {
    return visibleSubjects.filter((s) => {
      const cid = getId(s.classroom);
      const a = getAssignmentForSubject(
        s._id,
        cid
      );

      return Boolean(
        a?.teacher?._id || a?.teacher
      );
    }).length;
  }, [visibleSubjects, assignments]);

  const unassignedCount =
    totalCount - assignedCount;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Loading subjects...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
              <BookOpen size={12} />
              Curriculum Catalog
            </span>
          </div>

          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subject Management
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define classroom course subjects and allocate teaching faculty.
          </p>
        </div>

        {isClassTeacher && !showForm && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
          >
            <Plus size={14} />
            Add Subject
          </button>
        )}
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Subjects"
          value={totalCount}
          icon={BookOpen}
          color="blue"
          trend="Curriculum courses"
          trendColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Faculty Assigned"
          value={assignedCount}
          icon={Users}
          color="emerald"
          trend={`${assignedCount} of ${totalCount} staffed`}
          trendColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Unassigned"
          value={unassignedCount}
          icon={AlertCircle}
          color={
            unassignedCount > 0
              ? "amber"
              : "emerald"
          }
          trend={
            unassignedCount > 0
              ? "Requires faculty"
              : "Fully covered"
          }
          trendColor={
            unassignedCount > 0
              ? "text-amber-600 dark:text-amber-400"
              : "text-emerald-600 dark:text-emerald-400"
          }
        />

        <StatCard
          title="Classroom"
          value={
            classTeacherClassroom
              ? `${classTeacherClassroom.name}${
                  classTeacherClassroom.section
                    ? ` - ${classTeacherClassroom.section}`
                    : ""
                }`
              : "Assigned"
          }
          icon={School}
          color="purple"
          trend={
            isClassTeacher
              ? "Class Teacher"
              : "Teaching Staff"
          }
          trendColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* ROLE MESSAGE */}
      <SubjectRoleBanner
        isClassTeacher={isClassTeacher}
        classTeacherClassroom={classTeacherClassroom}
      />

      {/* MESSAGES */}
      {message && (
        <div className="rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 px-3 py-2 text-xs text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {isClassTeacher && (
        <SubjectFormModal
          show={showForm}
          editingSubject={editingSubject}
          form={form}
          saving={saving}
          visibleClassrooms={visibleClassrooms}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      {/* SUBJECT LIST */}
      {!showForm && (
        <SubjectTable
          subjects={visibleSubjects}
          isClassTeacher={isClassTeacher}
          teachers={teachers}
          assignmentSaving={assignmentSaving}
          getAssignmentForSubject={getAssignmentForSubject}
          onSaveTeacherAssignment={saveTeacherAssignment}
          onRemoveTeacherAssignment={
            removeTeacherAssignment
          }
          onEdit={openEditForm}
          onDelete={deleteSubject}
          onAdd={openAddForm}
        />
      )}
    </div>
  );
}