import React, { useEffect, useState } from "react";
import {
  Package,
  Boxes,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import SalesChart from "../components/dashboard/SalesChart";
import RevenueChart from "../components/dashboard/RevenueChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import StockHealth from "../components/dashboard/StockHealth";
import TopProducts from "../components/dashboard/TopProducts";
import RecentActivity from "../components/dashboard/RecentActivity";

import {
  getDashboardSummary,
  getSalesAnalytics,
  getCategoryAnalytics,
  getTopProducts,
  getRecentActivity,
} from "../services/dashboardService";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

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

      setSummary(summaryResponse?.data || summaryResponse || {});
      setSalesData(
        salesResponse?.data || salesResponse || []
      );
      setCategoryData(
        categoryResponse?.data || categoryResponse || []
      );
      setTopProducts(
        topProductsResponse?.data || topProductsResponse || []
      );
      setRecentActivity(
        activityResponse?.data || activityResponse || []
      );
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-600" />

          <div>
            <h2 className="font-semibold text-red-800">
              Dashboard Error
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>

        <button
          onClick={loadDashboard}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const data = summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your inventory and business performance.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Products"
          value={Number(data.productCount || 0).toLocaleString("en-IN")}
          icon={<Package className="h-5 w-5" />}
        />

        <StatCard
          title="Total Stock"
          value={Number(data.totalStock || 0).toLocaleString("en-IN")}
          icon={<Boxes className="h-5 w-5" />}
        />

        <StatCard
          title="Total Sales"
          value={Number(data.salesCount || 0).toLocaleString("en-IN")}
          icon={<ShoppingCart className="h-5 w-5" />}
        />

        <StatCard
          title="Revenue"
          value={`₹${Number(data.revenue || 0).toLocaleString("en-IN")}`}
          icon={<IndianRupee className="h-5 w-5" />}
        />
      </div>

      {/* Alerts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <p className="text-sm text-amber-700">
                Low Stock
              </p>

              <p className="text-2xl font-bold text-amber-900">
                {data.lowStock || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-3">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <p className="text-sm text-red-700">
                Out of Stock
              </p>

              <p className="text-2xl font-bold text-red-900">
                {data.outOfStock || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SalesChart data={salesData} />
        <RevenueChart data={salesData} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CategoryChart data={categoryData} />

        <StockHealth
          totalStock={data.totalStock}
          lowStock={data.lowStock}
          outOfStock={data.outOfStock}
        />
      </div>

      {/* Tables */}
      <div className="grid gap-6 xl:grid-cols-2">
        <TopProducts products={topProducts} />
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
};

export default Dashboard;