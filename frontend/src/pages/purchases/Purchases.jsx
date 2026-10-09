import React, { useEffect, useMemo, useState } from "react";

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
  CheckCircle,
  XCircle,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  receivePurchase,
  cancelPurchase,
  deletePurchase,
} from "../../services/purchaseService";

import { getProducts } from "../../services/productService";
import { getSuppliers } from "../../services/supplierService";


// ============================================================
// CONSTANTS
// ============================================================

// Minimum time the refresh animation stays visible (ms)
const MIN_REFRESH_TIME = 700;

const emptyForm = {
  orderNumber: "",
  supplierId: "",
};

const emptyItem = {
  productId: "",
  quantity: 1,
  costPrice: "",
};

const PURCHASE_HEADINGS = [
  "Order Number",
  "Supplier",
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

const getStatusClass = (status) => {
  switch (status) {
    case "RECEIVED":
      return "bg-emerald-100 text-emerald-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "PENDING":
    default:
      return "bg-amber-100 text-amber-700";
  }
};


// ============================================================
// TABLE HEAD (shared by skeleton + real table)
// ============================================================

const PurchaseTableHead = () => (
  <thead className="border-b border-slate-200 bg-slate-50">
    <tr>
      {PURCHASE_HEADINGS.map((heading) => (
        <th
          key={heading}
          className="px-5 py-4 font-semibold text-slate-600"
        >
          {heading}
        </th>
      ))}
      <th className="px-5 py-4 text-right font-semibold text-slate-600">
        Actions
      </th>
    </tr>
  </thead>
);


// ============================================================
// PURCHASE TABLE SKELETON (first load only)
// ============================================================

const PurchaseTableSkeleton = () => {
  const rows = Array.from({ length: 7 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[950px] text-left text-sm">

        <PurchaseTableHead />

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
// PURCHASES
// ============================================================

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [search, setSearch] = useState("");

  // first load only -> skeleton
  const [loading, setLoading] = useState(true);

  // manual refresh -> progress bar + overlay (table stays visible)
  const [refreshing, setRefreshing] = useState(false);

  // changes after every refresh so rows replay their fade-in animation
  const [refreshKey, setRefreshKey] = useState(0);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [saving, setSaving] = useState(false);

  // id of the purchase currently being received / cancelled / deleted
  const [actionId, setActionId] = useState(null);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });

  const [items, setItems] = useState([{ ...emptyItem }]);


  // ==================================================
  // LOAD PURCHASES
  // silent = true  -> table stays on screen
  // silent = false -> skeleton (first load only)
  // returns true on success, false on failure
  // ==================================================

  const loadPurchases = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const response = await getPurchases();

      setPurchases(
        toArray(
          response?.data ||
            response?.purchases ||
            response
        )
      );

      setLastUpdated(new Date());

      return true;

    } catch (err) {
      console.error("Purchases loading error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load purchases.";

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
  // LOAD PRODUCTS & SUPPLIERS
  // ==================================================

  const loadFormData = async () => {
    try {
      const [productResponse, supplierResponse] =
        await Promise.all([
          getProducts(),
          getSuppliers(),
        ]);

      setProducts(
        toArray(
          productResponse?.data ||
            productResponse?.products ||
            productResponse
        )
      );

      setSuppliers(
        toArray(
          supplierResponse?.data ||
            supplierResponse?.suppliers ||
            supplierResponse
        )
      );
    } catch (err) {
      console.error("Purchases form data loading error:", err);
    }
  };

  useEffect(() => {
    loadPurchases();
    loadFormData();
  }, []);


  // ==================================================
  // SILENT RELOAD + REPLAY ROW ANIMATION
  // used after create / receive / cancel / delete
  // ==================================================

  const reloadAndAnimate = async () => {
    await loadPurchases({ silent: true });
    setRefreshKey((previous) => previous + 1);
  };


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
        loadPurchases({ silent: true }),
        loadFormData(),
        wait(MIN_REFRESH_TIME),
      ]);

      // replay the row fade-in animation with the fresh data
      setRefreshKey((previous) => previous + 1);

      if (ok) {
        toast.success("Purchases refreshed successfully.", {
          toastId: "purchases-refreshed",
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

  const filteredPurchases = purchases.filter((purchase) => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return true;
    }

    return (
      purchase.orderNumber?.toLowerCase().includes(value) ||
      purchase.supplier?.name?.toLowerCase().includes(value) ||
      purchase.status?.toLowerCase().includes(value) ||
      String(purchase.id).toLowerCase().includes(value)
    );
  });


  // ==================================================
  // CREATE MODAL
  // ==================================================

  const openCreate = () => {
    setError("");
    setForm({ ...emptyForm });
    setItems([{ ...emptyItem }]);
    setSelectedPurchase(null);
    setModal("create");
  };


  // ==================================================
  // VIEW PURCHASE
  // ==================================================

  const openView = async (purchase) => {
    try {
      setError("");

      const response = await getPurchaseById(purchase.id);

      setSelectedPurchase(
        response?.data ||
          response?.purchase ||
          response ||
          purchase
      );

      setModal("view");
    } catch (err) {
      console.error("Purchase details error:", err);

      setSelectedPurchase(purchase);
      setModal("view");
    }
  };


  // ==================================================
  // CLOSE MODAL
  // ==================================================

  const closeModal = () => {
    if (!saving) {
      setModal(null);
      setSelectedPurchase(null);
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
              costPrice:
                product?.costPrice !== undefined &&
                product?.costPrice !== null
                  ? product.costPrice
                  : item.costPrice ?? "",
            }
          : item
      )
    );
  };


  // ==================================================
  // TOTALS
  // ==================================================

  const getItemTotal = (item) =>
    Number(item.quantity || 0) * Number(item.costPrice || 0);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => sum + getItemTotal(item), 0),
    [items]
  );


  // ==================================================
  // CREATE PURCHASE
  // ==================================================

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.orderNumber.trim()) {
      toast.error("Order number is required.");
      return;
    }

    if (!form.supplierId) {
      toast.error("Please select a supplier.");
      return;
    }

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
        item.costPrice === "" ||
        item.costPrice === null ||
        Number(item.costPrice) < 0
      ) {
        toast.error("Cost price must be a valid amount.");
        return;
      }
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        orderNumber: form.orderNumber.trim(),

        supplierId: Number(form.supplierId),

        total: Number(total.toFixed(2)),

        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          costPrice: Number(item.costPrice),
          total: Number(getItemTotal(item).toFixed(2)),
        })),
      };

      await createPurchase(payload);

      toast.success("Purchase created successfully!");

      setModal(null);

      setForm({ ...emptyForm });

      setItems([{ ...emptyItem }]);

      // silent reload -> no skeleton flash after creating
      await reloadAndAnimate();
    } catch (err) {
      console.error("Create purchase error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create purchase.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };


  // ==================================================
  // RECEIVE PURCHASE
  // ==================================================

  const handleReceive = async (purchase) => {
    if (!window.confirm(`Receive purchase "${purchase.orderNumber}"?`)) {
      return;
    }

    try {
      setActionId(purchase.id);

      await receivePurchase(purchase.id);

      toast.success("Purchase received successfully!");

      await reloadAndAnimate();
    } catch (err) {
      console.error("Receive purchase error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to receive purchase."
      );
    } finally {
      setActionId(null);
    }
  };


  // ==================================================
  // CANCEL PURCHASE
  // ==================================================

  const handleCancel = async (purchase) => {
    if (!window.confirm(`Cancel purchase "${purchase.orderNumber}"?`)) {
      return;
    }

    try {
      setActionId(purchase.id);

      await cancelPurchase(purchase.id);

      toast.success("Purchase cancelled successfully!");

      await reloadAndAnimate();
    } catch (err) {
      console.error("Cancel purchase error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to cancel purchase."
      );
    } finally {
      setActionId(null);
    }
  };


  // ==================================================
  // DELETE PURCHASE
  // ==================================================

  const handleDelete = async (purchase) => {
    if (
      !window.confirm(
        `Delete purchase "${purchase.orderNumber}"?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setActionId(purchase.id);

      await deletePurchase(purchase.id);

      toast.success("Purchase deleted successfully!");

      await reloadAndAnimate();
    } catch (err) {
      console.error("Delete purchase error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete purchase."
      );
    } finally {
      setActionId(null);
    }
  };


  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      <style>
        {`
          @keyframes purchasePageFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .purchase-page-fade-in {
            animation: purchasePageFadeIn 0.35s ease-out;
          }

          @keyframes purchaseProgress {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }

          .purchase-progress-bar {
            animation: purchaseProgress 1.1s ease-in-out infinite;
          }

          @keyframes purchaseRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .purchase-row-in {
            animation: purchaseRowIn 0.3s ease-out both;
          }

          @keyframes purchaseOverlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          .purchase-overlay-in {
            animation: purchaseOverlayIn 0.2s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .purchase-page-fade-in,
            .purchase-progress-bar,
            .purchase-row-in,
            .purchase-overlay-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="purchase-page-fade-in w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Purchases
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage purchase orders and supplier purchases.
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

            {/* ADD PURCHASE */}
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Add Purchase
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
              placeholder="Search order, supplier or status..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

          </div>
        </div>

        {/* PURCHASES TABLE */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOP PROGRESS BAR (while refreshing) */}
          {refreshing && (
            <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden bg-slate-100">
              <div className="purchase-progress-bar h-full w-1/4 rounded-full bg-slate-900" />
            </div>
          )}

          {/* FLOATING "REFRESHING" PILL (same as Sales.jsx) */}
          {refreshing && (
            <div className="purchase-overlay-in pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-24 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
                <RefreshCw className="h-4 w-4 animate-spin text-slate-900" />
              </div>
            </div>
          )}

          {/* SKELETON ONLY ON FIRST LOAD */}
          {loading ? (

            <PurchaseTableSkeleton />

          ) : filteredPurchases.length === 0 ? (

            <div className="py-16 text-center">

              <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="font-medium text-slate-700">
                No purchases found.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {search.trim()
                  ? "Try a different order number or supplier name."
                  : "Create your first purchase order to get started."}
              </p>

            </div>

          ) : (

            <div
              className={`overflow-x-auto transition-opacity duration-200 ${
                refreshing ? "opacity-70" : "opacity-100"
              }`}
            >

              <table className="w-full min-w-[950px] text-left text-sm">

                <PurchaseTableHead />

                <tbody className="divide-y divide-slate-100">

                  {filteredPurchases.map((purchase, index) => (
                    <tr
                      key={`${purchase.id}-${refreshKey}`}
                      className="purchase-row-in transition hover:bg-slate-50"
                      style={{
                        animationDelay: `${Math.min(index, 12) * 30}ms`,
                      }}
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

                      <td className="px-5 py-4 font-bold text-slate-900">
                        ₹
                        {Number(purchase.total || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            purchase.status
                          )}`}
                        >
                          {purchase.status || "PENDING"}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {purchase.createdAt
                          ? new Date(purchase.createdAt).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-1">

                          {actionId === purchase.id ? (

                            <div className="p-2">
                              <RefreshCw className="h-4 w-4 animate-spin text-slate-500" />
                            </div>

                          ) : (

                            <>

                              <button
                                type="button"
                                onClick={() => openView(purchase)}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                title="View Purchase"
                                aria-label="View purchase"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {purchase.status === "PENDING" && (
                                <>

                                  <button
                                    type="button"
                                    onClick={() => handleReceive(purchase)}
                                    disabled={actionId !== null}
                                    className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Receive Purchase"
                                    aria-label="Receive purchase"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCancel(purchase)}
                                    disabled={actionId !== null}
                                    className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Cancel Purchase"
                                    aria-label="Cancel purchase"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>

                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDelete(purchase)}
                                disabled={actionId !== null}
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete Purchase"
                                aria-label="Delete purchase"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </>

                          )}

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
            CREATE PURCHASE MODAL
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
                    Create Purchase
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a new purchase order and add products.
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

                  {/* ORDER NUMBER */}
                  <div>

                    <label
                      htmlFor="purchase-orderNumber"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Order Number
                    </label>

                    <input
                      id="purchase-orderNumber"
                      value={form.orderNumber}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          orderNumber: event.target.value,
                        })
                      }
                      placeholder="e.g. PO-1001"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                  </div>

                  {/* SUPPLIER */}
                  <div>

                    <label
                      htmlFor="purchase-supplierId"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Supplier
                    </label>

                    <select
                      id="purchase-supplierId"
                      value={form.supplierId}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          supplierId: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    >

                      <option value="">Select Supplier</option>

                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                          {supplier.phone ? ` — ${supplier.phone}` : ""}
                        </option>
                      ))}

                    </select>

                  </div>

                  {/* ITEMS */}
                  <div>

                    <div className="mb-3 flex items-center justify-between">

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Purchase Items
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Add products included in this purchase.
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
                                htmlFor={`purchase-product-${index}`}
                                className="mb-1.5 block text-xs font-semibold text-slate-600"
                              >
                                Product
                              </label>

                              <select
                                id={`purchase-product-${index}`}
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
                                    {product.name}
                                    {product.sku ? ` (${product.sku})` : ""}
                                  </option>
                                ))}

                              </select>

                            </div>

                            {/* QUANTITY */}
                            <div>

                              <label
                                htmlFor={`purchase-quantity-${index}`}
                                className="mb-1.5 block text-xs font-semibold text-slate-600"
                              >
                                Quantity
                              </label>

                              <input
                                id={`purchase-quantity-${index}`}
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

                            {/* COST PRICE */}
                            <div>

                              <label
                                htmlFor={`purchase-costPrice-${index}`}
                                className="mb-1.5 block text-xs font-semibold text-slate-600"
                              >
                                Cost Price
                              </label>

                              <input
                                id={`purchase-costPrice-${index}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.costPrice}
                                onChange={(event) =>
                                  updateItem(index, "costPrice", event.target.value)
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

                  {/* PURCHASE TOTAL */}
                  <Info
                    label="Purchase Total"
                    value={`₹${total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                  />

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

                    {saving ? "Creating..." : "Create Purchase"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* ==================================================
            VIEW PURCHASE MODAL
        ================================================== */}

        {modal === "view" && selectedPurchase && (
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
                    Purchase Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    View purchase order information and items.
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

                  {/* PURCHASE INFORMATION */}
                  <div className="grid gap-4 sm:grid-cols-2">

                    <Info
                      label="Order Number"
                      value={selectedPurchase.orderNumber}
                    />

                    <Info
                      label="Supplier"
                      value={
                        selectedPurchase.supplier?.name ||
                        "Unknown Supplier"
                      }
                    />

                    <Info
                      label="Total"
                      value={`₹${Number(
                        selectedPurchase.total || 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <Info
                      label="Status"
                      value={selectedPurchase.status || "PENDING"}
                    />

                    <Info
                      label="Date"
                      value={
                        selectedPurchase.createdAt
                          ? new Date(selectedPurchase.createdAt).toLocaleString("en-IN")
                          : "-"
                      }
                    />

                    <Info
                      label="Last Updated"
                      value={
                        selectedPurchase.updatedAt
                          ? new Date(selectedPurchase.updatedAt).toLocaleString("en-IN")
                          : "-"
                      }
                    />

                  </div>

                  {/* ITEMS */}
                  <div>

                    <div className="mb-3">

                      <h3 className="font-semibold text-slate-900">
                        Purchase Items
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Products included in this purchase order.
                      </p>

                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200">

                      <table className="w-full text-left text-sm">

                        <thead className="bg-slate-50">

                          <tr>
                            <th className="px-4 py-3 font-semibold text-slate-600">Product</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">SKU</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Quantity</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Cost Price</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">Total</th>
                          </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                          {toArray(selectedPurchase.items).map((item, index) => (

                            <tr key={item.id || index}>

                              <td className="px-4 py-3 font-medium text-slate-900">
                                {item.product?.name ||
                                  item.productName ||
                                  item.productId ||
                                  "-"}
                              </td>

                              <td className="px-4 py-3 text-slate-500">
                                {item.product?.sku || "-"}
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                {item.quantity}
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                ₹
                                {Number(item.costPrice || 0).toLocaleString("en-IN")}
                              </td>

                              <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                ₹
                                {Number(
                                  item.total ||
                                    Number(item.quantity || 0) *
                                      Number(item.costPrice || 0)
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

export default Purchases;