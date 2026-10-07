import React, { useEffect, useState } from "react";

import {
  Boxes,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Plus,
  History,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getInventory,
  getLowStock,
  getStockMovements,
  adjustStock,
} from "../../services/inventoryService";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    type: "IN",
    note: "",
  });

  // --------------------------------------------------
  // LOAD INVENTORY
  // --------------------------------------------------

  const loadInventory = async () => {
    try {
      setLoading(true);
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
        inventoryResponse?.data ||
          inventoryResponse?.products ||
          inventoryResponse ||
          []
      );

      setLowStock(
        lowStockResponse?.data ||
          lowStockResponse?.products ||
          lowStockResponse ||
          []
      );

      setMovements(
        movementResponse?.data ||
          movementResponse?.movements ||
          movementResponse ||
          []
      );
    } catch (err) {
      console.error("Inventory loading error:", err);

      const message =
        err?.response?.data?.message ||
        "Failed to load inventory.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const totalStock = inventory.reduce(
    (sum, product) =>
      sum + Number(product.quantity || 0),
    0
  );

  const outOfStock = inventory.filter(
    (product) =>
      Number(product.quantity || 0) <= 0
  ).length;

  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------

  const openModal = () => {
    setError("");

    setForm({
      productId: "",
      quantity: "",
      type: "IN",
      note: "",
    });

    setShowModal(true);
  };

  const openProductAdjustment = (product) => {
    setError("");

    setForm({
      productId: product.id,
      quantity: "",
      type: "IN",
      note: "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      setError("");
    }
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

    try {
      setSaving(true);
      setError("");

      await adjustStock({
        productId: form.productId,
        quantity: Number(form.quantity),
        type: form.type,
        note: form.note,
      });

      toast.success("Stock adjusted successfully!");

      setShowModal(false);

      setForm({
        productId: "",
        quantity: "",
        type: "IN",
        note: "",
      });

      await loadInventory();
    } catch (err) {
      console.error("Stock adjustment error:", err);

      const message =
        err?.response?.data?.message ||
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
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      {/* PAGE HEADER */}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Inventory
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Monitor and manage stock levels.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button
            type="button"
            onClick={loadInventory}
            disabled={loading}
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              py-2.5
              text-xs
              font-medium
              text-slate-700
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:px-4
              sm:text-sm
            "
          >
            <RefreshCw
              className={`h-4 w-4 shrink-0 ${
                loading ? "animate-spin" : ""
              }`}
            />

            <span className="truncate">Refresh</span>
          </button>

          <button
            type="button"
            onClick={openModal}
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-slate-950
              px-3
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-slate-800
              sm:px-4
              sm:text-sm
            "
          >
            <Plus className="h-4 w-4 shrink-0" />

            <span className="truncate">Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-3
            text-xs
            leading-5
            text-red-700
            sm:p-4
            sm:text-sm
          "
        >
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total Stock"
          value={totalStock}
          icon={
            <Boxes className="h-5 w-5 text-blue-600" />
          }
        />

        <SummaryCard
          title="Low Stock"
          value={lowStock.length}
          warning
          icon={
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          }
        />

        <SummaryCard
          title="Out of Stock"
          value={outOfStock}
          danger
          icon={
            <XCircle className="h-5 w-5 text-red-600" />
          }
        />
      </div>

      {/* CURRENT INVENTORY */}
      <div
        className="
          min-w-0
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <h2 className="font-bold text-slate-900">
            Current Inventory
          </h2>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Current stock of all products.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-4 py-12 text-sm text-slate-500 sm:py-16">
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            Loading inventory...
          </div>
        ) : inventory.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-500 sm:py-16">
            No inventory records found.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    Product
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    SKU
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    Stock
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    Minimum
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    Status
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {inventory.map((product) => {
                  const quantity = Number(
                    product.quantity || 0
                  );

                  const minimum = Number(
                    product.minStock || 0
                  );

                  const out = quantity <= 0;

                  const low =
                    !out && quantity <= minimum;

                  return (
                    <tr
                      key={product.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="max-w-[260px] px-4 py-3 sm:px-5 sm:py-4">
                        <div className="truncate font-semibold text-slate-900">
                          {product.name}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-5 sm:py-4">
                        {product.sku || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900 sm:px-5 sm:py-4">
                        {quantity}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-5 sm:py-4">
                        {minimum}
                      </td>

                      <td className="px-4 py-3 sm:px-5 sm:py-4">
                        {out ? (
                          <span
                            className="
                              inline-flex
                              whitespace-nowrap
                              rounded-full
                              bg-red-100
                              px-2.5
                              py-1
                              text-[10px]
                              font-semibold
                              text-red-700
                              sm:px-3
                              sm:text-xs
                            "
                          >
                            Out of Stock
                          </span>
                        ) : low ? (
                          <span
                            className="
                              inline-flex
                              whitespace-nowrap
                              rounded-full
                              bg-amber-100
                              px-2.5
                              py-1
                              text-[10px]
                              font-semibold
                              text-amber-700
                              sm:px-3
                              sm:text-xs
                            "
                          >
                            Low Stock
                          </span>
                        ) : (
                          <span
                            className="
                              inline-flex
                              whitespace-nowrap
                              rounded-full
                              bg-emerald-100
                              px-2.5
                              py-1
                              text-[10px]
                              font-semibold
                              text-emerald-700
                              sm:px-3
                              sm:text-xs
                            "
                          >
                            Healthy
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 sm:px-5 sm:py-4">
                        <button
                          type="button"
                          onClick={() =>
                            openProductAdjustment(product)
                          }
                          className="
                            whitespace-nowrap
                            rounded-lg
                            bg-slate-100
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-slate-700
                            transition
                            hover:bg-slate-200
                          "
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
      <div
        className="
          min-w-0
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
            border-b
            border-slate-200
            p-4
            sm:items-center
            sm:p-5
          "
        >
          <History className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 sm:mt-0" />

          <div className="min-w-0">
            <h2 className="font-bold text-slate-900">
              Stock Movement History
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Recent inventory movements.
            </p>
          </div>
        </div>

        {movements.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500 sm:py-12">
            No stock movements found.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    Product
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    Type
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    Quantity
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    Before
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    After
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:py-4 sm:text-sm">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {movements.slice(0, 20).map((movement) => (
                  <tr
                    key={movement.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="max-w-[260px] px-4 py-3 sm:px-5 sm:py-4">
                      <div className="truncate font-medium text-slate-900">
                        {movement.product?.name ||
                          movement.productName ||
                          "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 sm:px-5 sm:py-4">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-2.5
                          py-1
                          text-[10px]
                          font-semibold
                          sm:px-3
                          sm:text-xs
                          ${
                            movement.type === "IN"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                      >
                        {movement.type}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900 sm:px-5 sm:py-4">
                      {movement.quantity}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-5 sm:py-4">
                      {movement.before ?? "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-5 sm:py-4">
                      {movement.after ?? "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 sm:px-5 sm:py-4">
                      {movement.createdAt
                        ? new Date(
                            movement.createdAt
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADJUST STOCK MODAL */}
      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-slate-950/50
            p-2
            backdrop-blur-[2px]
            sm:p-4
            lg:left-[var(--sidebar-width,0px)]
          "
        >
          {/* MODAL */}
          <div
            className="
              flex
              max-h-[calc(100vh-1rem)]
              w-full
              max-w-4xl
              flex-col
              overflow-hidden
              rounded-xl
              bg-white
              shadow-2xl
              ring-1
              ring-black/5
              sm:max-h-[calc(100vh-2rem)]
              sm:rounded-2xl
            "
          >
            {/* HEADER */}
            <div
              className="
                flex
                shrink-0
                items-start
                justify-between
                gap-4
                border-b
                border-slate-200
                bg-white
                px-4
                py-3
                sm:items-center
                sm:px-6
                sm:py-4
              "
            >
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  Adjust Stock
                </h2>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Update product stock quantity
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-slate-900
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleAdjust}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6">
                {/* PRODUCT */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Product
                  </label>

                  <select
                    value={form.productId}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        productId: event.target.value,
                      })
                    }
                    required
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      focus:border-slate-900
                      focus:ring-2
                      focus:ring-slate-900/10
                    "
                  >
                    <option value="">
                      Select product
                    </option>

                    {inventory.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} — Stock:{" "}
                        {product.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MOVEMENT TYPE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Movement Type
                  </label>

                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type: event.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      focus:border-slate-900
                      focus:ring-2
                      focus:ring-slate-900/10
                    "
                  >
                    <option value="IN">
                      Stock In
                    </option>

                    <option value="OUT">
                      Stock Out
                    </option>
                  </select>
                </div>

                {/* QUANTITY */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        quantity: event.target.value,
                      })
                    }
                    required
                    placeholder="Enter quantity"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      focus:border-slate-900
                      focus:ring-2
                      focus:ring-slate-900/10
                    "
                  />
                </div>

                {/* NOTE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Note
                  </label>

                  <textarea
                    rows={4}
                    value={form.note}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        note: event.target.value,
                      })
                    }
                    placeholder="Reason for adjustment..."
                    className="
                      w-full
                      resize-none
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      focus:border-slate-900
                      focus:ring-2
                      focus:ring-slate-900/10
                    "
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700 sm:text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div
                className="
                  sticky
                  bottom-0
                  flex
                  shrink-0
                  flex-col-reverse
                  gap-2
                  border-t
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-end
                  sm:gap-3
                  sm:px-6
                  sm:py-4
                "
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-slate-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    sm:w-auto
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    w-full
                    rounded-lg
                    bg-slate-950
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-slate-800
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    sm:w-auto
                  "
                >
                  {saving
                    ? "Saving..."
                    : "Adjust Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
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
      className={`min-w-0 rounded-2xl border p-4 shadow-sm sm:p-5 ${
        warning
          ? "border-amber-200 bg-amber-50"
          : danger
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="truncate text-sm text-slate-500">
        {title}
      </p>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
          {Number(value || 0).toLocaleString("en-IN")}
        </p>

        <div className="shrink-0">{icon}</div>
      </div>
    </div>
  );
};

export default Inventory;