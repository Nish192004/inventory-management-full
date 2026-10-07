import React from "react";

const RecentActivity = ({ activities = [] }) => {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-5">
      
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          Recent Activity
        </h2>

        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Latest inventory activity
        </p>
      </div>

      {/* Empty State */}
      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 sm:py-10 sm:text-sm">
          No recent activity
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {activities.slice(0, 8).map((activity, index) => (
            <div
              key={activity.id || index}
              className="
                flex
                min-w-0
                gap-2
                border-b
                border-slate-100
                pb-3
                last:border-0
                sm:gap-3
              "
            >
              {/* Activity Indicator */}
              <div
                className="
                  mt-1.5
                  h-2
                  w-2
                  shrink-0
                  rounded-full
                  bg-blue-500
                  sm:h-2.5
                  sm:w-2.5
                "
              />

              {/* Activity Content */}
              <div className="min-w-0 flex-1">
                
                <p className="break-words text-xs font-medium text-slate-900 sm:text-sm">
                  {activity.type ||
                    activity.action ||
                    "Inventory activity"}
                </p>

                <p className="mt-1 break-words text-[11px] leading-4 text-slate-500 sm:text-xs">
                  {activity.description ||
                    activity.product?.name ||
                    "Product inventory updated"}
                </p>

                {activity.createdAt && (
                  <p className="mt-1 break-words text-[10px] leading-4 text-slate-400 sm:text-xs">
                    {new Date(activity.createdAt).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;