import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  School,
  Users,
  X,
  UserCheck,
} from "lucide-react";

import axiosClient from "../../api/axiosClient";
import { useConfirm } from "../../context/ConfirmContext";

const ClassroomManagement = () => {
  const confirm = useConfirm();
  // =========================================================
  // STATE
  // =========================================================

  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assigningTeacher, setAssigningTeacher] = useState(false);

  // Add/Edit classroom form
  const [showForm, setShowForm] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    section: "",
  });

  // Teacher assignment form
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // Messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // FETCH CLASSROOMS
  // =========================================================

  const fetchClassrooms = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get("/classrooms");

      setClassrooms(response.data.data || []);
    } catch (err) {
      console.error("FETCH CLASSROOMS ERROR:", err);

      setError(
        err.response?.data?.message || "Unable to load classrooms"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH TEACHERS
  // =========================================================

  const fetchTeachers = async () => {
    try {
      const response = await axiosClient.get("/admin/teachers");

      setTeachers(response.data.data || []);
    } catch (err) {
      console.error("FETCH TEACHERS ERROR:", err);

      setError(
        err.response?.data?.message || "Unable to load teachers"
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchClassrooms();
    fetchTeachers();
  }, []);

  // =========================================================
  // FORM INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleAddClassroom = () => {
    setEditingClassroom(null);

    setFormData({
      name: "",
      section: "",
    });

    setMessage("");
    setError("");

    setShowTeacherForm(false);
    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEditClassroom = (classroom) => {
    setEditingClassroom(classroom);

    setFormData({
      name: classroom.name || "",
      section: classroom.section || "",
    });

    setMessage("");
    setError("");

    setShowTeacherForm(false);
    setShowForm(true);
  };

  // =========================================================
  // CLOSE CLASSROOM FORM
  // =========================================================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClassroom(null);

    setFormData({
      name: "",
      section: "",
    });
  };

  // =========================================================
  // ADD / UPDATE CLASSROOM
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.name.trim()) {
      setError("Class name is required");
      return;
    }

    if (!formData.section.trim()) {
      setError("Section is required");
      return;
    }

    try {
      if (editingClassroom) {
        // UPDATE CLASSROOM

        await axiosClient.put(
          `/classrooms/${editingClassroom._id}`,
          {
            name: formData.name.trim(),
            section: formData.section.trim(),
          }
        );

        setMessage("Classroom updated successfully");
      } else {
        // ADD CLASSROOM

        await axiosClient.post("/classrooms", {
          name: formData.name.trim(),
          section: formData.section.trim(),
        });

        setMessage("Classroom added successfully");
      }

      handleCloseForm();

      await fetchClassrooms();
    } catch (err) {
      console.error("SAVE CLASSROOM ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save classroom"
      );
    }
  };

  // =========================================================
  // DELETE CLASSROOM
  // =========================================================

  const handleDeleteClassroom = async (id) => {
    const confirmDelete = await confirm({
      title: "Delete Classroom",
      message: "Are you sure you want to delete this classroom?",
      confirmText: "Delete",
      cancelText: "Cancel"
    });

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(`/classrooms/${id}`);

      setMessage("Classroom deleted successfully");

      await fetchClassrooms();
    } catch (err) {
      console.error("DELETE CLASSROOM ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete classroom"
      );
    }
  };

  // =========================================================
  // OPEN TEACHER ASSIGNMENT
  // =========================================================

  const handleAssignTeacher = (classroom) => {
    setSelectedClassroom(classroom);

    setSelectedTeacher(
      classroom.classTeacher?._id || ""
    );

    setMessage("");
    setError("");

    setShowForm(false);

    setShowTeacherForm(true);
  };

  // =========================================================
  // CLOSE TEACHER FORM
  // =========================================================

  const handleCloseTeacherForm = () => {
    setShowTeacherForm(false);

    setSelectedClassroom(null);

    setSelectedTeacher("");
  };

  // =========================================================
  // ASSIGN CLASS TEACHER
  // =========================================================

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!selectedTeacher) {
      setError("Please select a teacher");
      return;
    }

    if (!selectedClassroom) {
      setError("Classroom not selected");
      return;
    }

    try {
      setAssigningTeacher(true);

      await axiosClient.put(
        `/classrooms/${selectedClassroom._id}/teacher`,
        {
          teacherId: selectedTeacher,
        }
      );

      setMessage(
        "Class teacher assigned successfully"
      );

      handleCloseTeacherForm();

      await fetchClassrooms();
    } catch (err) {
      console.error(
        "ASSIGN TEACHER ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to assign teacher"
      );
    } finally {
      setAssigningTeacher(false);
    }
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const totalClasses = classrooms.length;

  const assignedTeachers = classrooms.filter(
    (classroom) => classroom.classTeacher
  ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Loading classrooms...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-4">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Classes & Sections
          </h1>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Manage classrooms and assign class teachers.
          </p>
        </div>

        <button
          onClick={handleAddClassroom}
          className="flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
        >
          <Plus size={15} />
          Add Class
        </button>

      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {message && (
        <div className="rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 px-3 py-2 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          {message}
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* =====================================================
          ADD / EDIT CLASSROOM FORM
      ====================================================== */}

      {showForm && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="mb-3 flex items-center justify-between">

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {editingClassroom
                  ? "Edit Classroom"
                  : "Add New Classroom"}
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                Enter class and section details.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseForm}
              className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={17} />
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >

            {/* CLASS NAME */}

            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Class
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: XI"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* SECTION */}

            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Section
              </label>

              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="Example: A"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* BUTTONS */}

            <div className="flex gap-2 md:col-span-2">

              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                {editingClassroom
                  ? "Update Classroom"
                  : "Add Classroom"}
              </button>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      {/* =====================================================
          ASSIGN CLASS TEACHER FORM
      ====================================================== */}

      {showTeacherForm && selectedClassroom && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="mb-3 flex items-center justify-between">

            <div className="flex items-center gap-2.5">

              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
                <UserCheck size={16} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Assign Class Teacher
                </h2>

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {selectedClassroom.name} -{" "}
                  {selectedClassroom.section}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={handleCloseTeacherForm}
              className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={17} />
            </button>

          </div>

          <form
            onSubmit={handleTeacherSubmit}
            className="space-y-3"
          >

            {/* TEACHER */}

            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Select Teacher
              </label>

              <select
                value={selectedTeacher}
                onChange={(e) =>
                  setSelectedTeacher(e.target.value)
                }
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="">
                  Select a teacher
                </option>

                {teachers.map((teacher) => (
                  <option
                    key={teacher._id}
                    value={teacher._id}
                  >
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>

              {teachers.length === 0 && (
                <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                  No teachers found. Please add a teacher first.
                </p>
              )}
            </div>

            {/* BUTTONS */}

            <div className="flex gap-2">

              <button
                type="submit"
                disabled={assigningTeacher}
                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigningTeacher
                  ? "Assigning..."
                  : "Assign Teacher"}
              </button>

              <button
                type="button"
                onClick={handleCloseTeacherForm}
                className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        {/* TOTAL CLASSES */}

        <div className="flex items-center gap-3 rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-3 dark:border-blue-900 dark:bg-blue-950/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
            <School size={18} />
          </div>

          <div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400">
              Total Classes
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {totalClasses}
            </p>
          </div>
        </div>

        {/* ASSIGNED TEACHERS */}

        <div className="flex items-center gap-3 rounded-lg border border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-950 p-3 dark:border-green-900 dark:bg-green-950/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-600 text-white">
            <Users size={18} />
          </div>

          <div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400">
              Assigned Teachers
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {assignedTeachers}
            </p>
          </div>
        </div>

      </div>

      {/* =====================================================
          CLASSROOM TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-sm dark:border-slate-700 dark:bg-gray-900">

        {/* TABLE HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3 dark:border-slate-700">

          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              All Classes
            </h2>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Manage classes, sections and class teachers
            </p>
          </div>

          <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
            {totalClasses} Classes
          </span>

        </div>

        {/* TABLE */}

        {classrooms.length === 0 ? (
          <div className="p-8 text-center">

            <School
              size={32}
              className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
            />

            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              No classrooms found
            </h3>

            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              Add your first classroom to get started.
            </p>

            <button
              onClick={handleAddClassroom}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={15} />
              Add Class
            </button>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px] dark:text-slate-200">

              <thead className="dark:bg-slate-800">
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:border-slate-700 dark:bg-gray-800">

                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:border-slate-700">
                    #
                  </th>

                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:border-slate-700">
                    Class
                  </th>

                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:border-slate-700">
                    Section
                  </th>

                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:border-slate-700">
                    Class Teacher
                  </th>

                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:border-slate-700">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 dark:bg-gray-900">

                {classrooms.map((classroom, index) => (

                  <tr
                    key={classroom._id}
                    className="transition hover:bg-slate-50 dark:hover:bg-gray-800/50"
                  >

                    {/* NUMBER */}

                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-700">
                      {index + 1}
                    </td>

                    {/* CLASS */}

                    <td className="whitespace-nowrap px-4 py-2.5 dark:border-slate-700">

                      <div className="flex items-center gap-2">

                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 p-1 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          <School size={15} />
                        </div>

                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {classroom.name}
                        </span>

                      </div>

                    </td>

                    {/* SECTION */}

                    <td className="whitespace-nowrap px-4 py-2.5 dark:border-slate-700">

                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-gray-800 dark:text-slate-300">
                        Section {classroom.section}
                      </span>

                    </td>

                    {/* CLASS TEACHER */}

                    <td className="px-4 py-2.5 dark:border-slate-700">

                      {classroom.classTeacher ? (
                        <div>

                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {classroom.classTeacher.name}
                          </p>

                          {classroom.classTeacher.email && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {classroom.classTeacher.email}
                            </p>
                          )}

                        </div>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                          Not Assigned
                        </span>
                      )}

                    </td>

                    {/* ACTIONS */}

                    <td className="whitespace-nowrap px-4 py-2.5 dark:border-slate-700">

                      <div className="flex items-center justify-end gap-1">

                        {/* ASSIGN TEACHER */}

                        <button
                          type="button"
                          onClick={() =>
                            handleAssignTeacher(classroom)
                          }
                          className="rounded-md p-1.5 text-green-600 transition hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                          title="Assign Teacher"
                        >
                          <UserCheck size={15} />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            handleEditClassroom(classroom)
                          }
                          className="rounded-md p-1.5 text-blue-600 dark:text-blue-400 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                          title="Edit Classroom"
                        >
                          <Pencil size={15} />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClassroom(
                              classroom._id
                            )
                          }
                          className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                          title="Delete Classroom"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default ClassroomManagement;