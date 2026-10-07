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
    <div
      className="
        w-full
        min-w-0
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-3
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
        sm:p-4
        md:p-5
      "
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        
        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
            {title}
          </p>

          <h3 className="mt-1 break-words text-xl font-bold text-slate-900 sm:mt-2 sm:text-2xl">
            {value}
          </h3>

          {description && (
            <p className="mt-1 break-words text-[11px] leading-4 text-slate-500 sm:text-xs">
              {description}
            </p>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-slate-700
              sm:h-10
              sm:w-10
              md:h-11
              md:w-11
            "
          >
            {icon}
          </div>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className="mt-3 sm:mt-4">
          <span
            className={`text-[11px] font-semibold sm:text-xs ${
              trendType === "down"
                ? "text-red-600"
                : "text-emerald-600"
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