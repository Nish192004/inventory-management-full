import React from "react";

import { Activity } from "lucide-react";


// ============================================================
// RECENT ACTIVITY
// refreshKey  -> changes after every dashboard refresh so rows
//                replay their fade-in animation
// refreshing  -> dims the list while the dashboard reloads
// ============================================================

const RecentActivity = ({
  activities = [],
  refreshKey = 0,
  refreshing = false,
}) => {
  const items = Array.isArray(activities) ? activities.slice(0, 8) : [];

  return (
    <>
      <style>
        {`
          @keyframes activityRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .activity-row-in {
            animation: activityRowIn 0.3s ease-out both;
          }

          @media (prefers-reduced-motion: reduce) {
            .activity-row-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}
        <div className="border-b border-slate-200 px-5 py-4">

          <h3 className="font-semibold text-slate-900">
            Recent Activity
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Latest inventory activity.
          </p>

        </div>

        {items.length === 0 ? (

          <div className="py-16 text-center">

            <Activity className="mx-auto mb-3 h-10 w-10 text-slate-300" />

            <p className="font-medium text-slate-700">
              No recent activity.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Inventory changes will appear here.
            </p>

          </div>

        ) : (

          <div
            className={`divide-y divide-slate-100 transition-opacity duration-200 ${
              refreshing ? "opacity-70" : "opacity-100"
            }`}
          >

            {items.map((activity, index) => (
              <div
                key={`${activity.id || index}-${refreshKey}`}
                className="activity-row-in flex min-w-0 items-start gap-3 px-5 py-4 transition hover:bg-slate-50"
                style={{
                  animationDelay: `${Math.min(index, 12) * 30}ms`,
                }}
              >

                {/* INDICATOR */}
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-900" />

                {/* CONTENT */}
                <div className="min-w-0 flex-1">

                  <p className="break-words font-semibold text-slate-900">
                    {activity.type ||
                      activity.action ||
                      "Inventory activity"}
                  </p>

                  <p className="mt-1 break-words text-sm text-slate-600">
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
    </>
  );
};

export default RecentActivity;