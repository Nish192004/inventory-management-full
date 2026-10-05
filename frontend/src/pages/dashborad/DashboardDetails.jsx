import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Box,
  CalendarDays,
  ChevronDown,
  Cuboid,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";

import {
  getDashboardSummary,
  getSalesAnalytics,
  getCategoryAnalytics,
  getTopProducts,
  getRecentActivity,
} from "../services/dashboardService";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f97316",
  "#a855f7",
  "#ec4899",
  "#64748b",
];

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDataArray = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  return [];
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("Daily");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [
          summaryResponse,
          salesResponse,
          categoryResponse,
          topProductsResponse,
          activityResponse,
        ] = await Promise.all([
          getDashboardSummary(),
          getSalesAnalytics(30),
          getCategoryAnalytics(),
          getTopProducts(),
          getRecentActivity(),
        ]);

        setSummary(
          summaryResponse?.data ||
            summaryResponse ||
            {}
        );

        setSalesData(getDataArray(salesResponse));
        setCategoryData(getDataArray(categoryResponse));
        setTopProducts(getDataArray(topProductsResponse));
        setRecentActivity(getDataArray(activityResponse));
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalProducts = Number(summary?.productCount || 0);
  const totalStock = Number(summary?.totalStock || 0);
  const totalSales = Number(summary?.salesCount || 0);
  const revenue = Number(summary?.revenue || 0);
  const lowStock = Number(summary?.lowStock || 0);
  const outOfStock = Number(summary?.outOfStock || 0);

  const chartSalesData = useMemo(() => {
    return salesData.map((item) => ({
      date:
        item.date ||
        item.day ||
        item.label ||
        formatDate(item.createdAt),
      sales: Number(
        item.sales ||
          item.count ||
          item.total ||
          item.value ||
          0
      ),
    }));
  }, [salesData]);

  const chartCategoryData = useMemo(() => {
    return categoryData.map((item) => ({
      name:
        item.name ||
        item.category ||
        item.categoryName ||
        "Unknown",
      value: Number(
        item.value ||
          item.count ||
          item.products ||
          item.productCount ||
          0
      ),
    }));
  }, [categoryData]);

  const stockHealth = useMemo(() => {
    const total = totalStock + lowStock + outOfStock;

    return {
      available:
        total > 0
          ? Math.round((totalStock / total) * 100)
          : 0,
      low:
        total > 0
          ? Math.round((lowStock / total) * 100)
          : 0,
      out:
        total > 0
          ? Math.round((outOfStock / total) * 100)
          : 0,
    };
  }, [totalStock, lowStock, outOfStock]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-10">

      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your inventory and business performance.
          </p>
        </div>

        <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          <CalendarDays size={18} />

          <span>
            Oct 1, 2026 - Oct 31, 2026
          </span>

          <ChevronDown size={16} />
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Link
          to="/dashboard/products"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Products
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                {formatNumber(totalProducts)}
              </h2>

              <div className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
                <ArrowUpRight size={16} />
                Inventory items
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Package size={25} />
            </div>

          </div>
        </Link>

        <Link
          to="/dashboard/stock"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Stock
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                {formatNumber(totalStock)}
              </h2>

              <div className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
                <ArrowUpRight size={16} />
                Available units
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Cuboid size={25} />
            </div>

          </div>
        </Link>

        <Link
          to="/dashboard/sales"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Sales
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                {formatNumber(totalSales)}
              </h2>

              <div className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
                <ArrowUpRight size={16} />
                Completed transactions
              </div>
            </div>

            <div className="rounded-2xl bg-red-50 p-3 text-red-500">
              <ShoppingCart size={25} />
            </div>

          </div>
        </Link>

        <Link
          to="/dashboard/revenue"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Revenue
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                {formatCurrency(revenue)}
              </h2>

              <div className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
                <TrendingUp size={16} />
                Total completed revenue
              </div>
            </div>

            <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
              <BarChart3 size={25} />
            </div>

          </div>
        </Link>

      </div>

      {/* LOW STOCK ALERT */}
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Low Stock
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-950">
                  {lowStock}
                </span>

                <span className="text-sm text-slate-600">
                  products are below minimum stock level
                </span>
              </div>
            </div>

          </div>

          <Link
            to="/inventory"
            className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
          >
            View Low Stock
            <ArrowUpRight className="ml-2" size={16} />
          </Link>

        </div>
      </div>

      {/* SALES + CATEGORY */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">

        {/* SALES CHART */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Sales Overview
              </h2>

              <p className="text-sm text-slate-500">
                Number of sales transactions over time
              </p>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">

              {["Daily", "Weekly", "Monthly"].map((item) => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    period === item
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

          <div className="h-[280px]">

            {chartSalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartSalesData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                    axisLine={{
                      stroke: "#cbd5e1",
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                    axisLine={{
                      stroke: "#cbd5e1",
                    }}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#2563eb",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50">
                <div className="text-center">
                  <BarChart3
                    size={42}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    No sales data available
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Sales will appear here after transactions are created.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* CATEGORY CHART */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Products by Category
            </h2>

            <p className="text-sm text-slate-500">
              Product distribution across categories
            </p>
          </div>

          <div className="mt-2 h-[280px]">

            {chartCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                  <Pie
                    data={chartCategoryData}
                    cx="45%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartCategoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    formatter={(value) => (
                      <span className="text-xs text-slate-600">
                        {value}
                      </span>
                    )}
                  />

                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-400">
                  No category data available
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* STOCK HEALTH + TOP PRODUCTS */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">

        {/* STOCK HEALTH */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <h2 className="text-lg font-bold text-slate-950">
            Stock Health
          </h2>

          <p className="text-sm text-slate-500">
            Current inventory condition
          </p>

          <div className="mt-6 space-y-6">

            <StockBar
              title="Available Stock"
              value={totalStock}
              percentage={stockHealth.available}
              color="bg-emerald-500"
              textColor="text-slate-700"
            />

            <StockBar
              title="Low Stock Products"
              value={lowStock}
              percentage={stockHealth.low}
              color="bg-amber-400"
              textColor="text-amber-600"
            />

            <StockBar
              title="Out of Stock"
              value={outOfStock}
              percentage={stockHealth.out}
              color="bg-red-500"
              textColor="text-red-600"
            />

          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-950">
              Top Products
            </h2>

            <p className="text-sm text-slate-500">
              Best performing products by sales
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[600px] text-sm">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Units Sold</th>
                  <th className="px-3 py-3">Revenue</th>
                </tr>
              </thead>

              <tbody>

                {topProducts.length > 0 ? (
                  topProducts.slice(0, 5).map((product, index) => (
                    <tr
                      key={product.id || index}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-3 font-medium text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {product.name ||
                          product.productName ||
                          product.product?.name ||
                          "-"}
                      </td>

                      <td className="px-3 py-3 text-slate-500">
                        {product.category ||
                          product.categoryName ||
                          product.product?.category?.name ||
                          "-"}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {formatNumber(
                          product.unitsSold ||
                            product.quantity ||
                            product.totalQuantity ||
                            0
                        )}
                      </td>

                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {formatCurrency(
                          product.revenue ||
                            product.totalRevenue ||
                            product.sales ||
                            0
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-12 text-center text-sm text-slate-400"
                    >
                      No product sales available
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>
        </div>

      </div>

      {/* RECENT SALES + RECENT ACTIVITY */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">

        {/* RECENT SALES */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Recent Sales
              </h2>

              <p className="text-sm text-slate-500">
                Latest sales transactions
              </p>
            </div>

            <Link
              to="/sales"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[600px] text-sm">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-3 py-3">Invoice</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Items</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>

              <tbody>

                {recentActivity.length > 0 ? (
                  recentActivity
                    .filter(
                      (item) =>
                        item.invoiceNumber ||
                        item.type === "SALE" ||
                        item.activityType === "SALE"
                    )
                    .slice(0, 5)
                    .map((sale, index) => (
                      <tr
                        key={sale.id || index}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-3 py-3 font-medium text-slate-700">
                          {sale.invoiceNumber ||
                            sale.reference ||
                            sale.invoice ||
                            "-"}
                        </td>

                        <td className="px-3 py-3 text-slate-600">
                          {sale.customerName ||
                            sale.customer?.name ||
                            sale.customer ||
                            "-"}
                        </td>

                        <td className="px-3 py-3 text-slate-500">
                          {formatDate(
                            sale.createdAt ||
                              sale.date
                          )}
                        </td>

                        <td className="px-3 py-3 text-slate-600">
                          {sale.itemsCount ||
                            sale.itemCount ||
                            sale.items ||
                            "-"}
                        </td>

                        <td className="px-3 py-3 font-semibold text-slate-800">
                          {formatCurrency(
                            sale.total ||
                              sale.amount ||
                              0
                          )}
                        </td>

                        <td className="px-3 py-3">
                          <StatusBadge
                            status={
                              sale.status ||
                              "COMPLETED"
                            }
                          />
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-sm text-slate-400"
                    >
                      No recent sales available
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Recent Activity
              </h2>

              <p className="text-sm text-slate-500">
                Latest inventory activity
              </p>
            </div>

            <Link
              to="/inventory"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[600px] text-sm">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">Reference</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Quantity</th>
                  <th className="px-3 py-3">User</th>
                </tr>
              </thead>

              <tbody>

                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity, index) => (
                    <tr
                      key={activity.id || index}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-3">
                        <ActivityBadge
                          type={
                            activity.type ||
                            activity.activityType ||
                            "ACTIVITY"
                          }
                        />
                      </td>

                      <td className="px-3 py-3 font-medium text-slate-700">
                        {activity.productName ||
                          activity.product?.name ||
                          activity.product ||
                          "-"}
                      </td>

                      <td className="px-3 py-3 text-slate-500">
                        {activity.reference ||
                          activity.referenceNumber ||
                          "-"}
                      </td>

                      <td className="px-3 py-3 text-slate-500">
                        {formatDate(
                          activity.createdAt ||
                            activity.date
                        )}
                      </td>

                      <td
                        className={`px-3 py-3 font-semibold ${
                          Number(activity.quantity || 0) < 0
                            ? "text-red-500"
                            : "text-emerald-600"
                        }`}
                      >
                        {Number(activity.quantity || 0) > 0
                          ? `+${activity.quantity}`
                          : activity.quantity || 0}
                      </td>

                      <td className="px-3 py-3 text-slate-500">
                        {activity.userName ||
                          activity.user?.name ||
                          "Admin"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-sm text-slate-400"
                    >
                      No recent activity
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </div>

      </div>

    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

const StockBar = ({
  title,
  value,
  percentage,
  color,
  textColor,
}) => {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-600">
          {title}
        </span>

        <span className={`text-sm font-semibold ${textColor}`}>
          {formatNumber(value)}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
          }}
        />
      </div>

    </div>
  );
};

const StatusBadge = ({ status }) => {
  const value = String(status).toUpperCase();

  let classes =
    "bg-slate-100 text-slate-600";

  if (value === "COMPLETED" || value === "RECEIVED") {
    classes =
      "bg-emerald-100 text-emerald-700";
  }

  if (value === "PENDING") {
    classes =
      "bg-amber-100 text-amber-700";
  }

  if (
    value === "CANCELLED" ||
    value === "FAILED"
  ) {
    classes =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
};

const ActivityBadge = ({ type }) => {
  const value = String(type).toUpperCase();

  let classes =
    "bg-slate-100 text-slate-600";

  let label = type;

  if (
    value === "IN" ||
    value === "STOCK_IN" ||
    value === "PURCHASE"
  ) {
    classes =
      "bg-emerald-100 text-emerald-700";

    label =
      value === "PURCHASE"
        ? "Purchase"
        : "Stock In";
  }

  if (
    value === "OUT" ||
    value === "STOCK_OUT"
  ) {
    classes =
      "bg-red-100 text-red-700";

    label = "Stock Out";
  }

  if (value === "SALE") {
    classes =
      "bg-blue-100 text-blue-700";

    label = "Sale";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
};

export default Dashboard;