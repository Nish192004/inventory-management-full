import React, { useEffect, useState } from "react";

import {
  BarChart3,
  RefreshCw,
  Package,
  ShoppingCart,
  Truck,
  TrendingUp,
  AlertTriangle,
  Clock,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getReportDashboard,
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getProfitLossReport,
} from "../../services/reportService";


// ============================================================
// CONSTANTS
// ============================================================

// Minimum time the refresh animation stays visible (ms)
const MIN_REFRESH_TIME = 700;

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "sales", label: "Sales", icon: ShoppingCart },
  { id: "purchases", label: "Purchases", icon: Truck },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "profit", label: "Profit & Loss", icon: TrendingUp },
];

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const toArray = (value) =>
  Array.isArray(value) ? value : [];

const getData = (response) =>
  response?.data || response || {};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "-";

const formatTime = (date) =>
  date
    ? date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";


// ============================================================
// STAT CARD (same shell as the Info component in Sales.jsx)
// ============================================================

const STAT_TONES = {
  default: {
    box: "bg-slate-50",
    label: "text-slate-400",
    value: "text-slate-900",
  },
  amber: {
    box: "bg-amber-50",
    label: "text-amber-600",
    value: "text-amber-700",
  },
  red: {
    box: "bg-red-50",
    label: "text-red-600",
    value: "text-red-700",
  },
};

const StatCard = ({ label, value, tone = "default", negative = false }) => {
  const styles = STAT_TONES[tone] || STAT_TONES.default;

  return (
    <div className={`rounded-xl p-4 ${styles.box}`}>

      <p
        className={`text-xs font-medium uppercase tracking-wide ${styles.label}`}
      >
        {label}
      </p>

      <p
        className={`mt-1 break-words text-xl font-bold ${
          negative ? "text-red-600" : styles.value
        }`}
      >
        {value}
      </p>

    </div>
  );
};


// ============================================================
// SECTION HEADING (same as "Sale Items" heading in Sales.jsx)
// ============================================================

const Section = ({ title, subtitle, children }) => (
  <div>

    <div className="mb-3">

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      {subtitle && (
        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      )}

    </div>

    {children}

  </div>
);


// ============================================================
// REPORT TABLE CARD (same table styling as Sales.jsx)
// ============================================================

const ReportTable = ({
  title,
  subtitle,
  headings,
  isEmpty,
  emptyText,
  children,
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

    <div className="border-b border-slate-200 px-5 py-4">

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {subtitle}
      </p>

    </div>

    {isEmpty ? (

      <div className="py-16 text-center">

        <BarChart3 className="mx-auto mb-3 h-10 w-10 text-slate-300" />

        <p className="font-medium text-slate-700">
          {emptyText}
        </p>

      </div>

    ) : (

      <div className="overflow-x-auto">

        <table className="w-full min-w-[950px] text-left text-sm">

          <thead className="border-b border-slate-200 bg-slate-50">

            <tr>
              {headings.map((heading) => (
                <th
                  key={heading.label}
                  className={`px-5 py-4 font-semibold text-slate-600 ${
                    heading.align === "right" ? "text-right" : ""
                  }`}
                >
                  {heading.label}
                </th>
              ))}
            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">
            {children}
          </tbody>

        </table>

      </div>

    )}

  </div>
);


// ============================================================
// REPORTS SKELETON (first load only)
// ============================================================

const ReportsSkeleton = () => (
  <div className="animate-pulse space-y-6">

    {/* TABS */}
    <div className="h-14 rounded-2xl border border-slate-200 bg-white shadow-sm" />

    {/* STAT CARDS */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-xl bg-slate-50 p-4">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="mt-3 h-6 w-28 rounded bg-slate-200" />
        </div>
      ))}
    </div>

    {/* TABLE */}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="h-4 w-40 rounded bg-slate-200" />
      </div>

      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex gap-6 px-5 py-5">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-4 w-36 rounded bg-slate-200" />
            <div className="h-4 w-10 rounded bg-slate-200" />
            <div className="h-4 w-24 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>

  </div>
);


// ============================================================
// REPORTS
// ============================================================

const Reports = () => {
  const [dashboard, setDashboard] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [purchaseReport, setPurchaseReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [profitLossReport, setProfitLossReport] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");

  // first load only -> skeleton
  const [loading, setLoading] = useState(true);

  // manual refresh -> progress bar + overlay (content stays visible)
  const [refreshing, setRefreshing] = useState(false);

  // changes after every refresh so rows replay their fade-in animation
  const [refreshKey, setRefreshKey] = useState(0);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [error, setError] = useState("");


  // ==================================================
  // LOAD ALL REPORTS
  // silent = true  -> content stays on screen
  // silent = false -> skeleton (first load only)
  // returns true on success, false on failure
  // ==================================================

  const loadReports = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const [
        dashboardResponse,
        salesResponse,
        purchaseResponse,
        inventoryResponse,
        profitLossResponse,
      ] = await Promise.all([
        getReportDashboard(),
        getSalesReport(),
        getPurchaseReport(),
        getInventoryReport(),
        getProfitLossReport(),
      ]);

      setDashboard(getData(dashboardResponse));
      setSalesReport(getData(salesResponse));
      setPurchaseReport(getData(purchaseResponse));
      setInventoryReport(getData(inventoryResponse));
      setProfitLossReport(getData(profitLossResponse));

      setLastUpdated(new Date());

      return true;

    } catch (err) {
      console.error("Reports loading error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load reports.";

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
    loadReports();
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
        loadReports({ silent: true }),
        wait(MIN_REFRESH_TIME),
      ]);

      // replay the row fade-in animation with the fresh data
      setRefreshKey((previous) => previous + 1);

      if (ok) {
        toast.success("Reports refreshed successfully.", {
          toastId: "reports-refreshed",
        });
      }
    } finally {
      // always runs, so the button can never get stuck on "Refreshing..."
      setRefreshing(false);
    }
  };


  // ==================================================
  // SAFE VALUES
  // ==================================================

  const data = dashboard || {};

  const productCount = Number(data.productCount || 0);
  const customerCount = Number(data.customerCount || 0);
  const supplierCount = Number(data.supplierCount || 0);
  const categoryCount = Number(data.categoryCount || 0);

  const totalSales = Number(data.totalSales || 0);
  const totalPurchases = Number(data.totalPurchases || 0);

  const profit = Number(
    profitLossReport?.profit ?? data.profit ?? 0
  );

  const totalStock = Number(data.totalStock || 0);
  const lowStock = Number(data.lowStock || 0);
  const outOfStock = Number(data.outOfStock || 0);

  const sales = toArray(salesReport?.sales);
  const purchases = toArray(purchaseReport?.purchases);
  const inventoryProducts = toArray(inventoryReport?.products);

  const stockValue = Number(inventoryReport?.stockValue || 0);

  const rowStyle = (index) => ({
    animationDelay: `${Math.min(index, 12) * 30}ms`,
  });


  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      <style>
        {`
          @keyframes reportsPageFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .reports-page-fade-in {
            animation: reportsPageFadeIn 0.35s ease-out;
          }

          @keyframes reportsProgress {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }

          .reports-progress-bar {
            animation: reportsProgress 1.1s ease-in-out infinite;
          }

          @keyframes reportsRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .reports-row-in {
            animation: reportsRowIn 0.3s ease-out both;
          }

          @keyframes reportsOverlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          .reports-overlay-in {
            animation: reportsOverlayIn 0.2s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .reports-page-fade-in,
            .reports-progress-bar,
            .reports-row-in,
            .reports-overlay-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="reports-page-fade-in w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Reports
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Analyze your inventory business data.
            </p>

            {lastUpdated && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                Last updated at {formatTime(lastUpdated)}
              </p>
            )}
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

        {/* SKELETON ONLY ON FIRST LOAD */}
        {loading ? (

          <ReportsSkeleton />

        ) : !dashboard ? (

          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">

            <BarChart3 className="mx-auto mb-3 h-10 w-10 text-slate-300" />

            <p className="font-medium text-slate-700">
              No report data found.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Click Refresh to try loading the reports again.
            </p>

          </div>

        ) : (

          <>

            {/* TABS */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

              {/* TOP PROGRESS BAR (while refreshing) */}
              {refreshing && (
                <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden bg-slate-100">
                  <div className="reports-progress-bar h-full w-1/4 rounded-full bg-slate-900" />
                </div>
              )}

              <div className="overflow-x-auto">

                <div className="flex min-w-max gap-1">

                  {TABS.map((tab) => {
                    const Icon = tab.icon;

                    const active = activeTab === tab.id;

                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "bg-slate-950 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Icon className="h-4 w-4" />

                        {tab.label}
                      </button>
                    );
                  })}

                </div>

              </div>

            </div>

            {/* TAB CONTENT (stays visible during refresh) */}
            <div className="relative">

              {/* FLOATING "REFRESHING" PILL (same as Sales.jsx) */}
              {refreshing && (
                <div className="reports-overlay-in pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-24 backdrop-blur-[1px]">
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

                {/* ==========================================
                    OVERVIEW
                ========================================== */}

                {activeTab === "overview" && (
                  <>

                    <Section
                      title="Financial Summary"
                      subtitle="Revenue, purchases and estimated profit."
                    >
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <StatCard
                          label="Revenue"
                          value={formatCurrency(totalSales)}
                        />

                        <StatCard
                          label="Purchases"
                          value={formatCurrency(totalPurchases)}
                        />

                        <StatCard
                          label="Estimated Profit"
                          value={formatCurrency(profit)}
                          negative={profit < 0}
                        />

                        <StatCard
                          label="Stock Value"
                          value={formatCurrency(stockValue)}
                        />

                      </div>
                    </Section>

                    <Section
                      title="Business Overview"
                      subtitle="Total records in your system."
                    >
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <StatCard label="Products" value={productCount} />
                        <StatCard label="Categories" value={categoryCount} />
                        <StatCard label="Suppliers" value={supplierCount} />
                        <StatCard label="Customers" value={customerCount} />

                      </div>
                    </Section>

                    <Section
                      title="Inventory Status"
                      subtitle="Current stock levels."
                    >
                      <div className="grid gap-4 sm:grid-cols-3">

                        <StatCard label="Total Stock" value={totalStock} />

                        <StatCard
                          label="Low Stock"
                          value={lowStock}
                          tone="amber"
                        />

                        <StatCard
                          label="Out of Stock"
                          value={outOfStock}
                          tone="red"
                        />

                      </div>
                    </Section>

                  </>
                )}

                {/* ==========================================
                    SALES REPORT
                ========================================== */}

                {activeTab === "sales" && (
                  <>

                    <div className="grid gap-4 sm:grid-cols-2">

                      <StatCard
                        label="Completed Sales"
                        value={salesReport?.salesCount || 0}
                      />

                      <StatCard
                        label="Total Sales"
                        value={formatCurrency(salesReport?.totalSales)}
                      />

                    </div>

                    <ReportTable
                      title="Sales Report"
                      subtitle="Completed sales transactions."
                      headings={[
                        { label: "Invoice" },
                        { label: "Customer" },
                        { label: "Items" },
                        { label: "Date" },
                        { label: "Total", align: "right" },
                      ]}
                      isEmpty={sales.length === 0}
                      emptyText="No completed sales found."
                    >
                      {sales.map((sale, index) => (
                        <tr
                          key={`${sale.id}-${refreshKey}`}
                          className="reports-row-in transition hover:bg-slate-50"
                          style={rowStyle(index)}
                        >

                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {sale.invoiceNumber || sale.id}
                          </td>

                          <td className="px-5 py-4 text-slate-700">
                            {sale.customer?.name ||
                              sale.customerName ||
                              "Walk-in Customer"}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {sale.items?.length || 0}
                          </td>

                          <td className="px-5 py-4 text-slate-500">
                            {formatDate(sale.createdAt)}
                          </td>

                          <td className="px-5 py-4 text-right font-bold text-slate-900">
                            {formatCurrency(sale.total)}
                          </td>

                        </tr>
                      ))}
                    </ReportTable>

                  </>
                )}

                {/* ==========================================
                    PURCHASE REPORT
                ========================================== */}

                {activeTab === "purchases" && (
                  <>

                    <div className="grid gap-4 sm:grid-cols-2">

                      <StatCard
                        label="Received Purchases"
                        value={purchaseReport?.purchaseCount || 0}
                      />

                      <StatCard
                        label="Total Purchases"
                        value={formatCurrency(purchaseReport?.totalPurchases)}
                      />

                    </div>

                    <ReportTable
                      title="Purchase Report"
                      subtitle="Received purchase orders."
                      headings={[
                        { label: "Order Number" },
                        { label: "Supplier" },
                        { label: "Items" },
                        { label: "Date" },
                        { label: "Total", align: "right" },
                      ]}
                      isEmpty={purchases.length === 0}
                      emptyText="No received purchases found."
                    >
                      {purchases.map((purchase, index) => (
                        <tr
                          key={`${purchase.id}-${refreshKey}`}
                          className="reports-row-in transition hover:bg-slate-50"
                          style={rowStyle(index)}
                        >

                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {purchase.orderNumber || purchase.id}
                          </td>

                          <td className="px-5 py-4 text-slate-700">
                            {purchase.supplier?.name || "Unknown Supplier"}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {purchase.items?.length || 0}
                          </td>

                          <td className="px-5 py-4 text-slate-500">
                            {formatDate(purchase.createdAt)}
                          </td>

                          <td className="px-5 py-4 text-right font-bold text-slate-900">
                            {formatCurrency(purchase.total)}
                          </td>

                        </tr>
                      ))}
                    </ReportTable>

                  </>
                )}

                {/* ==========================================
                    INVENTORY REPORT
                ========================================== */}

                {activeTab === "inventory" && (
                  <>

                    <div className="grid gap-4 sm:grid-cols-3">

                      <StatCard
                        label="Products"
                        value={inventoryReport?.totalProducts || 0}
                      />

                      <StatCard
                        label="Total Stock"
                        value={totalStock}
                      />

                      <StatCard
                        label="Stock Value"
                        value={formatCurrency(stockValue)}
                      />

                    </div>

                    <ReportTable
                      title="Inventory Report"
                      subtitle="Current product stock and valuation."
                      headings={[
                        { label: "Product" },
                        { label: "SKU" },
                        { label: "Category" },
                        { label: "Quantity", align: "right" },
                        { label: "Cost Price", align: "right" },
                        { label: "Stock Value", align: "right" },
                      ]}
                      isEmpty={inventoryProducts.length === 0}
                      emptyText="No products found."
                    >
                      {inventoryProducts.map((product, index) => {
                        const quantity = Number(product.quantity || 0);
                        const costPrice = Number(product.costPrice || 0);

                        const isOut = quantity === 0;

                        const isLow =
                          quantity > 0 &&
                          quantity <= Number(product.minStock || 0);

                        return (
                          <tr
                            key={`${product.id}-${refreshKey}`}
                            className="reports-row-in transition hover:bg-slate-50"
                            style={rowStyle(index)}
                          >

                            <td className="px-5 py-4 font-semibold text-slate-900">
                              {product.name}
                            </td>

                            <td className="px-5 py-4 text-slate-600">
                              {product.sku || "-"}
                            </td>

                            <td className="px-5 py-4 text-slate-600">
                              {product.category?.name || "Uncategorized"}
                            </td>

                            <td className="px-5 py-4 text-right">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  isOut
                                    ? "bg-red-100 text-red-700"
                                    : isLow
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {quantity}
                              </span>

                            </td>

                            <td className="px-5 py-4 text-right text-slate-600">
                              {formatCurrency(costPrice)}
                            </td>

                            <td className="px-5 py-4 text-right font-bold text-slate-900">
                              {formatCurrency(quantity * costPrice)}
                            </td>

                          </tr>
                        );
                      })}
                    </ReportTable>

                  </>
                )}

                {/* ==========================================
                    PROFIT & LOSS
                ========================================== */}

                {activeTab === "profit" && (
                  <>

                    <div className="grid gap-4 sm:grid-cols-3">

                      <StatCard
                        label="Revenue"
                        value={formatCurrency(profitLossReport?.revenue)}
                      />

                      <StatCard
                        label="Expenses"
                        value={formatCurrency(profitLossReport?.expenses)}
                      />

                      <StatCard
                        label="Net Profit"
                        value={formatCurrency(profit)}
                        negative={profit < 0}
                      />

                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-200 px-5 py-4">

                        <h3 className="font-semibold text-slate-900">
                          Profit &amp; Loss Summary
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Revenue minus received purchase expenses.
                        </p>

                      </div>

                      <div className="divide-y divide-slate-100 text-sm">

                        <div className="flex items-center justify-between px-5 py-4">
                          <span className="text-slate-600">Revenue</span>

                          <span className="font-semibold text-slate-900">
                            {formatCurrency(profitLossReport?.revenue)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between px-5 py-4">
                          <span className="text-slate-600">Purchase Expenses</span>

                          <span className="font-semibold text-slate-900">
                            - {formatCurrency(profitLossReport?.expenses)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
                          <span className="font-semibold text-slate-900">
                            Net Profit
                          </span>

                          <span
                            className={`text-base font-bold ${
                              profit >= 0 ? "text-slate-900" : "text-red-600"
                            }`}
                          >
                            {formatCurrency(profit)}
                          </span>
                        </div>

                      </div>

                    </div>

                  </>
                )}

              </div>

            </div>

          </>

        )}

      </div>
    </>
  );
};

export default Reports;