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
    <div className="w-full space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage stock levels.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={loadInventory}
            disabled={loading}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-slate-700
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={openModal}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-slate-950
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-slate-800
            "
          >
            <Plus className="h-4 w-4" />

            Adjust Stock
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
            p-4
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-3">

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
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">
            Current Inventory
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current stock of all products.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            Loading inventory...
          </div>
        ) : inventory.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            No inventory records found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-left text-sm">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>

                  <th className="px-5 py-4">
                    Product
                  </th>

                  <th className="px-5 py-4">
                    SKU
                  </th>

                  <th className="px-5 py-4">
                    Stock
                  </th>

                  <th className="px-5 py-4">
                    Minimum
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
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
                          <span
                            className="
                              rounded-full
                              bg-red-100
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              text-red-700
                            "
                          >
                            Out of Stock
                          </span>
                        ) : low ? (
                          <span
                            className="
                              rounded-full
                              bg-amber-100
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              text-amber-700
                            "
                          >
                            Low Stock
                          </span>
                        ) : (
                          <span
                            className="
                              rounded-full
                              bg-emerald-100
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              text-emerald-700
                            "
                          >
                            Healthy
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            openProductAdjustment(product)
                          }
                          className="
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
            items-center
            gap-3
            border-b
            border-slate-200
            p-5
          "
        >

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

        {movements.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No stock movements found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px] text-left text-sm">

              <thead className="bg-slate-50">
                <tr>

                  <th className="px-5 py-4">
                    Product
                  </th>

                  <th className="px-5 py-4">
                    Type
                  </th>

                  <th className="px-5 py-4">
                    Quantity
                  </th>

                  <th className="px-5 py-4">
                    Before
                  </th>

                  <th className="px-5 py-4">
                    After
                  </th>

                  <th className="px-5 py-4">
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

      {/* ==================================================
          ADJUST STOCK MODAL
          SAME SIZE / STRUCTURE AS PRODUCTS MODAL
         ================================================== */}

      {showModal && (
        <div
          className="
            fixed
            bottom-0
            right-0
            top-16
            z-[200]
            flex
            items-center
            justify-center
            bg-slate-950/50
            p-4
            sm:p-6
            backdrop-blur-[2px]
            transition-[left]
            duration-300
            ease-in-out
          "
          style={{
            left: "var(--sidebar-width, 0px)",
          }}
        >

          {/* MODAL */}
          <div
            className="
              flex
              max-h-[calc(100vh-112px)]
              w-full
              max-w-4xl
              flex-col
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
              ring-1
              ring-black/5
            "
          >

            {/* HEADER */}
            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-slate-200
                bg-white
                px-6
                py-4
              "
            >

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
                className="
                  rounded-lg
                  p-2
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-slate-900
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
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

              </div>

              {/* FOOTER */}
              <div
                className="
                  sticky
                  bottom-0
                  flex
                  shrink-0
                  items-center
                  justify-end
                  gap-3
                  border-t
                  border-slate-200
                  bg-white
                  px-6
                  py-4
                "
              >

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="
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
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
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