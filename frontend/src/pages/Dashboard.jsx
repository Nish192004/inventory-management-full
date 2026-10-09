import React, { useEffect, useState } from "react";
import {
  Package,
  Boxes,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

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


// ============================================================
// CONSTANTS
// ============================================================

// Minimum time the refresh animation stays visible (ms)
const MIN_REFRESH_TIME = 700;

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const formatTime = (date) =>
  date
    ? date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

// Staggered fade-in delay (same pattern as the supplier rows)
const stagger = (index) => ({
  animationDelay: `${Math.min(index, 12) * 30}ms`,
});


// ============================================================
// DASHBOARD SKELETON (first load only)
// ============================================================

const SkeletonBox = ({ className = "" }) => (
  <div className={`rounded bg-slate-200 ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">

    {/* Stat cards */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <SkeletonBox className="h-3 w-24" />
              <SkeletonBox className="h-6 w-20" />
            </div>
            <SkeletonBox className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>

    {/* Alerts */}
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <SkeletonBox className="h-3 w-20" />
              <SkeletonBox className="h-6 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Chart blocks */}
    {[0, 1, 2].map((row) => (
      <div key={row} className="grid gap-6 xl:grid-cols-2">
        {[0, 1].map((col) => (
          <div
            key={col}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SkeletonBox className="mb-5 h-4 w-40" />
            <SkeletonBox className="h-56 w-full rounded-xl" />
          </div>
        ))}
      </div>
    ))}

  </div>
);


// ============================================================
// DASHBOARD
// ============================================================

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // first load only -> skeleton
  const [loading, setLoading] = useState(true);

  // manual refresh -> progress bar + overlay (content stays visible)
  const [refreshing, setRefreshing] = useState(false);

  // changes after every refresh so sections replay their fade-in animation
  const [refreshKey, setRefreshKey] = useState(0);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [error, setError] = useState("");


  // ==================================================
  // LOAD DASHBOARD
  // silent = true  -> content stays on screen
  // silent = false -> skeleton (first load only)
  // returns true on success, false on failure
  // ==================================================

  const loadDashboard = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

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
      setSalesData(salesResponse?.data || salesResponse || []);
      setCategoryData(categoryResponse?.data || categoryResponse || []);
      setTopProducts(
        topProductsResponse?.data || topProductsResponse || []
      );
      setRecentActivity(
        activityResponse?.data || activityResponse || []
      );

      setLastUpdated(new Date());

      return true;

    } catch (err) {
      console.error("Dashboard error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load dashboard data.";

      setError(message);
      toast.error(message);

      return false;

    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);


  // ==================================================
  // REFRESH (smooth + clearly visible)
  // ==================================================

  const handleRefresh = async () => {
    if (refreshing || loading) {
      return;
    }

    setRefreshing(true);

    try {
      // run the real reload AND a minimum delay together,
      // so the animation is always visible even if the API is instant
      const [ok] = await Promise.all([
        loadDashboard({ silent: true }),
        wait(MIN_REFRESH_TIME),
      ]);

      // replay the fade-in animation with the fresh data
      setRefreshKey((previous) => previous + 1);

      if (ok) {
        toast.success("Dashboard refreshed successfully.", {
          toastId: "dashboard-refreshed",
        });
      }
    } finally {
      // always runs, so the button can never get stuck on "Refreshing..."
      setRefreshing(false);
    }
  };

  const data = summary || {};

  // first load failed and there is nothing to show -> full error card
  const hasNoData = !summary;


  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      <style>
        {`
          @keyframes dashboardPageFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .dashboard-page-fade-in {
            animation: dashboardPageFadeIn 0.35s ease-out;
          }

          @keyframes dashboardProgress {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }

          .dashboard-progress-bar {
            animation: dashboardProgress 1.1s ease-in-out infinite;
          }

          @keyframes dashboardItemIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .dashboard-item-in {
            animation: dashboardItemIn 0.3s ease-out both;
          }

          @keyframes dashboardOverlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          .dashboard-overlay-in {
            animation: dashboardOverlayIn 0.2s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .dashboard-page-fade-in,
            .dashboard-progress-bar,
            .dashboard-item-in,
            .dashboard-overlay-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="dashboard-page-fade-in w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Overview of your inventory and business performance.
            </p>

            {lastUpdated && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                Last updated at {formatTime(lastUpdated)}
              </p>
            )}
          </div>

          {/* REFRESH */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex min-w-[130px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading || refreshing ? "animate-spin" : ""}`}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </div>

        {/* ERROR BANNER (dismissible, content stays visible) */}
        {error && !loading && !hasNoData && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <AlertTriangle className="h-5 w-5 shrink-0" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto rounded-md p-1 transition hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* SKELETON ONLY ON FIRST LOAD */}
        {loading ? (

          <DashboardSkeleton />

        ) : hasNoData ? (

          /* FIRST LOAD FAILED -> nothing to show */
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" />

              <div>
                <h2 className="font-semibold text-red-800">
                  Dashboard Error
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error || "Unable to load dashboard data."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>

        ) : (

          <div className="relative">

            {/* TOP PROGRESS BAR (while refreshing) */}
            {refreshing && (
              <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="dashboard-progress-bar h-full w-1/4 rounded-full bg-slate-900" />
              </div>
            )}

            {/* FLOATING "REFRESHING" PILL */}
            {refreshing && (
              <div className="dashboard-overlay-in pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-white/50 pt-24 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
                  <RefreshCw className="h-4 w-4 animate-spin text-slate-900" />
                </div>
              </div>
            )}

            <div
              className={`space-y-6 transition-opacity duration-200 ${
                refreshing ? "opacity-70" : "opacity-100"
              }`}
            >

              {/* STATS */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {[
                  {
                    to: "/dashboard/products",
                    title: "Total Products",
                    value: Number(data.productCount || 0).toLocaleString("en-IN"),
                    icon: <Package className="h-5 w-5" />,
                  },
                  {
                    to: "/dashboard/stock",
                    title: "Total Stock",
                    value: Number(data.totalStock || 0).toLocaleString("en-IN"),
                    icon: <Boxes className="h-5 w-5" />,
                  },
                  {
                    to: "/dashboard/sales",
                    title: "Total Sales",
                    value: Number(data.salesCount || 0).toLocaleString("en-IN"),
                    icon: <ShoppingCart className="h-5 w-5" />,
                  },
                  {
                    to: "/dashboard/revenue",
                    title: "Revenue",
                    value: `₹${Number(data.revenue || 0).toLocaleString("en-IN")}`,
                    icon: <IndianRupee className="h-5 w-5" />,
                  },
                ].map((card, index) => (
                  <Link
                    key={`${card.title}-${refreshKey}`}
                    to={card.to}
                    className="dashboard-item-in block transition hover:-translate-y-1 hover:shadow-md"
                    style={stagger(index)}
                  >
                    <StatCard
                      title={card.title}
                      value={card.value}
                      icon={card.icon}
                    />
                  </Link>
                ))}

              </div>

              {/* ALERTS */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div
                  key={`low-${refreshKey}`}
                  className="dashboard-item-in rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"
                  style={stagger(4)}
                >
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

                <div
                  key={`out-${refreshKey}`}
                  className="dashboard-item-in rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm"
                  style={stagger(5)}
                >
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

              {/* CHARTS */}
              <div
                key={`charts-${refreshKey}`}
                className="dashboard-item-in grid gap-6 xl:grid-cols-2"
                style={stagger(6)}
              >
                <SalesChart data={salesData} />
                <RevenueChart data={salesData} />
              </div>

              <div
                key={`health-${refreshKey}`}
                className="dashboard-item-in grid gap-6 xl:grid-cols-2"
                style={stagger(7)}
              >
                <CategoryChart data={categoryData} />

                <StockHealth
                  totalStock={data.totalStock}
                  lowStock={data.lowStock}
                  outOfStock={data.outOfStock}
                />
              </div>

              {/* TABLES */}
              <div
                key={`tables-${refreshKey}`}
                className="dashboard-item-in grid gap-6 xl:grid-cols-2"
                style={stagger(8)}
              >
                <TopProducts products={topProducts} />

                <RecentActivity activities={recentActivity} />
              </div>

            </div>

          </div>

        )}

      </div>
    </>
  );
};

export default Dashboard;