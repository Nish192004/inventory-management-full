import React, { useEffect, useState } from "react";

import {
  Boxes,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Plus,
  History,
  X,
  Clock,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getInventory,
  getLowStock,
  getStockMovements,
  adjustStock,
} from "../../services/inventoryService";


// ============================================================
// CONSTANTS
// ============================================================

// Minimum time the refresh animation stays visible (ms)
const MIN_REFRESH_TIME = 700;

const emptyForm = {
  productId: "",
  quantity: "",
  type: "IN",
  note: "",
};

const INVENTORY_HEADINGS = [
  "Product",
  "SKU",
  "Stock",
  "Minimum",
  "Status",
  "Action",
];

const MOVEMENT_HEADINGS = [
  "Product",
  "Type",
  "Quantity",
  "Before",
  "After",
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
// TABLE HEADS (shared by skeletons + real tables)
// ============================================================

const InventoryTableHead = () => (
  <thead className="border-b border-slate-200 bg-slate-50">
    <tr>
      {INVENTORY_HEADINGS.map((heading) => (
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

const MovementTableHead = () => (
  <thead className="border-b border-slate-200 bg-slate-50">
    <tr>
      {MOVEMENT_HEADINGS.map((heading) => (
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
// INVENTORY TABLE SKELETON (first load only)
// ============================================================

const InventoryTableSkeleton = () => {
  const rows = Array.from({ length: 6 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">

        <InventoryTableHead />

        <tbody className="divide-y divide-slate-100">
          {rows.map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-5 py-5"><div className="h-4 w-40 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-12 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-12 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-6 w-24 rounded-full bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-8 w-16 rounded-lg bg-slate-200" /></td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};


// ============================================================
// MOVEMENT TABLE SKELETON (first load only)
// ============================================================

const MovementTableSkeleton = () => {
  const rows = Array.from({ length: 4 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">

        <MovementTableHead />

        <tbody className="divide-y divide-slate-100">
          {rows.map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-5 py-5"><div className="h-4 w-40 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-6 w-14 rounded-full bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-12 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-12 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-12 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-slate-200" /></td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};


// ============================================================
// INVENTORY
// ============================================================

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [movements, setMovements] = useState([]);

  // first load only -> skeleton
  const [loading, setLoading] = useState(true);

  // manual refresh -> progress bar + overlay (tables stay visible)
  const [refreshing, setRefreshing] = useState(false);

  // changes after every refresh so rows replay their fade-in animation
  const [refreshKey, setRefreshKey] = useState(0);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({ ...emptyForm });


  // --------------------------------------------------
  // LOAD INVENTORY
  // silent = true  -> tables stay on screen
  // silent = false -> skeleton (first load only)
  // returns true on success, false on failure
  // --------------------------------------------------

  const loadInventory = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const [
        inventoryResponse,
        lowStockResponse,
        movementResponse,
      ] = await Promise.all([
        getInventory(),
        getLowStock(),
        getStockMovements(),
      ]);

      setInventory(
        toArray(
          inventoryResponse?.data ||
            inventoryResponse?.products ||
            inventoryResponse
        )
      );

      setLowStock(
        toArray(
          lowStockResponse?.data ||
            lowStockResponse?.products ||
            lowStockResponse
        )
      );

      setMovements(
        toArray(
          movementResponse?.data ||
            movementResponse?.movements ||
            movementResponse
        )
      );

      setLastUpdated(new Date());

      return true;

    } catch (err) {
      console.error("Inventory loading error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load inventory.";

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
    loadInventory();
  }, []);


  // --------------------------------------------------
  // SILENT RELOAD + REPLAY ROW ANIMATION
  // used after a stock adjustment
  // --------------------------------------------------

  const reloadAndAnimate = async () => {
    await loadInventory({ silent: true });
    setRefreshKey((previous) => previous + 1);
  };


  // --------------------------------------------------
  // REFRESH (smooth + clearly visible)
  // --------------------------------------------------

  const handleRefresh = async () => {
    if (refreshing || loading) {
      return;
    }

    setRefreshing(true);

    try {
      // run the real reload AND a minimum delay together,
      // so the animation is always visible even if the API is instant
      const [ok] = await Promise.all([
        loadInventory({ silent: true }),
        wait(MIN_REFRESH_TIME),
      ]);

      // replay the row fade-in animation with the fresh data
      setRefreshKey((previous) => previous + 1);

      if (ok) {
        toast.success("Inventory refreshed successfully.", {
          toastId: "inventory-refreshed",
        });
      }
    } finally {
      // always runs, so the button can never get stuck on "Refreshing..."
      setRefreshing(false);
    }
  };


  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const totalStock = inventory.reduce(
    (sum, product) => sum + Number(product.quantity || 0),
    0
  );

  const outOfStock = inventory.filter(
    (product) => Number(product.quantity || 0) <= 0
  ).length;


  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------

  const openModal = () => {
    setError("");
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openProductAdjustment = (product) => {
    setError("");

    setForm({
      ...emptyForm,
      productId: product.id,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      setForm({ ...emptyForm });
      setError("");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // --------------------------------------------------
  // ADJUST STOCK
  // --------------------------------------------------

  const handleAdjust = async (event) => {
    event.preventDefault();

    if (!form.productId) {
      toast.error("Please select a product.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }

    // block Stock Out larger than available stock
    if (form.type === "OUT") {
      const selected = inventory.find(
        (product) => String(product.id) === String(form.productId)
      );

      const available = Number(selected?.quantity || 0);

      if (Number(form.quantity) > available) {
        toast.error(
          `Only ${available} unit(s) available. Stock out quantity is too high.`
        );
        return;
      }
    }

    try {
      setSaving(true);
      setError("");

      await adjustStock({
        productId: form.productId,
        quantity: Number(form.quantity),
        type: form.type,
        note: form.note.trim(),
      });

      toast.success("Stock adjusted successfully!");

      // close the modal directly (saving is still true here,
      // so closeModal() would refuse to run)
      setShowModal(false);
      setForm({ ...emptyForm });

      // silent reload -> no skeleton flash after adjusting
      await reloadAndAnimate();

    } catch (err) {
      console.error("Stock adjustment error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to adjust stock.";

      setError(message);
      toast.error(message);

    } finally {
      setSaving(false);
    }
  };


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <style>
        {`
          @keyframes inventoryPageFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .inventory-page-fade-in {
            animation: inventoryPageFadeIn 0.35s ease-out;
          }

          @keyframes inventoryProgress {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }

          .inventory-progress-bar {
            animation: inventoryProgress 1.1s ease-in-out infinite;
          }

          @keyframes inventoryRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .inventory-row-in {
            animation: inventoryRowIn 0.3s ease-out both;
          }

          @keyframes inventoryOverlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          .inventory-overlay-in {
            animation: inventoryOverlayIn 0.2s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .inventory-page-fade-in,
            .inventory-progress-bar,
            .inventory-row-in,
            .inventory-overlay-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="inventory-page-fade-in w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Inventory
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor and manage stock levels.
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

            {/* ADJUST STOCK */}
            <button
              type="button"
              onClick={openModal}
              className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Adjust Stock
            </button>

          </div>

        </div>

        {/* ERROR (hidden while the modal is open;
            the modal shows its own error) */}
        {error && !showModal && (
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
        <div
          className={`grid gap-4 transition-opacity duration-200 md:grid-cols-3 ${
            refreshing ? "opacity-70" : "opacity-100"
          }`}
        >

          <SummaryCard
            title="Total Stock"
            value={totalStock}
            icon={<Boxes className="h-5 w-5 text-blue-600" />}
          />

          <SummaryCard
            title="Low Stock"
            value={lowStock.length}
            warning
            icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          />

          <SummaryCard
            title="Out of Stock"
            value={outOfStock}
            danger
            icon={<XCircle className="h-5 w-5 text-red-600" />}
          />

        </div>

        {/* CURRENT INVENTORY */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOP PROGRESS BAR (while refreshing) */}
          {refreshing && (
            <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden bg-slate-100">
              <div className="inventory-progress-bar h-full w-1/4 rounded-full bg-slate-900" />
            </div>
          )}

          {/* FLOATING "REFRESHING" PILL (same as Products.jsx) */}
          {refreshing && (
            <div className="inventory-overlay-in pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-24 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
                <RefreshCw className="h-4 w-4 animate-spin text-slate-900" />
              </div>
            </div>
          )}

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-900">
              Current Inventory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current stock of all products.
            </p>
          </div>

          {/* SKELETON ONLY ON FIRST LOAD */}
          {loading ? (

            <InventoryTableSkeleton />

          ) : inventory.length === 0 ? (

            <div className="py-16 text-center">

              <Boxes className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="font-medium text-slate-700">
                No inventory records found.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Add products to start tracking stock.
              </p>

            </div>

          ) : (

            <div
              className={`overflow-x-auto transition-opacity duration-200 ${
                refreshing ? "opacity-70" : "opacity-100"
              }`}
            >

              <table className="w-full min-w-[850px] text-left text-sm">

                <InventoryTableHead />

                <tbody className="divide-y divide-slate-100">

                  {inventory.map((product, index) => {
                    const quantity = Number(product.quantity || 0);

                    const minimum = Number(product.minStock || 0);

                    const out = quantity <= 0;

                    const low = !out && quantity <= minimum;

                    return (
                      <tr
                        key={`${product.id}-${refreshKey}`}
                        className="inventory-row-in transition hover:bg-slate-50"
                        style={{
                          animationDelay: `${Math.min(index, 12) * 30}ms`,
                        }}
                      >

                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {product.name}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {product.sku || "-"}
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-900">
                          {quantity}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {minimum}
                        </td>

                        <td className="px-5 py-4">

                          {out ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              <XCircle className="h-3.5 w-3.5" />
                              Out of Stock
                            </span>
                          ) : low ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Healthy
                            </span>
                          )}

                        </td>

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() => openProductAdjustment(product)}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                          >
                            Adjust
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* STOCK MOVEMENTS */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOP PROGRESS BAR (while refreshing) */}
          {refreshing && (
            <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden bg-slate-100">
              <div className="inventory-progress-bar h-full w-1/4 rounded-full bg-slate-900" />
            </div>
          )}

          <div className="flex items-center gap-3 border-b border-slate-200 p-5">

            <History className="h-5 w-5 text-slate-500" />

            <div>
              <h2 className="font-bold text-slate-900">
                Stock Movement History
              </h2>

              <p className="text-sm text-slate-500">
                Recent inventory movements.
              </p>
            </div>

          </div>

          {loading ? (

            <MovementTableSkeleton />

          ) : movements.length === 0 ? (

            <div className="py-12 text-center">

              <History className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="font-medium text-slate-700">
                No stock movements found.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Adjust stock to see movements here.
              </p>

            </div>

          ) : (

            <div
              className={`overflow-x-auto transition-opacity duration-200 ${
                refreshing ? "opacity-70" : "opacity-100"
              }`}
            >

              <table className="w-full min-w-[800px] text-left text-sm">

                <MovementTableHead />

                <tbody className="divide-y divide-slate-100">

                  {movements.slice(0, 20).map((movement, index) => (
                    <tr
                      key={`${movement.id}-${refreshKey}`}
                      className="inventory-row-in transition hover:bg-slate-50"
                      style={{
                        animationDelay: `${Math.min(index, 12) * 30}ms`,
                      }}
                    >

                      <td className="px-5 py-4 font-medium text-slate-900">
                        {movement.product?.name ||
                          movement.productName ||
                          "-"}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            movement.type === "IN"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {movement.type}
                        </span>

                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {movement.quantity}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {movement.before ?? "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {movement.after ?? "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {movement.createdAt
                          ? new Date(movement.createdAt).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* ==================================================
            ADJUST STOCK MODAL
        ================================================== */}

        {showModal && (
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
                    Adjust Stock
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Update product stock quantity
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* FORM */}
              <form
                onSubmit={handleAdjust}
                className="min-h-0 flex-1 overflow-y-auto"
              >

                <div className="space-y-5 px-6 py-6">

                  {/* ERROR INSIDE MODAL */}
                  {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* PRODUCT */}
                  <div>
                    <label
                      htmlFor="inventory-productId"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Product
                    </label>

                    <select
                      id="inventory-productId"
                      name="productId"
                      value={form.productId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    >

                      <option value="">Select product</option>

                      {inventory.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} — Stock: {product.quantity}
                        </option>
                      ))}

                    </select>
                  </div>

                  {/* MOVEMENT TYPE */}
                  <div>
                    <label
                      htmlFor="inventory-type"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Movement Type
                    </label>

                    <select
                      id="inventory-type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    >

                      <option value="IN">Stock In</option>

                      <option value="OUT">Stock Out</option>

                    </select>
                  </div>

                  {/* QUANTITY */}
                  <div>
                    <label
                      htmlFor="inventory-quantity"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Quantity
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="inventory-quantity"
                      type="number"
                      name="quantity"
                      min="1"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                      placeholder="Enter quantity"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>

                  {/* NOTE */}
                  <div>
                    <label
                      htmlFor="inventory-note"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Note
                    </label>

                    <textarea
                      id="inventory-note"
                      name="note"
                      rows={4}
                      value={form.note}
                      onChange={handleChange}
                      placeholder="Reason for adjustment..."
                      className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
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

                    {saving ? "Saving..." : "Adjust Stock"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>
    </>
  );
};


// --------------------------------------------------
// SUMMARY CARD
// --------------------------------------------------

const SummaryCard = ({
  title,
  value,
  icon,
  warning,
  danger,
}) => {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        warning
          ? "border-amber-200 bg-amber-50"
          : danger
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <div className="mt-2 flex items-center justify-between">

        <p className="text-2xl font-bold text-slate-900">
          {Number(value || 0).toLocaleString("en-IN")}
        </p>

        {icon}

      </div>

    </div>
  );
};

export default Inventory;