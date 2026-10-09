
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
  const chartData = data
    .map((item) => ({
      name: item.name || item.category || "Unknown",
      value: Number(item.value ?? item.count ?? 0),
    }))
    .filter((item) => item.value > 0);

  const totalProducts = chartData.reduce(
    (total, item) => total + item.value,
    0
  );

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5 lg:p-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Products by Category
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Product distribution across categories
        </p>
      </div>

      {/* Chart */}
      <div className="h-[420px] w-full min-w-0 sm:h-[460px] lg:h-[480px]">
        {chartData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-slate-400"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v10h10" />
              </svg>
            </div>

            <p className="font-semibold text-slate-700">
              No category data available
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add products to see the category distribution.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart
              margin={{
                top: 8,
                right: 8,
                bottom: 8,
                left: 8,
              }}
            >
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="43%"
                outerRadius="75%"
                paddingAngle={chartData.length > 1 ? 3 : 0}
                stroke="#ffffff"
                strokeWidth={4}
                cornerRadius={chartData.length > 1 ? 4 : 0}
                label={
                  chartData.length > 1
                    ? ({ percent }) =>
                        percent >= 0.05
                          ? `${(percent * 100).toFixed(0)}%`
                          : ""
                    : false
                }
                labelLine={false}
                isAnimationActive
                animationDuration={900}
              >
                {chartData.map((item, index) => (
                  <Cell
                    key={`${item.name}-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [
                  Number(value).toLocaleString("en-IN"),
                  name,
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 8px 24px rgba(15, 23, 42, 0.08)",
                  padding: "10px 14px",
                  fontSize: "13px",
                }}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "14px",
                  lineHeight: "24px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary */}
      {chartData.length > 0 && (
        <div className="mt-1 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Total products across categories
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {totalProducts.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-3 text-right">
              <p className="text-xs font-medium text-blue-600">
                Categories
              </p>
              <p className="mt-1 text-xl font-bold text-blue-700">
                {chartData.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryChart;
