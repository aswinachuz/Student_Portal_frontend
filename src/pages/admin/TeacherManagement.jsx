import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  Upload,
} from "lucide-react";

import axiosClient from "../../api/axiosClient";
import { getFileUrl } from "../../utils/fileUrl";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";

export default function TeacherManagement() {
  const toast = useToast();
  const confirm = useConfirm();
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    classroom: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ==========================================
  // FETCH TEACHERS
  // ==========================================

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get(
        "/admin/teachers"
      );

      setTeachers(response.data.data || []);
    } catch (error) {
      console.error(
        "Error fetching teachers:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load teachers"
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // FETCH CLASSROOMS
  // ==========================================

  const fetchClassrooms = async () => {
    try {
      const response = await axiosClient.get(
        "/classrooms"
      );

      setClassrooms(response.data.data || []);
    } catch (error) {
      console.error(
        "FETCH CLASSROOMS ERROR:",
        error
      );
    }
  };


  useEffect(() => {
    fetchTeachers();
    fetchClassrooms();
  }, []);


  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // ==========================================
  // PHOTO CHANGE
  // ==========================================

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be less than 5 MB.");
      return;
    }

    setError("");
    setPhoto(file);

    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
  };


  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      classroom: "",
    });

    setPhoto(null);
    setPhotoPreview("");
    setEditingTeacher(null);
    setShowForm(false);
  };


  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const openAddForm = () => {
    setEditingTeacher(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      classroom: "",
    });

    setPhoto(null);
    setPhotoPreview("");

    setError("");
    setSuccess("");
    setShowForm(true);
  };


  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const openEditForm = (teacher) => {
    setEditingTeacher(teacher);

    setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      password: "",
      phone: teacher.phone || "",
      dateOfBirth: teacher.dateOfBirth
        ? new Date(teacher.dateOfBirth)
            .toISOString()
            .split("T")[0]
        : "",
      gender: teacher.gender || "",
      address: teacher.address || "",
      classroom: teacher.classroom?._id || "",
    });

    setPhoto(null);

    if (teacher.avatar) {
      setPhotoPreview(
        getFileUrl(teacher.avatar)
      );
    } else {
      setPhotoPreview("");
    }

    setError("");
    setSuccess("");
    setShowForm(true);
  };


  // ==========================================
  // SUBMIT FORM
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      const data = new FormData();

      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append(
        "dateOfBirth",
        formData.dateOfBirth
      );
      data.append("gender", formData.gender);
      data.append("address", formData.address);
      data.append(
        "classroom",
        formData.classroom || ""
      );

      // Password is optional
      if (formData.password.trim()) {
        data.append(
          "password",
          formData.password
        );
      }

      // Photo
      if (photo) {
        data.append("avatar", photo);
      }


      // UPDATE
      if (editingTeacher) {
        await axiosClient.put(
          `/admin/teachers/${editingTeacher._id}`,
          data
        );

        setSuccess(
          "Teacher updated successfully"
        );
      }


      // ADD
      else {
        await axiosClient.post(
          "/admin/teachers",
          data
        );

        setSuccess(
          "Teacher added successfully"
        );
      }

      resetForm();

      await fetchTeachers();

    } catch (error) {
      console.error(
        "Error saving teacher:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to save teacher"
      );
    }
  };


  // ==========================================
  // DELETE TEACHER
  // ==========================================

  const handleDelete = async (teacher) => {
    const confirmed = await confirm({
      title: "Delete Teacher",
      message: `Are you sure you want to delete ${teacher.name}?`,
      confirmText: "Delete",
      cancelText: "Cancel"
    });

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await axiosClient.delete(
        `/admin/teachers/${teacher._id}`
      );

      setSuccess(
        "Teacher deleted successfully"
      );

      await fetchTeachers();

    } catch (error) {
      console.error(
        "Error deleting teacher:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete teacher"
      );
    }
  };


  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Teacher Management
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Manage teachers in the school.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={15} />
          Add Teacher
        </button>
      </div>

      {/* STAT CARD */}
      <div className="flex items-center gap-3 rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-3 dark:border-blue-900 dark:bg-blue-950/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
          <Users size={18} />
        </div>

        <div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400">
            Total Teachers
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {teachers.length}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      {success && (
        <div className="rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 px-3 py-2 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {editingTeacher ? "Edit Teacher" : "Add Teacher"}
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                {editingTeacher
                  ? "Update teacher information."
                  : "Create a new teacher account."}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={17} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >

            {/* PHOTO */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Teacher Photo
              </label>

              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Teacher"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">
                      No Photo
                    </span>
                  )}
                </div>

                <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                  <Upload size={14} />
                  {photoPreview ? "Change Photo" : "Upload Photo"}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* TEACHER ID */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Teacher ID
              </label>

              <input
                type="text"
                value={
                  editingTeacher
                    ? editingTeacher.teacherId || ""
                    : "Auto generated"
                }
                readOnly
                className="w-full cursor-not-allowed rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              />
            </div>

            {/* NAME */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Teacher Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter teacher name"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Mobile Number
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter mobile number"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="teacher@example.com"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={
                  editingTeacher
                    ? "Leave blank to keep current password"
                    : "Leave blank for 123456"
                }
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />

              {!editingTeacher && (
                <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
                  Default password is 123456
                </p>
              )}
            </div>

            {/* DATE OF BIRTH */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Date of Birth
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* GENDER */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* ADDRESS */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                placeholder="Enter teacher address"
                className="w-full resize-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* CLASSROOM */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Assigned Classroom
              </label>

              {classrooms.length > 0 ? (
                <select
                  name="classroom"
                  value={formData.classroom}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select Classroom</option>

                  {classrooms.map((classroom) => (
                    <option key={classroom._id} value={classroom._id}>
                      {classroom.name} - {classroom.section}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  No classrooms available
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2 md:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-1.5 text-[10px] font-semibold text-white transition hover:bg-blue-700"
              >
                {editingTeacher ? "Update Teacher" : "Add Teacher"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-slate-300 dark:border-slate-600 px-4 py-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TEACHER TABLE */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-sm dark:border-slate-700 dark:bg-slate-900">

        {loading ? (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Loading teachers...
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-7 text-center">
            <Users
              size={32}
              className="mx-auto text-slate-400 dark:text-slate-500"
            />

            <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              No teachers found
            </p>

            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              Add a teacher to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full text-left text-xs dark:text-slate-200">

              <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <tr className="dark:border-slate-700">
                  <th className="px-3 py-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 dark:border-slate-700">
                    Teacher
                  </th>

                  <th className="px-3 py-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 dark:border-slate-700">
                    Teacher ID
                  </th>

                  <th className="px-3 py-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 dark:border-slate-700">
                    Email
                  </th>

                  <th className="px-3 py-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 dark:border-slate-700">
                    Phone
                  </th>

                  <th className="px-3 py-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 dark:border-slate-700">
                    Classroom
                  </th>

                  <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-700 dark:text-slate-300 dark:border-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="dark:bg-gray-900">
                {teachers.map((teacher) => (
                  <tr
                    key={teacher._id}
                    className="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {/* TEACHER */}
                    <td className="px-3 py-2.5 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          {teacher.avatar ? (
                            <img
                              src={getFileUrl(teacher.avatar)}
                              alt={teacher.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            teacher.name
                              ?.charAt(0)
                              ?.toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {teacher.name}
                          </p>

                          <p className="text-[9px] text-slate-500 dark:text-slate-400">
                            Teacher
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* TEACHER ID */}
                    <td className="px-3 py-2.5 dark:border-slate-700">
                      <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-1 text-[9px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {teacher.teacherId || "-"}
                      </span>
                    </td>

                    {/* EMAIL */}
                    <td className="px-3 py-2.5 text-[10px] text-slate-600 dark:text-slate-400 dark:border-slate-700">
                      {teacher.email}
                    </td>

                    {/* PHONE */}
                    <td className="px-3 py-2.5 text-[10px] text-slate-600 dark:text-slate-400 dark:border-slate-700">
                      {teacher.phone || "-"}
                    </td>

                    {/* CLASSROOM */}
                    <td className="px-3 py-2.5 dark:border-slate-700">
                      {teacher.classroom ? (
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-1 text-[9px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {teacher.classroom.name} -{" "}
                          {teacher.classroom.section}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          Not assigned
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-3 py-2.5 dark:border-slate-700">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditForm(teacher)}
                          className="flex items-center gap-1 rounded-md border border-blue-200 px-2 py-1 text-[9px] font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(teacher)}
                          className="flex items-center gap-1 rounded-md border border-red-200 dark:border-red-800 px-2 py-1 text-[9px] font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                        >
                          <Trash2 size={12} />
                          Delete
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
}
