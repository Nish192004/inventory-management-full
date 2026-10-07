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

const RevenueChart = ({ data = [] }) => {
  const formattedData = data.map((item) => ({
    ...item,
    revenue: Number(item.revenue || 0),
  }));

  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-5">
      
      {/* Header */}
      <div className="mb-3 sm:mb-4 md:mb-5">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          Revenue Overview
        </h2>

        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Revenue generated from sales
        </p>
      </div>

      {/* Chart */}
      <div className="h-[240px] w-full sm:h-[280px] md:h-[320px]">
        {formattedData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-xs text-slate-500 sm:text-sm">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
          >
            <AreaChart
              data={formattedData}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickMargin={8}
                minTickGap={20}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                width={45}
              />

              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  "Revenue",
                ]}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                fill="#dcfce7"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;