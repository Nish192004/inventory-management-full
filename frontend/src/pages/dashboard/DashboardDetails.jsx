import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Boxes,
  ShoppingCart,
  IndianRupee,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const number = (value) => Number(value || 0);

const formatCurrency = (value) => {
  return `₹${number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPageType = (pathname) => {
  if (pathname.includes("/dashboard/products")) {
    return "products";
  }

  if (pathname.includes("/dashboard/stock")) {
    return "stock";
  }

  if (pathname.includes("/dashboard/sales")) {
    return "sales";
  }

  if (pathname.includes("/dashboard/revenue")) {
    return "revenue";
  }

  return "products";
};

const PAGE_CONFIG = {
  products: {
    title: "Products Details",
    description: "View all products currently stored in the inventory.",
    icon: Package,
  },

  stock: {
    title: "Stock Details",
    description: "View current inventory stock and stock levels.",
    icon: Boxes,
  },

  sales: {
    title: "Sales Details",
    description: "View completed sales recorded in the system.",
    icon: ShoppingCart,
  },

  revenue: {
    title: "Revenue Details",
    description: "View revenue generated from completed sales.",
    icon: IndianRupee,
  },
};

export default function DashboardDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const pageType = useMemo(
    () => getPageType(location.pathname),
    [location.pathname]
  );

  const config = PAGE_CONFIG[pageType];

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint = "";

      switch (pageType) {
        case "products":
          endpoint = "/dashboard/products";
          break;

        case "stock":
          endpoint = "/dashboard/stock";
          break;

        case "sales":
          endpoint = "/dashboard/sales-details";
          break;

        case "revenue":
          endpoint = "/dashboard/revenue-details";
          break;

        default:
          endpoint = "/dashboard/products";
      }

      const response = await api.get(endpoint);

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
    } catch (err) {
      console.error("Dashboard details error:", err);

      setData([]);
      setSummary(null);

      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [pageType]);

  const renderProducts = () => {
    if (!data.length) {
      return <EmptyState message="No products found." />;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                #
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Product
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                SKU
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Quantity
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Price
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((product, index) => {
              const quantity = number(
                product.quantity ?? product.stock
              );

              const minStock = number(product.minStock);

              let status = "In Stock";

              if (quantity === 0) {
                status = "Out of Stock";
              } else if (minStock > 0 && quantity <= minStock) {
                status = "Low Stock";
              }

              return (
                <tr
                  key={product.id ?? index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {product.name || "-"}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.sku || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {quantity}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatCurrency(product.price)}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStock = () => {
    if (!data.length) {
      return <EmptyState message="No stock records found." />;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                #
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Product
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                SKU
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Current Stock
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Minimum Stock
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((product, index) => {
              const quantity = number(
                product.quantity ?? product.stock
              );

              const minStock = number(product.minStock);

              let status = "Healthy";

              if (quantity === 0) {
                status = "Out of Stock";
              } else if (minStock > 0 && quantity <= minStock) {
                status = "Low Stock";
              }

              return (
                <tr
                  key={product.id ?? index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-900">
                    {product.name || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.sku || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {quantity}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {minStock}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSales = () => {
    if (!data.length) {
      return <EmptyState message="No completed sales found." />;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                #
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Invoice
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Customer
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Total
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((sale, index) => (
              <tr
                key={sale.id ?? index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4 text-sm text-gray-500">
                  {index + 1}
                </td>

                <td className="px-6 py-4 font-medium text-gray-900">
                  {sale.invoiceNumber || `#${sale.id || "-"}`}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {sale.customerName ||
                    sale.customer?.name ||
                    "Walk-in Customer"}
                </td>

                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {formatCurrency(sale.total)}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge
                    status={sale.status || "COMPLETED"}
                  />
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(sale.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRevenue = () => {
    if (!data.length) {
      return <EmptyState message="No revenue records found." />;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                #
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Invoice
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Revenue
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((sale, index) => (
              <tr
                key={sale.id ?? index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4 text-sm text-gray-500">
                  {index + 1}
                </td>

                <td className="px-6 py-4 font-medium text-gray-900">
                  {sale.invoiceNumber ||
                    sale.invoice ||
                    `#${sale.id || "-"}`}
                </td>

                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {formatCurrency(
                    sale.total ?? sale.revenue ?? sale.amount
                  )}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge
                    status={sale.status || "COMPLETED"}
                  />
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(sale.createdAt || sale.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    switch (pageType) {
      case "products":
        return renderProducts();

      case "stock":
        return renderStock();

      case "sales":
        return renderSales();

      case "revenue":
        return renderRevenue();

      default:
        return renderProducts();
    }
  };

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
              title="Back to Dashboard"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Icon size={22} className="text-gray-700" />

                <h1 className="text-2xl font-bold text-gray-900">
                  {config.title}
                </h1>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {config.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadDetails}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>

        {/* Read-only notice */}
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          This is a read-only dashboard detail page. Data is displayed directly
          from the inventory database.
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load details
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && !loading && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(summary)
              .slice(0, 4)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {typeof value === "number"
                      ? value.toLocaleString("en-IN")
                      : String(value ?? "-")}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Main Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {config.title}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {loading
                    ? "Loading data..."
                    : `${data.length} record${
                        data.length === 1 ? "" : "s"
                      } found`}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "")
    .toUpperCase()
    .replaceAll("_", " ");

  let classes =
    "bg-gray-100 text-gray-700";

  if (
    normalized === "COMPLETED" ||
    normalized === "IN STOCK" ||
    normalized === "HEALTHY" ||
    normalized === "RECEIVED"
  ) {
    classes = "bg-green-100 text-green-700";
  }

  if (
    normalized === "LOW STOCK" ||
    normalized === "PENDING"
  ) {
    classes = "bg-yellow-100 text-yellow-700";
  }

  if (
    normalized === "OUT OF STOCK" ||
    normalized === "CANCELLED" ||
    normalized === "DAMAGE"
  ) {
    classes = "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {normalized || "UNKNOWN"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500">
        <RefreshCw size={20} className="animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center px-6">
      <div className="text-center">
        <Package
          size={42}
          className="mx-auto mb-3 text-gray-300"
        />

        <p className="text-sm text-gray-500">
          {message}
        </p>
      </div>
    </div>
  );
}