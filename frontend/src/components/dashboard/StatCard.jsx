import React from "react";


// ============================================================
// STAT CARD
// loading     -> shows a pulse skeleton (first load only)
// refreshing  -> dims the card while the dashboard reloads
// ============================================================

const StatCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendType = "up",
  loading = false,
  refreshing = false,
}) => {
  // FIRST LOAD SKELETON
  if (loading) {
    return (
      <div className="w-full min-w-0 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-start justify-between gap-3">

          <div className="flex-1">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-20 rounded bg-slate-200" />
          </div>

          <div className="h-10 w-10 rounded-lg bg-slate-200" />

        </div>

      </div>
    );
  }

  return (
    <div
      className={`w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-opacity duration-200 ${
        refreshing ? "opacity-70" : "opacity-100"
      }`}
    >

      <div className="flex min-w-0 items-start justify-between gap-3">

        {/* CONTENT */}
        <div className="min-w-0 flex-1">

          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-1 break-words text-2xl font-bold text-slate-900">
            {value}
          </p>

          {description && (
            <p className="mt-1 break-words text-xs text-slate-500">
              {description}
            </p>
          )}

        </div>

        {/* ICON */}
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            {icon}
          </div>
        )}

      </div>

      {/* TREND */}
      {trend && (
        <div className="mt-3">

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              trendType === "down"
                ? "bg-red-100 text-red-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {trend}
          </span>

        </div>
      )}

    </div>
  );
};

export default StatCard;