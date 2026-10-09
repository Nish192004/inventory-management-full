import React from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { TrendingUp } from "lucide-react";


// ============================================================
// HELPERS
// ============================================================

// compact Indian currency for the Y axis (₹5L, ₹1.2Cr ...)
const formatAxisValue = (value) => {
  const number = Number(value || 0);

  if (number >= 10000000) return `₹${+(number / 10000000).toFixed(1)}Cr`;
  if (number >= 100000) return `₹${+(number / 100000).toFixed(1)}L`;
  if (number >= 1000) return `₹${+(number / 1000).toFixed(1)}K`;

  return `₹${number}`;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;


// ============================================================
// REVENUE CHART
// refreshKey  -> changes after every dashboard refresh so the
//                chart replays its draw animation
// refreshing  -> dims the chart while the dashboard reloads
// ============================================================

const RevenueChart = ({
  data = [],
  refreshKey = 0,
  refreshing = false,
}) => {
  const formattedData = (Array.isArray(data) ? data : []).map((item) => ({
    ...item,
    revenue: Number(item.revenue || 0),
  }));

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="border-b border-slate-200 px-5 py-4">

        <h3 className="font-semibold text-slate-900">
          Revenue Overview
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Revenue generated from sales.
        </p>

      </div>

      {formattedData.length === 0 ? (

        <div className="py-16 text-center">

          <TrendingUp className="mx-auto mb-3 h-10 w-10 text-slate-300" />

          <p className="font-medium text-slate-700">
            No revenue data available.
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Revenue will appear here once sales are completed.
          </p>

        </div>

      ) : (

        <div
          className={`h-[300px] w-full min-w-0 p-5 transition-opacity duration-200 ${
            refreshing ? "opacity-70" : "opacity-100"
          }`}
        >

          <ResponsiveContainer width="100%" height="100%" minWidth={0}>

            <AreaChart
              key={refreshKey}
              data={formattedData}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tickMargin={8}
                minTickGap={20}
              />

              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tickFormatter={formatAxisValue}
                width={64}
              />

              <Tooltip
                cursor={{ stroke: "#cbd5e1" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontSize: 12,
                }}
                labelStyle={{
                  color: "#0f172a",
                  fontWeight: 600,
                }}
                formatter={(value) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  "Revenue",
                ]}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                fill="#d1fae5"
                strokeWidth={2}
                dot={false}
                isAnimationActive={!prefersReducedMotion()}
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      )}

    </div>
  );
};

export default RevenueChart;