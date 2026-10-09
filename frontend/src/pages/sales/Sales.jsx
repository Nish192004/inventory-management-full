import React, { useEffect, useState } from "react";

import {
  RefreshCw,
  ShoppingCart,
  Search,
  Plus,
  Eye,
  X,
  Trash2,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getSales,
  getSaleById,
  createSale,
} from "../../services/saleService";

import { getProducts } from "../../services/productService";
import { getCustomers } from "../../services/customerService";


// ============================================================
// CONSTANTS
// ============================================================

// Minimum time the refresh animation stays visible (ms)
const MIN_REFRESH_TIME = 700;

const emptySale = {
  customerId: "",
  customerName: "",
  tax: "",
  discount: "",
};

const emptyItem = {
  productId: "",
  quantity: 1,
  price: "",
};

const SALES_HEADINGS = [
  "Invoice",
  "Customer",
  "Items",
  "Total",
  "Status",
  "Date",
];

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const toArray = (value) =>
  Array.isArray(value) ? value : [];

const formatTime = (date) =>
  date
    ? date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";


// ============================================================
// TABLE HEAD (shared by skeleton + real table)
// ============================================================

const SalesTableHead = () => (
  <thead className="border-b border-slate-200 bg-slate-50">
    <tr>
      {SALES_HEADINGS.map((heading) => (
        <th
          key={heading}
          className="px-5 py-4 font-semibold text-slate-600"
        >
          {heading}
        </th>
      ))}
      <th className="px-5 py-4 text-right font-semibold text-slate-600">
        Action
      </th>
    </tr>
  </thead>
);


// ============================================================
// SALES TABLE SKELETON (first load only)
// ============================================================

const SalesTableSkeleton = () => {
  const rows = Array.from({ length: 7 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[950px] text-left text-sm">

        <SalesTableHead />

        <tbody className="divide-y divide-slate-100">
          {rows.map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-5 py-5"><div className="h-4 w-28 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-36 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-10 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-20 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-6 w-24 rounded-full bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-slate-200" /></td>
              <td className="px-5 py-5">
                <div className="flex justify-end">
                  <div className="h-8 w-8 rounded-lg bg-slate-200" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};


// ============================================================
// SALES
// ============================================================

const Sales = () => {
  const [sales, setSales] = useState([]);

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  // first load only -> skeleton
  const [loading, setLoading] = useState(true);

  // manual refresh -> progress bar + overlay (table stays visible)
  const [refreshing, setRefreshing] = useState(false);

  // changes after every refresh so rows replay their fade-in animation
  const [refreshKey, setRefreshKey] = useState(0);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  const [form, setForm] = useState({ ...emptySale });

  const [items, setItems] = useState([{ ...emptyItem }]);


  // ==================================================
  // LOAD SALES
  // silent = true  -> table stays on screen
  // silent = false -> skeleton (first load only)
  // returns true on success, false on failure
  // ==================================================

  const loadSales = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const response = await getSales();

      setSales(
        toArray(
          response?.data ||
            response?.sales ||
            response
        )
      );

      setLastUpdated(new Date());

      return true;

    } catch (err) {
      console.error("Sales loading error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load sales.";

      setError(message);
      toast.error(message);

      return false;

    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };


  // ==================================================
  // LOAD PRODUCTS & CUSTOMERS
  // ==================================================

  const loadFormData = async () => {
    try {
      const [productResponse, customerResponse] =
        await Promise.all([
          getProducts(),
          getCustomers(),
        ]);

      setProducts(
        toArray(
          productResponse?.data ||
            productResponse?.products ||
            productResponse
        )
      );

      setCustomers(
        toArray(
          customerResponse?.data ||
            customerResponse?.customers ||
            customerResponse
        )
      );
    } catch (err) {
      console.error("Sales form data loading error:", err);
    }
  };

  useEffect(() => {
    loadSales();
    loadFormData();
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
        loadSales({ silent: true }),
        loadFormData(),
        wait(MIN_REFRESH_TIME),
      ]);

      // replay the row fade-in animation with the fresh data
      setRefreshKey((previous) => previous + 1);

      if (ok) {
        toast.success("Sales refreshed successfully.", {
          toastId: "sales-refreshed",
        });
      }
    } finally {
      // always runs, so the button can never get stuck on "Refreshing..."
      setRefreshing(false);
    }
  };


  // ==================================================
  // SEARCH
  // ==================================================

  const filteredSales = sales.filter((sale) => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return true;
    }

    return (
      sale.invoiceNumber?.toLowerCase().includes(value) ||
      sale.customer?.name?.toLowerCase().includes(value) ||
      sale.customerName?.toLowerCase().includes(value) ||
      String(sale.id).toLowerCase().includes(value)
    );
  });


  // ==================================================
  // CREATE MODAL
  // ==================================================

  const openCreate = () => {
    setError("");
    setForm({ ...emptySale });
    setItems([{ ...emptyItem }]);
    setModal("create");
  };


  // ==================================================
  // VIEW SALE
  // ==================================================

  const openView = async (sale) => {
    try {
      setError("");

      const response = await getSaleById(sale.id);

      setSelectedSale(
        response?.data ||
          response?.sale ||
          response ||
          sale
      );

      setModal("view");
    } catch (err) {
      console.error("Sale details error:", err);

      setSelectedSale(sale);
      setModal("view");
    }
  };


  // ==================================================
  // CLOSE MODAL
  // ==================================================

  const closeModal = () => {
    if (!saving) {
      setModal(null);
      setSelectedSale(null);
      setError("");
    }
  };


  // ==================================================
  // ITEMS
  // ==================================================

  const addItem = () => {
    setItems((previous) => [...previous, { ...emptyItem }]);
  };

  const removeItem = (index) => {
    setItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const updateItem = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };


  // ==================================================
  // PRODUCT SELECTION
  // ==================================================

  const handleProductChange = (index, productId) => {
    const product = products.find(
      (item) => String(item.id) === String(productId)
    );

    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              productId,
              price:
                product?.price !== undefined &&
                product?.price !== null
                  ? product.price
                  : "",
            }
          : item
      )
    );
  };


  // ==================================================
  // CUSTOMER SELECTION
  // ==================================================

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(
      (item) => String(item.id) === String(customerId)
    );

    setForm((previous) => ({
      ...previous,
      customerId,
      customerName: customer?.name || "",
    }));
  };


  // ==================================================
  // CREATE SALE
  // ==================================================

  const handleCreate = async (event) => {
    event.preventDefault();

    if (items.length === 0) {
      toast.error("Please add at least one item.");
      return;
    }

    for (const item of items) {
      if (!item.productId) {
        toast.error("Please select a product.");
        return;
      }

      if (!item.quantity || Number(item.quantity) <= 0) {
        toast.error("Product quantity must be greater than 0.");
        return;
      }

      if (
        item.price === "" ||
        item.price === null ||
        Number(item.price) < 0
      ) {
        toast.error("Product price must be a valid amount.");
        return;
      }
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        customerId: form.customerId
          ? Number(form.customerId)
          : null,

        customerName: form.customerName || null,

        tax: Number(form.tax || 0),

        discount: Number(form.discount || 0),

        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      };

      await createSale(payload);

      toast.success("Sale created successfully!");

      setModal(null);

      setForm({ ...emptySale });

      setItems([{ ...emptyItem }]);

      // silent reload -> no skeleton flash after creating
      await loadSales({ silent: true });

      // replay the row fade-in animation with the new data
      setRefreshKey((previous) => previous + 1);
    } catch (err) {
      console.error("Create sale error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create sale.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };


  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      <style>
        {`
          @keyframes salesPageFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .sales-page-fade-in {
            animation: salesPageFadeIn 0.35s ease-out;
          }

          @keyframes salesProgress {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }

          .sales-progress-bar {
            animation: salesProgress 1.1s ease-in-out infinite;
          }

          @keyframes salesRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .sales-row-in {
            animation: salesRowIn 0.3s ease-out both;
          }

          @keyframes salesOverlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          .sales-overlay-in {
            animation: salesOverlayIn 0.2s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .sales-page-fade-in,
            .sales-progress-bar,
            .sales-row-in,
            .sales-overlay-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="sales-page-fade-in w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Sales
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage sales and invoices.
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

            {/* CREATE SALE */}
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Create Sale
            </button>

          </div>
        </div>

        {/* ERROR (hidden while the create modal is open;
            the modal shows its own error) */}
        {error && modal !== "create" && (
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

        {/* SEARCH */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

          </div>
        </div>

        {/* SALES TABLE */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOP PROGRESS BAR (while refreshing) */}
          {refreshing && (
            <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden bg-slate-100">
              <div className="sales-progress-bar h-full w-1/4 rounded-full bg-slate-900" />
            </div>
          )}

          {/* FLOATING "REFRESHING" PILL (same as Products.jsx) */}
          {refreshing && (
            <div className="sales-overlay-in pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-24 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
                <RefreshCw className="h-4 w-4 animate-spin text-slate-900" />
              </div>
            </div>
          )}

          {/* SKELETON ONLY ON FIRST LOAD */}
          {loading ? (

            <SalesTableSkeleton />

          ) : filteredSales.length === 0 ? (

            <div className="py-16 text-center">

              <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="font-medium text-slate-700">
                No sales found.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {search.trim()
                  ? "Try a different invoice or customer name."
                  : "Create your first sale to get started."}
              </p>

            </div>

          ) : (

            <div
              className={`overflow-x-auto transition-opacity duration-200 ${
                refreshing ? "opacity-70" : "opacity-100"
              }`}
            >

              <table className="w-full min-w-[950px] text-left text-sm">

                <SalesTableHead />

                <tbody className="divide-y divide-slate-100">

                  {filteredSales.map((sale, index) => (
                    <tr
                      key={`${sale.id}-${refreshKey}`}
                      className="sales-row-in transition hover:bg-slate-50"
                      style={{
                        animationDelay: `${Math.min(index, 12) * 30}ms`,
                      }}
                    >

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {sale.invoiceNumber ||
                          sale.invoice ||
                          sale.id}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {sale.customer?.name ||
                          sale.customerName ||
                          "Walk-in Customer"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {sale.items?.length ||
                          sale.saleItems?.length ||
                          0}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        ₹
                        {Number(
                          sale.total ||
                            sale.totalAmount ||
                            0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            sale.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : sale.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : sale.status === "REFUNDED"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {sale.status || "COMPLETED"}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {sale.createdAt
                          ? new Date(sale.createdAt).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end">

                          <button
                            type="button"
                            onClick={() => openView(sale)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="View Sale"
                            aria-label="View sale"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* ==================================================
            CREATE SALE MODAL
        ================================================== */}

        {modal === "create" && (
          <div
            className="fixed bottom-0 right-0 top-16 z-[200] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px] transition-[left] duration-300 ease-in-out sm:p-6"
            style={{
              left: "var(--sidebar-width, 0px)",
            }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >

            <div className="flex max-h-[calc(100vh-112px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

              {/* HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Create Sale
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a new customer sale and invoice.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* BODY */}
              <form
                onSubmit={handleCreate}
                className="min-h-0 flex-1 overflow-y-auto"
              >

                <div className="space-y-6 px-6 py-6">

                  {/* ERROR INSIDE MODAL */}
                  {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* CUSTOMER */}
                  <div>

                    <label
                      htmlFor="sale-customerId"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Customer
                    </label>

                    <select
                      id="sale-customerId"
                      value={form.customerId}
                      onChange={(event) =>
                        handleCustomerChange(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    >

                      <option value="">Walk-in Customer</option>

                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                          {customer.phone ? ` — ${customer.phone}` : ""}
                        </option>
                      ))}

                    </select>

                  </div>

                  {/* CUSTOMER NAME FOR WALK-IN */}
                  {!form.customerId && (
                    <div>

                      <label
                        htmlFor="sale-customerName"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Customer Name
                      </label>

                      <input
                        id="sale-customerName"
                        value={form.customerName}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            customerName: event.target.value,
                          })
                        }
                        placeholder="Walk-in Customer"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                    </div>
                  )}

                  {/* ITEMS */}
                  <div>

                    <div className="mb-3 flex items-center justify-between">

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Sale Items
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Add products included in this sale.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        <Plus className="h-3.5 w-3.5" />

                        Add Item
                      </button>

                    </div>

                    <div className="space-y-3">

                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                        >

                          <div className="grid gap-4 md:grid-cols-[1fr_140px_170px_auto]">

                            {/* PRODUCT */}
                            <div>

                              <label
                                htmlFor={`sale-product-${index}`}
                                className="mb-1.5 block text-xs font-semibold text-slate-600"
                              >
                                Product
                              </label>

                              <select
                                id={`sale-product-${index}`}
                                value={item.productId}
                                onChange={(event) =>
                                  handleProductChange(index, event.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                              >

                                <option value="">Select product</option>

                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} — Stock: {product.quantity ?? 0}
                                  </option>
                                ))}

                              </select>

                            </div>

                            {/* QUANTITY */}
                            <div>

                              <label
                                htmlFor={`sale-quantity-${index}`}
                                className="mb-1.5 block text-xs font-semibold text-slate-600"
                              >
                                Quantity
                              </label>

                              <input
                                id={`sale-quantity-${index}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(event) =>
                                  updateItem(index, "quantity", event.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                              />

                            </div>

                            {/* PRICE */}
                            <div>

                              <label
                                htmlFor={`sale-price-${index}`}
                                className="mb-1.5 block text-xs font-semibold text-slate-600"
                              >
                                Selling Price
                              </label>

                              <input
                                id={`sale-price-${index}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(event) =>
                                  updateItem(index, "price", event.target.value)
                                }
                                required
                                placeholder="0.00"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                              />

                            </div>

                            {/* REMOVE */}
                            <div className="flex items-end">

                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="rounded-lg p-2.5 text-red-600 transition hover:bg-red-50"
                                  title="Remove item"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}

                            </div>

                          </div>

                        </div>
                      ))}

                    </div>

                  </div>

                  {/* TAX & DISCOUNT */}
                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>

                      <label
                        htmlFor="sale-tax"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Tax
                      </label>

                      <input
                        id="sale-tax"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={form.tax}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            tax: event.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                    </div>

                    <div>

                      <label
                        htmlFor="sale-discount"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Discount
                      </label>

                      <input
                        id="sale-discount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={form.discount}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            discount: event.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                    </div>

                  </div>

                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving && <RefreshCw className="h-4 w-4 animate-spin" />}

                    {saving ? "Creating..." : "Create Sale"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* ==================================================
            VIEW SALE MODAL
        ================================================== */}

        {modal === "view" && selectedSale && (
          <div
            className="fixed bottom-0 right-0 top-16 z-[200] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px] transition-[left] duration-300 ease-in-out sm:p-6"
            style={{
              left: "var(--sidebar-width, 0px)",
            }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >

            <div className="flex max-h-[calc(100vh-112px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

              {/* HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Sale Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    View invoice and sale information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* BODY */}
              <div className="min-h-0 flex-1 overflow-y-auto">

                <div className="space-y-6 px-6 py-6">

                  {/* SALE INFORMATION */}
                  <div className="grid gap-4 sm:grid-cols-2">

                    <Info
                      label="Invoice"
                      value={selectedSale.invoiceNumber}
                    />

                    <Info
                      label="Customer"
                      value={
                        selectedSale.customer?.name ||
                        selectedSale.customerName ||
                        "Walk-in Customer"
                      }
                    />

                    <Info
                      label="Total"
                      value={`₹${Number(
                        selectedSale.total || 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <Info
                      label="Status"
                      value={selectedSale.status || "COMPLETED"}
                    />

                    <Info
                      label="Date"
                      value={
                        selectedSale.createdAt
                          ? new Date(selectedSale.createdAt).toLocaleString("en-IN")
                          : "-"
                      }
                    />

                    <Info
                      label="Tax"
                      value={`₹${Number(
                        selectedSale.tax || 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <Info
                      label="Discount"
                      value={`₹${Number(
                        selectedSale.discount || 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <Info
                      label="Subtotal"
                      value={`₹${Number(
                        selectedSale.subtotal || 0
                      ).toLocaleString("en-IN")}`}
                    />

                  </div>

                  {/* ITEMS */}
                  <div>

                    <div className="mb-3">

                      <h3 className="font-semibold text-slate-900">
                        Sale Items
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Products included in this invoice.
                      </p>

                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200">

                      <table className="w-full text-left text-sm">

                        <thead className="bg-slate-50">

                          <tr>
                            <th className="px-4 py-3 font-semibold text-slate-600">Product</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Quantity</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Price</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">Total</th>
                          </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                          {(
                            selectedSale.items ||
                            selectedSale.saleItems ||
                            []
                          ).map((item, index) => (

                            <tr key={item.id || index}>

                              <td className="px-4 py-3 font-medium text-slate-900">
                                {item.product?.name ||
                                  item.productName ||
                                  item.productId ||
                                  "-"}
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                {item.quantity}
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                ₹
                                {Number(item.price || 0).toLocaleString("en-IN")}
                              </td>

                              <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                ₹
                                {Number(
                                  item.total ||
                                    Number(item.quantity || 0) *
                                      Number(item.price || 0)
                                ).toLocaleString("en-IN")}
                              </td>

                            </tr>

                          ))}

                        </tbody>

                      </table>

                    </div>

                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div className="sticky bottom-0 flex shrink-0 justify-end border-t border-slate-200 bg-white px-6 py-4">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
};


// ==================================================
// INFO COMPONENT
// ==================================================

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-4">

    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 font-semibold text-slate-800">
      {value || "-"}
    </p>

  </div>
);

export default Sales;