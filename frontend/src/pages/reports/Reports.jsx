import React, { useEffect, useState } from "react";
import {
  BarChart3,
  RefreshCw,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Tags,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Boxes,
  X,
} from "lucide-react";

import {
  getReportDashboard,
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getProfitLossReport,
} from "../../services/reportService";

// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getData = (response) => {
  if (response?.data) {
    return response.data;
  }

  return response || {};
};

// =====================================================
// REPORTS
// =====================================================

const Reports = () => {
  const [dashboard, setDashboard] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [purchaseReport, setPurchaseReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [profitLossReport, setProfitLossReport] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ALL REPORTS
  // =====================================================

  const loadReports = async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      console.error("Reports loading error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <BarChart3 size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Reports
            </h1>

            <p className="text-sm text-slate-500">
              Analyze your inventory business data
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <RefreshCw
            size={32}
            className="mx-auto mb-4 animate-spin text-slate-400"
          />

          <p className="font-medium text-slate-700">
            Loading reports...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Fetching data from your database.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <BarChart3 size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Reports
              </h1>

              <p className="text-sm text-slate-500">
                Analyze your inventory business data
              </p>
            </div>
          </div>

          <button
            onClick={loadReports}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 text-red-600"
            />

            <div>
              <p className="font-semibold text-red-800">
                Unable to load reports
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // SAFE VALUES
  // =====================================================

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

  const sales = Array.isArray(salesReport?.sales)
    ? salesReport.sales
    : [];

  const purchases = Array.isArray(
    purchaseReport?.purchases
  )
    ? purchaseReport.purchases
    : [];

  const inventoryProducts = Array.isArray(
    inventoryReport?.products
  )
    ? inventoryReport.products
    : [];

  const stockValue = Number(
    inventoryReport?.stockValue || 0
  );

  // =====================================================
  // TABS
  // =====================================================

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
    },
    {
      id: "sales",
      label: "Sales",
      icon: ShoppingCart,
    },
    {
      id: "purchases",
      label: "Purchases",
      icon: Truck,
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
    },
    {
      id: "profit",
      label: "Profit & Loss",
      icon: TrendingUp,
    },
  ];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <BarChart3 size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Reports
            </h1>

            <p className="text-sm text-slate-500">
              Analyze your inventory business data
            </p>
          </div>

        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>

      </div>

      {/* =================================================
          TABS
      ================================================= */}

      <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex min-w-max">

          {tabs.map((tab) => {
            const Icon = tab.icon;

            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium transition ${
                  active
                    ? "border-slate-900 bg-slate-50 text-slate-900"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon size={18} />

                {tab.label}
              </button>
            );
          })}

        </div>

      </div>

      {/* =================================================
          OVERVIEW
      ================================================= */}

      {activeTab === "overview" && (
        <div className="space-y-6">

          {/* FINANCIAL CARDS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* REVENUE */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Revenue
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {formatCurrency(totalSales)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <IndianRupee size={20} />
                </div>

              </div>

            </div>

            {/* PURCHASES */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Purchases
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {formatCurrency(totalPurchases)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Truck size={20} />
                </div>

              </div>

            </div>

            {/* PROFIT */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Estimated Profit
                  </p>

                  <p
                    className={`mt-1 text-2xl font-bold ${
                      profit >= 0
                        ? "text-slate-800"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(profit)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  {profit >= 0 ? (
                    <TrendingUp size={20} />
                  ) : (
                    <TrendingDown size={20} />
                  )}
                </div>

              </div>

            </div>

            {/* STOCK VALUE */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Stock Value
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {formatCurrency(stockValue)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Boxes size={20} />
                </div>

              </div>

            </div>

          </div>

          {/* BUSINESS COUNTS */}

          <div>

            <div className="mb-4 flex items-center gap-2">
              <FileText
                size={20}
                className="text-slate-700"
              />

              <h2 className="text-lg font-bold text-slate-800">
                Business Overview
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Products
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                      {productCount}
                    </p>
                  </div>

                  <Package
                    size={23}
                    className="text-slate-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Categories
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                      {categoryCount}
                    </p>
                  </div>

                  <Tags
                    size={23}
                    className="text-slate-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Suppliers
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                      {supplierCount}
                    </p>
                  </div>

                  <Truck
                    size={23}
                    className="text-slate-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Customers
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                      {customerCount}
                    </p>
                  </div>

                  <Users
                    size={23}
                    className="text-slate-500"
                  />
                </div>
              </div>

            </div>

          </div>

          {/* STOCK STATUS */}

          <div>

            <div className="mb-4 flex items-center gap-2">
              <Package
                size={20}
                className="text-slate-700"
              />

              <h2 className="text-lg font-bold text-slate-800">
                Inventory Status
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Stock
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {totalStock}
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={18}
                    className="text-amber-600"
                  />

                  <p className="text-sm text-amber-700">
                    Low Stock
                  </p>
                </div>

                <p className="mt-1 text-2xl font-bold text-amber-800">
                  {lowStock}
                </p>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={18}
                    className="text-red-600"
                  />

                  <p className="text-sm text-red-700">
                    Out of Stock
                  </p>
                </div>

                <p className="mt-1 text-2xl font-bold text-red-800">
                  {outOfStock}
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          SALES REPORT
      ================================================= */}

      {activeTab === "sales" && (
        <div className="space-y-5">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Completed Sales
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {salesReport?.salesCount || 0}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Sales
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {formatCurrency(
                  salesReport?.totalSales
                )}
              </p>
            </div>

          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-800">
                Sales Report
              </h2>

              <p className="text-sm text-slate-500">
                Completed sales transactions
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Invoice
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Items
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Total
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {sales.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-12 text-center text-sm text-slate-500"
                      >
                        No completed sales found.
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr
                        key={sale.id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 font-medium text-slate-800">
                          {sale.invoiceNumber}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {sale.customer?.name ||
                            sale.customerName ||
                            "Walk-in Customer"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {sale.items?.length || 0}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(
                            sale.createdAt
                          )}
                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-slate-800">
                          {formatCurrency(
                            sale.total
                          )}
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          PURCHASE REPORT
      ================================================= */}

      {activeTab === "purchases" && (
        <div className="space-y-5">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Received Purchases
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {purchaseReport?.purchaseCount || 0}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Purchases
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {formatCurrency(
                  purchaseReport?.totalPurchases
                )}
              </p>
            </div>

          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-800">
                Purchase Report
              </h2>

              <p className="text-sm text-slate-500">
                Received purchase orders
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Order Number
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Supplier
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Items
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Total
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {purchases.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-12 text-center text-sm text-slate-500"
                      >
                        No received purchases found.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr
                        key={purchase.id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 font-medium text-slate-800">
                          {purchase.orderNumber}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {purchase.supplier?.name ||
                            "Unknown Supplier"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {purchase.items?.length || 0}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(
                            purchase.createdAt
                          )}
                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-slate-800">
                          {formatCurrency(
                            purchase.total
                          )}
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          INVENTORY REPORT
      ================================================= */}

      {activeTab === "inventory" && (
        <div className="space-y-5">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Products
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {inventoryReport?.totalProducts || 0}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Stock
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {totalStock}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Stock Value
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {formatCurrency(stockValue)}
              </p>
            </div>

          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4">

              <h2 className="font-bold text-slate-800">
                Inventory Report
              </h2>

              <p className="text-sm text-slate-500">
                Current product stock and valuation
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      SKU
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Cost Price
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Stock Value
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {inventoryProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-12 text-center text-sm text-slate-500"
                      >
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    inventoryProducts.map(
                      (product) => {
                        const quantity = Number(
                          product.quantity || 0
                        );

                        const costPrice = Number(
                          product.costPrice || 0
                        );

                        const value =
                          quantity *
                          costPrice;

                        const isOut =
                          quantity === 0;

                        const isLow =
                          quantity > 0 &&
                          quantity <=
                            Number(
                              product.minStock || 0
                            );

                        return (
                          <tr
                            key={product.id}
                            className="hover:bg-slate-50"
                          >

                            <td className="px-5 py-4 font-medium text-slate-800">
                              {product.name}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {product.sku}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {product.category?.name ||
                                "Uncategorized"}
                            </td>

                            <td className="px-5 py-4 text-right">

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  isOut
                                    ? "bg-red-100 text-red-700"
                                    : isLow
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {quantity}
                              </span>

                            </td>

                            <td className="px-5 py-4 text-right text-sm text-slate-600">
                              {formatCurrency(
                                costPrice
                              )}
                            </td>

                            <td className="px-5 py-4 text-right font-semibold text-slate-800">
                              {formatCurrency(value)}
                            </td>

                          </tr>
                        );
                      }
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          PROFIT & LOSS
      ================================================= */}

      {activeTab === "profit" && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* REVENUE */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <TrendingUp size={21} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Revenue
                  </p>

                  <p className="text-xl font-bold text-slate-800">
                    {formatCurrency(
                      profitLossReport?.revenue
                    )}
                  </p>
                </div>

              </div>

            </div>

            {/* EXPENSES */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <TrendingDown size={21} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Expenses
                  </p>

                  <p className="text-xl font-bold text-slate-800">
                    {formatCurrency(
                      profitLossReport?.expenses
                    )}
                  </p>
                </div>

              </div>

            </div>

            {/* PROFIT */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <IndianRupee size={21} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Net Profit
                  </p>

                  <p
                    className={`text-xl font-bold ${
                      profit >= 0
                        ? "text-slate-800"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(profit)}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* PROFIT LOSS BREAKDOWN */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">

              <h2 className="text-lg font-bold text-slate-800">
                Profit & Loss Summary
              </h2>

              <p className="text-sm text-slate-500">
                Revenue minus received purchase expenses
              </p>

            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">

                <span className="text-sm text-slate-600">
                  Revenue
                </span>

                <span className="font-semibold text-slate-800">
                  {formatCurrency(
                    profitLossReport?.revenue
                  )}
                </span>

              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">

                <span className="text-sm text-slate-600">
                  Purchase Expenses
                </span>

                <span className="font-semibold text-slate-800">
                  -{" "}
                  {formatCurrency(
                    profitLossReport?.expenses
                  )}
                </span>

              </div>

              <div className="flex items-center justify-between pt-1">

                <span className="font-bold text-slate-800">
                  Net Profit
                </span>

                <span
                  className={`text-xl font-bold ${
                    profit >= 0
                      ? "text-slate-900"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(profit)}
                </span>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Reports;