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

import { ShoppingCart } from "lucide-react";


// ============================================================
// HELPERS
// ============================================================

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;


// ============================================================
// SALES CHART
// refreshKey  -> changes after every dashboard refresh so the
//                chart replays its draw animation
// refreshing  -> dims the chart while the dashboard reloads
// ============================================================

const SalesChart = ({
  data = [],
  refreshKey = 0,
  refreshing = false,
}) => {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="border-b border-slate-200 px-5 py-4">

        <h3 className="font-semibold text-slate-900">
          Sales Overview
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Number of sales transactions over time.
        </p>

      </div>

      {chartData.length === 0 ? (

        <div className="py-16 text-center">

          <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-slate-300" />

          <p className="font-medium text-slate-700">
            No sales data available.
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Sales will appear here once they are created.
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
              data={chartData}
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
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                width={40}
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
                  Number(value).toLocaleString("en-IN"),
                  "Sales",
                ]}
              />

              <Area
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                fill="#dbeafe"
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

export default SalesChart;