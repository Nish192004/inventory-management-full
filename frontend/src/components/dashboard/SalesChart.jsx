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

const SalesChart = ({ data = [] }) => {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-5">
      
      {/* Header */}
      <div className="mb-3 sm:mb-4 md:mb-5">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          Sales Overview
        </h2>

        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Number of sales transactions over time
        </p>
      </div>

      {/* Chart */}
      <div className="h-[240px] w-full sm:h-[280px] md:h-[320px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-xs text-slate-500 sm:text-sm">
            No sales data available
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
          >
            <AreaChart
              data={data}
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
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                width={35}
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                fill="#dbeafe"
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

export default SalesChart;