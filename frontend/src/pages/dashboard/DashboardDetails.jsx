import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Package,
  Boxes,
  ShoppingCart,
  IndianRupee,
  RefreshCw,
  AlertTriangle,
  Clock,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../../services/api";


// ============================================================
// CONSTANTS
// ============================================================

// Minimum time the refresh animation stays visible (ms)
const MIN_REFRESH_TIME = 700;

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const number = (value) => Number(value || 0);

const formatCurrency = (value) =>
  `₹${number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN");
};

const formatTime = (date) =>
  date
    ? date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

const getPageType = (pathname) => {
  if (pathname.includes("/dashboard/products")) return "products";
  if (pathname.includes("/dashboard/stock")) return "stock";
  if (pathname.includes("/dashboard/sales")) return "sales";
  if (pathname.includes("/dashboard/revenue")) return "revenue";

  return "products";
};

const PAGE_CONFIG = {
  products: {
    title: "Products Details",
    description: "View all products currently stored in the inventory.",
    icon: Package,
    endpoint: "/dashboard/products",
    emptyText: "No products found.",
    headings: ["#", "Product", "SKU", "Quantity", "Price", "Status"],
  },

  stock: {
    title: "Stock Details",
    description: "View current inventory stock and stock levels.",
    icon: Boxes,
    endpoint: "/dashboard/stock",
    emptyText: "No stock records found.",
    headings: ["#", "Product", "SKU", "Current Stock", "Minimum Stock", "Status"],
  },

  sales: {
    title: "Sales Details",
    description: "View completed sales recorded in the system.",
    icon: ShoppingCart,
    endpoint: "/dashboard/sales-details",
    emptyText: "No completed sales found.",
    headings: ["#", "Invoice", "Customer", "Total", "Status", "Date"],
  },

  revenue: {
    title: "Revenue Details",
    description: "View revenue generated from completed sales.",
    icon: IndianRupee,
    endpoint: "/dashboard/revenue-details",
    emptyText: "No revenue records found.",
    headings: ["#", "Invoice", "Revenue", "Status", "Date"],
  },
};

const getStockStatus = (product, healthyLabel) => {
  const quantity = number(product.quantity ?? product.stock);
  const minStock = number(product.minStock);

  if (quantity === 0) return "Out of Stock";
  if (minStock > 0 && quantity <= minStock) return "Low Stock";

  return healthyLabel;
};


// ============================================================
// STATUS BADGE (same classes as the status badge in Sales.jsx)
// ============================================================

const StatusBadge = ({ status }) => {
  const normalized = String(status || "")
    .toUpperCase()
    .replaceAll("_", " ");

  let classes = "bg-slate-100 text-slate-700";

  if (
    ["COMPLETED", "IN STOCK", "HEALTHY", "RECEIVED"].includes(normalized)
  ) {
    classes = "bg-emerald-100 text-emerald-700";
  } else if (["LOW STOCK", "PENDING"].includes(normalized)) {
    classes = "bg-amber-100 text-amber-700";
  } else if (
    ["OUT OF STOCK", "CANCELLED", "DAMAGE"].includes(normalized)
  ) {
    classes = "bg-red-100 text-red-700";
  } else if (normalized === "REFUNDED") {
    classes = "bg-purple-100 text-purple-700";
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {normalized || "UNKNOWN"}
    </span>
  );
};


// ============================================================
// ROW CELLS (one renderer per page type)
// ============================================================

const ROW_CELLS = {
  products: (product, index) => (
    <>
      <td className="px-5 py-4 text-slate-500">{index + 1}</td>

      <td className="px-5 py-4 font-semibold text-slate-900">
        {product.name || "-"}
      </td>

      <td className="px-5 py-4 text-slate-600">
        {product.sku || "-"}
      </td>

      <td className="px-5 py-4 font-semibold text-slate-900">
        {number(product.quantity ?? product.stock)}
      </td>

      <td className="px-5 py-4 text-slate-600">
        {formatCurrency(product.price)}
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={getStockStatus(product, "In Stock")} />
      </td>
    </>
  ),

  stock: (product, index) => (
    <>
      <td className="px-5 py-4 text-slate-500">{index + 1}</td>

      <td className="px-5 py-4 font-semibold text-slate-900">
        {product.name || "-"}
      </td>

      <td className="px-5 py-4 text-slate-600">
        {product.sku || "-"}
      </td>

      <td className="px-5 py-4 font-semibold text-slate-900">
        {number(product.quantity ?? product.stock)}
      </td>

      <td className="px-5 py-4 text-slate-600">
        {number(product.minStock)}
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={getStockStatus(product, "Healthy")} />
      </td>
    </>
  ),

  sales: (sale, index) => (
    <>
      <td className="px-5 py-4 text-slate-500">{index + 1}</td>

      <td className="px-5 py-4 font-semibold text-slate-900">
        {sale.invoiceNumber || `#${sale.id || "-"}`}
      </td>

      <td className="px-5 py-4 text-slate-700">
        {sale.customerName || sale.customer?.name || "Walk-in Customer"}
      </td>

      <td className="px-5 py-4 font-bold text-slate-900">
        {formatCurrency(sale.total)}
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={sale.status || "COMPLETED"} />
      </td>

      <td className="px-5 py-4 text-slate-500">
        {formatDate(sale.createdAt)}
      </td>
    </>
  ),

  revenue: (sale, index) => (
    <>
      <td className="px-5 py-4 text-slate-500">{index + 1}</td>

      <td className="px-5 py-4 font-semibold text-slate-900">
        {sale.invoiceNumber || sale.invoice || `#${sale.id || "-"}`}
      </td>

      <td className="px-5 py-4 font-bold text-slate-900">
        {formatCurrency(sale.total ?? sale.revenue ?? sale.amount)}
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={sale.status || "COMPLETED"} />
      </td>

      <td className="px-5 py-4 text-slate-500">
        {formatDate(sale.createdAt || sale.date)}
      </td>
    </>
  ),
};


// ============================================================
// TABLE HEAD (shared by skeleton + real table)
// ============================================================

const DetailsTableHead = ({ headings }) => (
  <thead className="border-b border-slate-200 bg-slate-50">
    <tr>
      {headings.map((heading) => (
        <th
          key={heading}
          className="px-5 py-4 font-semibold text-slate-600"
        >
          {heading}
        </th>
      ))}
    </tr>
  </thead>
);


// ============================================================
// DETAILS TABLE SKELETON (first load only)
// ============================================================

const DetailsTableSkeleton = ({ headings }) => {
  const rows = Array.from({ length: 7 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[950px] text-left text-sm">

        <DetailsTableHead headings={headings} />

        <tbody className="divide-y divide-slate-100">
          {rows.map((_, index) => (
            <tr key={index} className="animate-pulse">
              {headings.map((heading, cellIndex) => (
                <td key={heading} className="px-5 py-5">
                  <div
                    className={`h-4 rounded bg-slate-200 ${
                      cellIndex === 0 ? "w-6" : "w-28"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};


// ============================================================
// INFO COMPONENT (same as Sales.jsx)
// ============================================================

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-4">

    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 break-words font-semibold text-slate-800">
      {value || "-"}
    </p>

  </div>
);


// ============================================================
// DASHBOARD DETAILS
// ============================================================

export default function DashboardDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const pageType = useMemo(
    () => getPageType(location.pathname),
    [location.pathname]
  );

  const config = PAGE_CONFIG[pageType];

  const Icon = config.icon;

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);

  // first load (and page type change) -> skeleton
  const [loading, setLoading] = useState(true);

  // manual refresh -> progress bar + overlay (table stays visible)
  const [refreshing, setRefreshing] = useState(false);

  // changes after every refresh so rows replay their fade-in animation
  const [refreshKey, setRefreshKey] = useState(0);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [error, setError] = useState("");

  // ignores responses from an older page type / request
  const requestId = useRef(0);


  // ==================================================
  // LOAD DETAILS
  // silent = true  -> table stays on screen
  // silent = false -> skeleton (first load only)
  // returns true on success, false on failure
  // ==================================================

  const loadDetails = async ({ silent = false } = {}) => {
    const currentRequest = ++requestId.current;

    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const response = await api.get(config.endpoint);

      if (currentRequest !== requestId.current) {
        return false;
      }

      const responseData = response?.data?.data ?? response?.data ?? {};

      if (Array.isArray(responseData)) {
        setData(responseData);
        setSummary(null);
      } else {
        const possibleData =
          responseData.products ||
          responseData.sales ||
          responseData.revenue ||
          responseData.items ||
          responseData.data ||
          [];

        setData(Array.isArray(possibleData) ? possibleData : []);

        setSummary(
          responseData.summary ||
            responseData.stats ||
            responseData.totals ||
            null
        );
      }

      setLastUpdated(new Date());

      return true;

    } catch (err) {
      if (currentRequest !== requestId.current) {
        return false;
      }

      console.error("Dashboard details error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load dashboard details.";

      setError(message);
      toast.error(message);

      return false;

    } finally {
      if (!silent && currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  };

  // reload with the skeleton whenever the page type changes
  useEffect(() => {
    setData([]);
    setSummary(null);
    setLastUpdated(null);

    loadDetails();
  }, [pageType]);


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
        loadDetails({ silent: true }),
        wait(MIN_REFRESH_TIME),
      ]);

      // replay the row fade-in animation with the fresh data
      setRefreshKey((previous) => previous + 1);

      if (ok) {
        toast.success("Details refreshed successfully.", {
          toastId: "dashboard-details-refreshed",
        });
      }
    } finally {
      // always runs, so the button can never get stuck on "Refreshing..."
      setRefreshing(false);
    }
  };


  // ==================================================
  // UI
  // ==================================================

  const summaryEntries = summary
    ? Object.entries(summary).slice(0, 4)
    : [];

  return (
    <>
      <style>
        {`
          @keyframes detailsPageFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .details-page-fade-in {
            animation: detailsPageFadeIn 0.35s ease-out;
          }

          @keyframes detailsProgress {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }

          .details-progress-bar {
            animation: detailsProgress 1.1s ease-in-out infinite;
          }

          @keyframes detailsRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .details-row-in {
            animation: detailsRowIn 0.3s ease-out both;
          }

          @keyframes detailsOverlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          .details-overlay-in {
            animation: detailsOverlayIn 0.2s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .details-page-fade-in,
            .details-progress-bar,
            .details-row-in,
            .details-overlay-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="details-page-fade-in w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div className="flex items-start gap-3">

            {/* BACK */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Back to Dashboard"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {config.title}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {config.description}
              </p>

              {lastUpdated && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  Last updated at {formatTime(lastUpdated)}
                </p>
              )}
            </div>

          </div>

          <div className="flex gap-2">

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
        </div>

        {/* READ-ONLY NOTICE */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          This is a read-only dashboard detail page. Data is displayed directly
          from the inventory database.
        </div>

        {/* ERROR */}
        {error && (
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

        {/* SUMMARY */}
        {!loading && summaryEntries.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryEntries.map(([key, value]) => (
              <Info
                key={key}
                label={key.replace(/([A-Z])/g, " $1")}
                value={
                  typeof value === "number"
                    ? value.toLocaleString("en-IN")
                    : String(value ?? "-")
                }
              />
            ))}
          </div>
        )}

        {/* DETAILS TABLE */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOP PROGRESS BAR (while refreshing) */}
          {refreshing && (
            <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden bg-slate-100">
              <div className="details-progress-bar h-full w-1/4 rounded-full bg-slate-900" />
            </div>
          )}

          {/* FLOATING "REFRESHING" PILL (same as Sales.jsx) */}
          {refreshing && (
            <div className="details-overlay-in pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-24 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
                <RefreshCw className="h-4 w-4 animate-spin text-slate-900" />
              </div>
            </div>
          )}

          {/* RECORD COUNT */}
          <div className="border-b border-slate-200 px-5 py-4">

            <h3 className="font-semibold text-slate-900">
              {config.title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading data..."
                : `${data.length} record${data.length === 1 ? "" : "s"} found.`}
            </p>

          </div>

          {/* SKELETON ONLY ON FIRST LOAD */}
          {loading ? (

            <DetailsTableSkeleton headings={config.headings} />

          ) : data.length === 0 ? (

            <div className="py-16 text-center">

              <Icon className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="font-medium text-slate-700">
                {config.emptyText}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Records will appear here once they are available.
              </p>

            </div>

          ) : (

            <div
              className={`overflow-x-auto transition-opacity duration-200 ${
                refreshing ? "opacity-70" : "opacity-100"
              }`}
            >

              <table className="w-full min-w-[950px] text-left text-sm">

                <DetailsTableHead headings={config.headings} />

                <tbody className="divide-y divide-slate-100">

                  {data.map((item, index) => (
                    <tr
                      key={`${item.id ?? index}-${refreshKey}`}
                      className="details-row-in transition hover:bg-slate-50"
                      style={{
                        animationDelay: `${Math.min(index, 12) * 30}ms`,
                      }}
                    >
                      {ROW_CELLS[pageType](item, index)}
                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </>
  );
}