import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, BookOpen, Users, School } from "lucide-react";
import StatCard from "../../components/common/StatCard";
import axiosClient from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import { DAYS as days, TEACHER_PERIODS as periods } from "../../constants/timetable";
import TimetableClassHeader from "./components/TimetableClassHeader";
import TimetableForm from "./components/TimetableForm";
import TimetableGrid from "./components/TimetableGrid";

export default function TeacherTimetable() {
  const toast = useToast();
  const confirm = useConfirm();
  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [classTeacherClassroom, setClassTeacherClassroom] = useState(null);

  const [formData, setFormData] = useState({
    subject: "",
    teacher: "",
    day: "Monday",
    period: "1st",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const totalSlots = timetable.length;
    const uniqueSubjects = new Set(
      timetable.map((t) => (t.subject?._id || t.subject || "")).filter(Boolean)
    ).size;
    const uniqueTeachers = new Set(
      timetable.map((t) => (t.teacher?._id || t.teacher || "")).filter(Boolean)
    ).size;
    return {
      totalSlots,
      uniqueSubjects,
      uniqueTeachers,
    };
  }, [timetable]);

  // ==========================================
  // GET ID
  // ==========================================

  const getId = (value) => {
    if (!value) return "";
    if (typeof value === "object" && value._id) {
      return String(value._id);
    }
    return String(value);
  };

  // ==========================================
  // FETCH DATA
  // ==========================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [timetableResponse, assignmentResponse] = await Promise.all([
        axiosClient.get("/timetable"),
        axiosClient.get("/teaching-assignments"),
      ]);

      const timetableData = timetableResponse.data?.data || [];
      const assignmentData = assignmentResponse.data?.data || [];

      setTimetable(Array.isArray(timetableData) ? timetableData : []);
      setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
      setIsClassTeacher(assignmentResponse.data?.isClassTeacher === true);
      setClassTeacherClassroom(
        assignmentResponse.data?.classTeacherClassroom || null
      );
    } catch (err) {
      console.error("ERROR LOADING TIMETABLE:", err);
      setError(err.response?.data?.message || "Unable to load timetable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // CLASSROOM ASSIGNMENTS
  // ==========================================

  const classroomAssignments = useMemo(() => {
    if (!isClassTeacher || !classTeacherClassroom?._id) {
      return [];
    }

    return assignments.filter(
      (assignment) =>
        getId(assignment.classroom) === getId(classTeacherClassroom)
    );
  }, [assignments, isClassTeacher, classTeacherClassroom]);

  // ==========================================
  // SUBJECTS
  // ==========================================

  const classroomSubjects = useMemo(() => {
    const subjectMap = new Map();

    classroomAssignments.forEach((assignment) => {
      if (!assignment.subject?._id) {
        return;
      }

      const subjectId = String(assignment.subject._id);

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, assignment.subject);
      }
    });

    return Array.from(subjectMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [classroomAssignments]);

  // ==========================================
  // TEACHERS FOR SUBJECT
  // ==========================================

  const subjectTeachers = useMemo(() => {
    if (!formData.subject) {
      return [];
    }

    return classroomAssignments
      .filter(
        (assignment) => getId(assignment.subject) === String(formData.subject)
      )
      .map((assignment) => assignment.teacher)
      .filter(Boolean);
  }, [classroomAssignments, formData.subject]);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "subject" ? { teacher: "" } : {}),
    }));

    setMessage("");
    setError("");
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      subject: "",
      teacher: "",
      day: "Monday",
      period: "1st",
    });

    setEditingId(null);
    setMessage("");
    setError("");
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.subject) {
      setError("Please select a subject.");
      return;
    }

    if (!formData.teacher) {
      setError("Please select a teacher.");
      return;
    }

    if (!formData.period) {
      setError("Please select a period.");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await axiosClient.put(`/timetable/${editingId}`, formData);
        setMessage("Timetable updated successfully.");
      } else {
        await axiosClient.post("/timetable", formData);
        setMessage("Timetable added successfully.");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      console.error("TIMETABLE SAVE ERROR:", err);
      setError(err.response?.data?.message || "Failed to save timetable.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (item) => {
    setEditingId(item._id);

    setFormData({
      subject: item.subject?._id || item.subject || "",
      teacher: item.teacher?._id || item.teacher || "",
      day: item.day || "Monday",
      period:
        item.period ||
        (item.startTime?.startsWith("09")
          ? "1st"
          : item.startTime?.startsWith("10")
          ? "2nd"
          : item.startTime?.startsWith("11")
          ? "3rd"
          : item.startTime?.startsWith("12") || item.startTime?.startsWith("13")
          ? "4th"
          : item.startTime?.startsWith("14")
          ? "5th"
          : "6th"),
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Entry",
      message: "Are you sure you want to delete this timetable entry?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(`/timetable/${id}`);
      setMessage("Timetable deleted successfully.");
      await fetchData();
    } catch (err) {
      console.error("DELETE TIMETABLE ERROR:", err);
      setError(err.response?.data?.message || "Failed to delete timetable.");
    }
  };

  // ==========================================
  // FIND TIMETABLE ENTRY
  // ==========================================

  const getEntry = (day, periodKey) => {
    return timetable.find(
      (item) =>
        item.day === day &&
        (item.period === periodKey ||
          (periodKey === "1st" && item.startTime?.startsWith("09")) ||
          (periodKey === "2nd" && item.startTime?.startsWith("10")) ||
          (periodKey === "3rd" && item.startTime?.startsWith("11")) ||
          (periodKey === "4th" &&
            (item.startTime?.startsWith("12") || item.startTime?.startsWith("13"))) ||
          (periodKey === "5th" && item.startTime?.startsWith("14")) ||
          (periodKey === "6th" && item.startTime?.startsWith("15")))
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading timetable...
        </p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="space-y-6">
      {/* ======================================
          PAGE HEADER
      ======================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800/40">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Class Timetable
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Weekly master schedule, slot allotments, and faculty assignments
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Scheduled Periods"
          value={stats.totalSlots}
          icon={Clock}
          color="blue"
          subtitle="Allocated weekly slots"
        />
        <StatCard
          title="Subjects Taught"
          value={stats.uniqueSubjects}
          icon={BookOpen}
          color="indigo"
          subtitle="Unique active courses"
        />
        <StatCard
          title="Teachers Assigned"
          value={stats.uniqueTeachers}
          icon={Users}
          color="emerald"
          subtitle="Distinct faculty assigned"
        />
        <StatCard
          title="Classroom Scope"
          value={
            classTeacherClassroom
              ? `${classTeacherClassroom.name} - ${classTeacherClassroom.section}`
              : "Faculty"
          }
          icon={School}
          color="purple"
          subtitle={
            isClassTeacher ? "Class Teacher Access" : "Subject Teacher Access"
          }
        />
      </div>

      <TimetableClassHeader
        isClassTeacher={isClassTeacher}
        classTeacherClassroom={classTeacherClassroom}
      />

      {isClassTeacher && (
        <TimetableForm
          editingId={editingId}
          formData={formData}
          classroomSubjects={classroomSubjects}
          subjectTeachers={subjectTeachers}
          days={days}
          saving={saving}
          message={message}
          error={error}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      )}

      <TimetableGrid
        timetable={timetable}
        days={days}
        periods={periods}
        isClassTeacher={isClassTeacher}
        classTeacherClassroom={classTeacherClassroom}
        getEntry={getEntry}
        onEdit={handleEdit}
        onDelete={handleDelete}
        error={error}
      />
    </div>
  );
}
