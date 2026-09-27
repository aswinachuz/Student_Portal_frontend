import React from "react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconText,
  trend,
  trendColor = "text-emerald-600 dark:text-emerald-400",
  subtitle,
  color = "blue",
}) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/70 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50",
    cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/50",
  };

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className={`mt-0.5 text-[10px] font-medium ${trendColor} truncate`}>
              {trend}
            </p>
          )}
          {subtitle && (
            <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {Icon ? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm ${
              colorStyles[color] || colorStyles.blue
            }`}
          >
            <Icon size={19} />
          </div>
        ) : iconText ? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-xs shadow-sm ${
              colorStyles[color] || colorStyles.blue
            }`}
          >
            {iconText}
          </div>
        ) : null}
      </div>
    </div>
  );
}