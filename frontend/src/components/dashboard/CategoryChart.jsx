import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
];

const CategoryChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    name: item.name || item.category || "Unknown",
    value: Number(item.value || item.count || 0),
  }));

  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-5">
      
      {/* Header */}
      <div className="mb-3 sm:mb-4 md:mb-5">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          Products by Category
        </h2>

        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Product distribution across categories
        </p>
      </div>

      {/* Chart */}
      <div className="h-[260px] w-full sm:h-[300px] md:h-[320px]">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
            No category data available
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
          >
            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="42%"
                outerRadius="30%"
                label
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "10px",
                }}
              />

            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CategoryChart;