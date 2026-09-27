import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../context/ConfirmContext";
import { formatDateTime } from "../../utils/dateUtils";

export default function Announcements() {
  const { user } = useAuth();
  const confirm = useConfirm();

  const [announcements, setAnnouncements] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Admin starts with Whole School
  // Teacher will use classroom
  const [audience, setAudience] = useState(
    user?.role === "teacher"
      ? "classroom"
      : "whole_school"
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // READ ANNOUNCEMENT STORAGE
  // =====================================================

  const getReadAnnouncementKey = () => {
    if (!user?._id) {
      return null;
    }

    return `readAnnouncements_${user._id}`;
  };

  const getReadAnnouncementIds = () => {
    const key = getReadAnnouncementKey();

    if (!key) {
      return [];
    }

    try {
      const stored = localStorage.getItem(key);

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(
        "ERROR READING ANNOUNCEMENT STORAGE:",
        error
      );

      return [];
    }
  };

  const markAnnouncementsAsRead = (announcementList) => {
    // Only teachers need this unread badge
    if (user?.role !== "teacher") {
      return;
    }

    const key = getReadAnnouncementKey();

    if (!key) {
      return;
    }

    const currentReadIds = getReadAnnouncementIds();

    const newIds = announcementList
      .map((announcement) => announcement._id)
      .filter(Boolean);

    const updatedIds = [
      ...new Set([
        ...currentReadIds,
        ...newIds,
      ]),
    ];

    localStorage.setItem(
      key,
      JSON.stringify(updatedIds)
    );

    // Notify Sidebar immediately
    window.dispatchEvent(
      new Event("announcementRead")
    );
  };

  // =====================================================
  // FETCH ANNOUNCEMENTS
  // =====================================================

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get(
        "/announcements"
      );

      const announcementList =
        Array.isArray(response.data?.data)
          ? response.data.data
          : [];

      setAnnouncements(announcementList);

      // -------------------------------------------------
      // Teacher opened announcement page
      // Mark visible announcements as read
      // -------------------------------------------------

      if (user?.role === "teacher") {
        markAnnouncementsAsRead(
          announcementList
        );
      }
    } catch (err) {
      console.error(
        "ERROR FETCHING ANNOUNCEMENTS:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    fetchAnnouncements();
  }, [user?.role]);

  // =====================================================
  // CREATE ANNOUNCEMENT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!title.trim()) {
      setError(
        "Please enter an announcement title."
      );
      return;
    }

    if (!content.trim()) {
      setError(
        "Please enter the announcement message."
      );
      return;
    }

    try {
      setSaving(true);

      await axiosClient.post(
        "/announcements",
        {
          title: title.trim(),
          content: content.trim(),
          audience:
            user?.role === "teacher"
              ? "classroom"
              : audience,
        }
      );

      setMessage(
        "Announcement published successfully."
      );

      setTitle("");
      setContent("");

      if (user?.role === "admin") {
        setAudience("whole_school");
      } else {
        setAudience("classroom");
      }

      await fetchAnnouncements();
    } catch (err) {
      console.error(
        "CREATE ANNOUNCEMENT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to publish announcement."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CHECK DELETE PERMISSION
  // =====================================================

  const canDelete = (announcement) => {
    // Admin can delete any announcement
    if (user?.role === "admin") {
      return true;
    }

    // Teacher can delete ONLY their own announcements
    if (user?.role === "teacher") {
      const announcementAuthorId =
        announcement.author?._id?.toString();

      const currentUserId =
        user?._id?.toString();

      return (
        announcementAuthorId &&
        currentUserId &&
        announcementAuthorId === currentUserId
      );
    }

    // Students cannot delete
    return false;
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Announcement",
      message: "Are you sure you want to delete this announcement?",
      confirmText: "Delete",
      cancelText: "Cancel"
    });

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(
        `/announcements/${id}`
      );

      setMessage(
        "Announcement deleted successfully."
      );

      await fetchAnnouncements();
    } catch (err) {
      console.error(
        "DELETE ANNOUNCEMENT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete announcement."
      );
    }
  };

  // =====================================================
  // AUDIENCE LABEL
  // =====================================================

  const getAudienceLabel = (announcement) => {
    if (
      announcement.audience ===
      "whole_school"
    ) {
      return "Whole School";
    }

    if (
      announcement.audience ===
      "all_teachers"
    ) {
      return "All Teachers";
    }

    if (
      announcement.audience ===
      "classroom"
    ) {
      if (announcement.classroom) {
        return (
          announcement.classroom.name ||
          "Classroom"
        );
      }

      return "Classroom";
    }

    return "Unknown";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-gray-900">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Loading announcements...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Announcements
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Send important announcements to teachers and students.
        </p>
      </div>

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

      {/* CREATE ANNOUNCEMENT */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-gray-900">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Create Announcement
          </h2>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
            Publish an announcement to the school.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* TITLE + MESSAGE */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                maxLength={200}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Message
              </label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement..."
                rows={3}
                maxLength={5000}
                className="w-full resize-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

          </div>

          {/* ADMIN AUDIENCE */}
          {user?.role === "admin" && (
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Send To
              </label>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                <label
                  className={`cursor-pointer rounded-md border p-3 transition ${
                    audience === "whole_school"
                      ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="audience"
                      value="whole_school"
                      checked={audience === "whole_school"}
                      onChange={(e) => setAudience(e.target.value)}
                      className="mt-0.5"
                    />

                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        Whole School
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                        All teachers and students
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`cursor-pointer rounded-md border p-3 transition ${
                    audience === "all_teachers"
                      ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="audience"
                      value="all_teachers"
                      checked={audience === "all_teachers"}
                      onChange={(e) => setAudience(e.target.value)}
                      className="mt-0.5"
                    />

                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        All Teachers
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                        Teachers only
                      </p>
                    </div>
                  </div>
                </label>

              </div>
            </div>
          )}

          {/* TEACHER AUDIENCE */}
          {user?.role === "teacher" && (
            <div className="rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950 px-3 py-2 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                Classroom Announcement
              </p>
              <p className="mt-0.5 text-[10px] text-blue-700 dark:text-blue-300">
                This announcement will be sent to your assigned classroom.
              </p>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-200 dark:border-slate-700 pt-3 dark:border-slate-700">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Publishing..." : "Publish Announcement"}
            </button>
          </div>

        </form>
      </div>

      {/* ANNOUNCEMENT LIST */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-sm dark:border-slate-700 dark:bg-gray-900">

        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3 dark:border-slate-700">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Published Announcements
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Previously published announcements.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {announcements.length}
          </span>
        </div>

        <div className="p-3">

          {announcements.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No announcements yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">

              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="rounded-md border border-slate-200 dark:border-slate-700 p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {announcement.title}
                        </h3>

                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {getAudienceLabel(announcement)}
                        </span>
                      </div>

                      <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-slate-600 dark:text-slate-300">
                        {announcement.content}
                      </p>

                      <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                        By {announcement.author?.name || "Admin"}
                        {" • "}
                        {formatDateTime(announcement.createdAt)}
                      </div>

                    </div>

                    {canDelete(announcement) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(announcement._id)}
                        className="w-fit rounded-md bg-red-50 dark:bg-red-950 px-2.5 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                      >
                        Delete
                      </button>
                    )}

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
