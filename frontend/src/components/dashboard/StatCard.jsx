import React from "react";

const StatCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendType = "up",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          )}
        </div>

        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4">
          <span
            className={`text-xs font-semibold ${
              trendType === "down" ? "text-red-600" : "text-emerald-600"
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