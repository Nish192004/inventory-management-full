import React from "react";

const RecentActivity = ({ activities = [] }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">
          Recent Activity
        </h2>

        <p className="text-sm text-slate-500">
          Latest inventory activity
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">
          No recent activity
        </div>
      ) : (
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity, index) => (
            <div
              key={activity.id || index}
              className="flex gap-3 border-b border-slate-100 pb-3 last:border-0"
            >
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {activity.type || activity.action || "Inventory activity"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {activity.description ||
                    activity.product?.name ||
                    "Product inventory updated"}
                </p>

                {activity.createdAt && (
                  <p className="mt-1 text-xs text-slate-400">
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