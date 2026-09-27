import React, { useEffect } from "react";

const AnnouncementToast = ({ announcement, onClose, onView }) => {
  useEffect(() => {
    if (!announcement) return;

    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [announcement, onClose]);

  if (!announcement) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-[9998] w-[360px] max-w-[calc(100vw-30px)]">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-2xl">
        
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
            🔔
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                New Announcement
              </h3>

              <button
                onClick={onClose}
                className="text-lg leading-none text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300"
              >
                ×
              </button>
            </div>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {announcement.title
                ? `Admin has posted: "${announcement.title}"`
                : "Admin has posted a new announcement."}
            </p>

            <button
              onClick={onView}
              className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800"
            >
              View Announcement →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnnouncementToast;