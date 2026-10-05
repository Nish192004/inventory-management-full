import React, { useEffect, useMemo, useState } from "react";

import {
  ShoppingCart,
  Search,
  RefreshCw,
  Plus,
  Eye,
  X,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  Building2,
  CalendarDays,
  IndianRupee,
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
// EMPTY FORM
// ============================================================

const emptyForm = {
  orderNumber: "",
  supplierId: "",
};


// ============================================================
// EMPTY ITEM
// ============================================================

const emptyItem = {
  productId: "",
  quantity: 1,
  costPrice: "",
};


// ============================================================
// PURCHASES
// ============================================================

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);

  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [items, setItems] = useState([
    {
      ...emptyItem,
    },
  ]);


  // ==========================================================
  // LOAD PURCHASES
  // ==========================================================

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPurchases();

      const purchaseData =
        response?.data ||
        response?.purchases ||
        response ||
        [];

      setPurchases(
        Array.isArray(purchaseData)
          ? purchaseData
          : []
      );
    } catch (err) {
      console.error("Load purchases error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load purchases.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // LOAD PRODUCTS
  // ==========================================================

  const loadProducts = async () => {
    try {
      const response = await getProducts();

      const productData =
        response?.data ||
        response?.products ||
        response ||
        [];

      setProducts(
        Array.isArray(productData)
          ? productData
          : []
      );
    } catch (err) {
      console.error("Load products error:", err);
      setProducts([]);
    }
  };


  // ==========================================================
  // LOAD SUPPLIERS
  // ==========================================================

  const loadSuppliers = async () => {
    try {
      const response = await getSuppliers();

      const supplierData =
        response?.data ||
        response?.suppliers ||
        response ||
        [];

      setSuppliers(
        Array.isArray(supplierData)
          ? supplierData
          : []
      );
    } catch (err) {
      console.error("Load suppliers error:", err);
      setSuppliers([]);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadPurchases();
    loadProducts();
    loadSuppliers();
  }, []);


  // ==========================================================
  // FILTER PURCHASES
  // ==========================================================

  const filteredPurchases = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    if (!value) {
      return purchases;
    }

    return purchases.filter((purchase) => {
      const orderNumber =
        purchase.orderNumber
          ?.toLowerCase() || "";

      const supplierName =
        purchase.supplier?.name
          ?.toLowerCase() || "";

      const status =
        purchase.status
          ?.toLowerCase() || "";

      return (
        orderNumber.includes(value) ||
        supplierName.includes(value) ||
        status.includes(value)
      );
    });
  }, [purchases, search]);


  // ==========================================================
  // OPEN CREATE
  // ==========================================================

  const openCreate = () => {
    setForm({
      ...emptyForm,
    });

    setItems([
      {
        ...emptyItem,
      },
    ]);

    setSelectedPurchase(null);
    setError("");

    setModal("create");
  };


  // ==========================================================
  // OPEN VIEW
  // ==========================================================

  const openView = async (purchase) => {
    try {
      setError("");

      const response =
        await getPurchaseById(purchase.id);

      const purchaseData =
        response?.data ||
        response?.purchase ||
        response ||
        purchase;

      setSelectedPurchase(purchaseData);

      setModal("view");
    } catch (err) {
      console.error("Get purchase error:", err);

      setSelectedPurchase(purchase);

      setModal("view");
    }
  };


  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModal(null);

    setSelectedPurchase(null);

    setForm({
      ...emptyForm,
    });

    setItems([
      {
        ...emptyItem,
      },
    ]);

    setError("");
  };


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================================
  // ADD ITEM
  // ==========================================================

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      {
        ...emptyItem,
      },
    ]);
  };


  // ==========================================================
  // REMOVE ITEM
  // ==========================================================

  const removeItem = (index) => {
    if (items.length === 1) {
      toast.error(
        "At least one product is required."
      );

      return;
    }

    setItems((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };


  // ==========================================================
  // UPDATE ITEM
  // ==========================================================

  const updateItem = (
    index,
    field,
    value
  ) => {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };


  // ==========================================================
  // PRODUCT CHANGE
  // ==========================================================

  const handleProductChange = (
    index,
    productId
  ) => {
    const selectedProduct =
      products.find(
        (product) =>
          String(product.id) ===
          String(productId)
      );

    setItems((previous) =>
      previous.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          productId,
          costPrice:
            selectedProduct?.costPrice ??
            item.costPrice ??
            "",
        };
      })
    );
  };


  // ==========================================================
  // ITEM TOTAL
  // ==========================================================

  const getItemTotal = (item) => {
    return (
      Number(item.quantity || 0) *
      Number(item.costPrice || 0)
    );
  };


  // ==========================================================
  // GRAND TOTAL
  // ==========================================================

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + getItemTotal(item),
      0
    );
  }, [items]);


  // ==========================================================
  // CREATE PURCHASE
  // ==========================================================

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.orderNumber.trim()) {
      toast.error(
        "Order number is required."
      );

      return;
    }

    if (!form.supplierId) {
      toast.error(
        "Please select a supplier."
      );

      return;
    }

    if (!items.length) {
      toast.error(
        "Please add at least one product."
      );

      return;
    }

    for (const item of items) {
      if (!item.productId) {
        toast.error(
          "Please select a product for every item."
        );

        return;
      }

      if (
        Number(item.quantity) <= 0
      ) {
        toast.error(
          "Quantity must be greater than zero."
        );

        return;
      }

      if (
        Number(item.costPrice) < 0
      ) {
        toast.error(
          "Cost price cannot be negative."
        );

        return;
      }
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        orderNumber:
          form.orderNumber.trim(),

        supplierId:
          Number(form.supplierId),

        total: Number(total.toFixed(2)),

        items: items.map((item) => ({
          productId:
            Number(item.productId),

          quantity:
            Number(item.quantity),

          costPrice:
            Number(item.costPrice),

          total:
            Number(
              getItemTotal(item).toFixed(2)
            ),
        })),
      };

      await createPurchase(payload);

      toast.success(
        "Purchase created successfully!"
      );

      closeModal();

      await loadPurchases();
    } catch (err) {
      console.error(
        "Create purchase error:",
        err
      );

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


  // ==========================================================
  // RECEIVE PURCHASE
  // ==========================================================

  const handleReceive = async (
    purchase
  ) => {
    if (
      !window.confirm(
        `Receive purchase "${purchase.orderNumber}"?`
      )
    ) {
      return;
    }

    try {
      await receivePurchase(
        purchase.id
      );

      toast.success(
        "Purchase received successfully!"
      );

      await loadPurchases();
    } catch (err) {
      console.error(
        "Receive purchase error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to receive purchase.";

      toast.error(message);
    }
  };


  // ==========================================================
  // CANCEL PURCHASE
  // ==========================================================

  const handleCancel = async (
    purchase
  ) => {
    if (
      !window.confirm(
        `Cancel purchase "${purchase.orderNumber}"?`
      )
    ) {
      return;
    }

    try {
      await cancelPurchase(
        purchase.id
      );

      toast.success(
        "Purchase cancelled successfully!"
      );

      await loadPurchases();
    } catch (err) {
      console.error(
        "Cancel purchase error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to cancel purchase.";

      toast.error(message);
    }
  };


  // ==========================================================
  // DELETE PURCHASE
  // ==========================================================

  const handleDelete = async (
    purchase
  ) => {
    if (
      !window.confirm(
        `Delete purchase "${purchase.orderNumber}"?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deletePurchase(
        purchase.id
      );

      toast.success(
        "Purchase deleted successfully!"
      );

      await loadPurchases();
    } catch (err) {
      console.error(
        "Delete purchase error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to delete purchase.";

      toast.error(message);
    }
  };


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    await loadPurchases();

    toast.success(
      "Purchases refreshed successfully."
    );
  };


  // ==========================================================
  // STATUS STYLE
  // ==========================================================

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


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="w-full space-y-6">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <ShoppingCart className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Purchases
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage purchase orders and supplier purchases.
            </p>
          </div>

        </div>


        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={handleRefresh}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-slate-300
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
            "
          >
            <RefreshCw className="h-4 w-4" />

            Refresh
          </button>


          <button
            type="button"
            onClick={openCreate}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-slate-950
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-slate-800
            "
          >
            <Plus className="h-4 w-4" />

            Add Purchase
          </button>

        </div>

      </div>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="relative max-w-md">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search order, supplier or status..."
            className="
              w-full
              rounded-lg
              border
              border-slate-300
              bg-white
              py-2.5
              pl-10
              pr-4
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-slate-500
              focus:ring-2
              focus:ring-slate-200
            "
          />

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <span>{error}</span>

        </div>
      )}


      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex items-center gap-3 text-sm text-slate-500">

              <RefreshCw className="h-5 w-5 animate-spin" />

              Loading purchases...

            </div>

          </div>
        ) : filteredPurchases.length === 0 ? (

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

              <ShoppingCart className="h-6 w-6 text-slate-400" />

            </div>

            <h3 className="text-base font-semibold text-slate-900">
              No purchases found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first purchase order to get started.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order Number
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Supplier
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Items
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredPurchases.map(
                  (purchase) => (

                    <tr
                      key={purchase.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* ORDER */}

                      <td className="px-5 py-4">

                        <div className="font-semibold text-slate-900">
                          {purchase.orderNumber || "-"}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          ID #{purchase.id}
                        </div>

                      </td>


                      {/* SUPPLIER */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">

                            <Building2 className="h-4 w-4 text-slate-600" />

                          </div>

                          <div>

                            <div className="font-medium text-slate-800">
                              {purchase.supplier?.name ||
                                "Unknown Supplier"}
                            </div>

                            {purchase.supplier?.email && (
                              <div className="text-xs text-slate-400">
                                {purchase.supplier.email}
                              </div>
                            )}

                          </div>

                        </div>

                      </td>


                      {/* ITEMS */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-700">

                          <Package className="h-4 w-4 text-slate-400" />

                          {purchase.items?.length || 0}

                          <span className="text-slate-400">
                            product(s)
                          </span>

                        </div>

                      </td>


                      {/* TOTAL */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-1 font-bold text-slate-900">

                          <IndianRupee className="h-4 w-4" />

                          {Number(
                            purchase.total || 0
                          ).toLocaleString("en-IN")}

                        </div>

                      </td>


                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            purchase.status
                          )}`}
                        >
                          {purchase.status ||
                            "PENDING"}
                        </span>

                      </td>


                      {/* DATE */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-500">

                          <CalendarDays className="h-4 w-4" />

                          {purchase.createdAt
                            ? new Date(
                                purchase.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}

                        </div>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              openView(purchase)
                            }
                            title="View purchase"
                            className="
                              rounded-lg
                              p-2
                              text-slate-500
                              transition
                              hover:bg-slate-100
                              hover:text-slate-900
                            "
                          >
                            <Eye className="h-4 w-4" />
                          </button>


                          {purchase.status ===
                            "PENDING" && (
                            <>

                              <button
                                type="button"
                                onClick={() =>
                                  handleReceive(
                                    purchase
                                  )
                                }
                                title="Receive purchase"
                                className="
                                  rounded-lg
                                  p-2
                                  text-emerald-600
                                  transition
                                  hover:bg-emerald-50
                                "
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  handleCancel(
                                    purchase
                                  )
                                }
                                title="Cancel purchase"
                                className="
                                  rounded-lg
                                  p-2
                                  text-amber-600
                                  transition
                                  hover:bg-amber-50
                                "
                              >
                                <XCircle className="h-4 w-4" />
                              </button>

                            </>
                          )}


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                purchase
                              )
                            }
                            title="Delete purchase"
                            className="
                              rounded-lg
                              p-2
                              text-red-500
                              transition
                              hover:bg-red-50
                            "
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ======================================================
          CREATE PURCHASE MODAL
          EXACT SAME SIZE STYLE AS PRODUCT ADD MODAL
      ====================================================== */}

      {modal === "create" && (

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
            left:
              "var(--sidebar-width, 0px)",
          }}
        >

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

            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
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


            {/* BODY */}

            <form
              onSubmit={handleCreate}
              className="min-h-0 flex-1 overflow-y-auto"
            >

              <div className="space-y-6 px-6 py-6">

                {/* BASIC INFORMATION */}

                <div>

                  <div className="mb-4">

                    <h3 className="text-sm font-bold text-slate-900">
                      Purchase Information
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Enter the basic purchase order details.
                    </p>

                  </div>


                  <div className="grid gap-5 sm:grid-cols-2">

                    {/* ORDER NUMBER */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Order Number
                      </label>

                      <input
                        type="text"
                        name="orderNumber"
                        value={form.orderNumber}
                        onChange={handleFormChange}
                        placeholder="e.g. PO-1001"
                        className="
                          w-full
                          rounded-lg
                          border
                          border-slate-300
                          bg-white
                          px-3.5
                          py-2.5
                          text-sm
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-slate-500
                          focus:ring-2
                          focus:ring-slate-200
                        "
                      />

                    </div>


                    {/* SUPPLIER */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Supplier
                      </label>

                      <select
                        name="supplierId"
                        value={form.supplierId}
                        onChange={handleFormChange}
                        className="
                          w-full
                          rounded-lg
                          border
                          border-slate-300
                          bg-white
                          px-3.5
                          py-2.5
                          text-sm
                          text-slate-900
                          outline-none
                          transition
                          focus:border-slate-500
                          focus:ring-2
                          focus:ring-slate-200
                        "
                      >

                        <option value="">
                          Select Supplier
                        </option>

                        {suppliers.map(
                          (supplier) => (
                            <option
                              key={supplier.id}
                              value={supplier.id}
                            >
                              {supplier.name}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                  </div>

                </div>


                {/* ITEMS */}

                <div>

                  <div className="mb-4 flex items-center justify-between">

                    <div>

                      <h3 className="text-sm font-bold text-slate-900">
                        Purchase Items
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Add products and purchase quantities.
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={addItem}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        bg-slate-950
                        px-3.5
                        py-2
                        text-xs
                        font-semibold
                        text-white
                        transition
                        hover:bg-slate-800
                      "
                    >
                      <Plus className="h-4 w-4" />

                      Add Item
                    </button>

                  </div>


                  <div className="space-y-4">

                    {items.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            p-4
                          "
                        >

                          <div className="mb-4 flex items-center justify-between">

                            <div className="flex items-center gap-2">

                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">

                                <Package className="h-4 w-4" />

                              </div>

                              <span className="text-sm font-semibold text-slate-800">
                                Item {index + 1}
                              </span>

                            </div>


                            {items.length > 1 && (

                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(index)
                                }
                                className="
                                  rounded-lg
                                  p-2
                                  text-red-500
                                  transition
                                  hover:bg-red-50
                                "
                                title="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            )}

                          </div>


                          <div className="grid gap-4 md:grid-cols-3">

                            {/* PRODUCT */}

                            <div className="md:col-span-1">

                              <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Product
                              </label>

                              <select
                                value={item.productId}
                                onChange={(event) =>
                                  handleProductChange(
                                    index,
                                    event.target.value
                                  )
                                }
                                className="
                                  w-full
                                  rounded-lg
                                  border
                                  border-slate-300
                                  bg-white
                                  px-3
                                  py-2.5
                                  text-sm
                                  text-slate-900
                                  outline-none
                                  focus:border-slate-500
                                  focus:ring-2
                                  focus:ring-slate-200
                                "
                              >

                                <option value="">
                                  Select Product
                                </option>

                                {products.map(
                                  (product) => (
                                    <option
                                      key={product.id}
                                      value={product.id}
                                    >
                                      {product.name}
                                      {product.sku
                                        ? ` (${product.sku})`
                                        : ""}
                                    </option>
                                  )
                                )}

                              </select>

                            </div>


                            {/* QUANTITY */}

                            <div>

                              <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Quantity
                              </label>

                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(event) =>
                                  updateItem(
                                    index,
                                    "quantity",
                                    event.target.value
                                  )
                                }
                                className="
                                  w-full
                                  rounded-lg
                                  border
                                  border-slate-300
                                  bg-white
                                  px-3
                                  py-2.5
                                  text-sm
                                  text-slate-900
                                  outline-none
                                  focus:border-slate-500
                                  focus:ring-2
                                  focus:ring-slate-200
                                "
                              />

                            </div>


                            {/* COST PRICE */}

                            <div>

                              <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Cost Price
                              </label>

                              <div className="relative">

                                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.costPrice}
                                  onChange={(event) =>
                                    updateItem(
                                      index,
                                      "costPrice",
                                      event.target.value
                                    )
                                  }
                                  placeholder="0.00"
                                  className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-300
                                    bg-white
                                    py-2.5
                                    pl-9
                                    pr-3
                                    text-sm
                                    text-slate-900
                                    outline-none
                                    focus:border-slate-500
                                    focus:ring-2
                                    focus:ring-slate-200
                                  "
                                />

                              </div>

                            </div>

                          </div>


                          {/* ITEM TOTAL */}

                          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">

                            <span className="text-xs font-medium text-slate-500">
                              Item Total
                            </span>

                            <span className="text-sm font-bold text-slate-900">
                              ₹
                              {getItemTotal(
                                item
                              ).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>


                {/* TOTAL */}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm font-medium text-slate-500">
                        Purchase Total
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Total value of all purchase items
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-2xl font-bold text-slate-950">
                        ₹
                        {total.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                    </div>

                  </div>

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
                    hover:bg-slate-50
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
                    shadow-sm
                    transition
                    hover:bg-slate-800
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving
                    ? "Creating..."
                    : "Create Purchase"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          VIEW PURCHASE MODAL
      ====================================================== */}

      {modal === "view" &&
        selectedPurchase && (

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
              left:
                "var(--sidebar-width, 0px)",
            }}
          >

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

              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Purchase Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    View purchase order information and items.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={closeModal}
                  className="
                    rounded-lg
                    p-2
                    text-slate-500
                    transition
                    hover:bg-slate-100
                    hover:text-slate-900
                  "
                >
                  <X className="h-5 w-5" />
                </button>

              </div>


              {/* BODY */}

              <div className="min-h-0 flex-1 overflow-y-auto">

                <div className="space-y-6 px-6 py-6">

                  {/* BASIC INFORMATION */}

                  <div>

                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                      Purchase Information
                    </h3>


                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                        <p className="text-xs font-medium text-slate-500">
                          Order Number
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedPurchase.orderNumber ||
                            "-"}
                        </p>

                      </div>


                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                        <p className="text-xs font-medium text-slate-500">
                          Supplier
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedPurchase.supplier?.name ||
                            "-"}
                        </p>

                      </div>


                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                        <p className="text-xs font-medium text-slate-500">
                          Status
                        </p>

                        <div className="mt-2">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              selectedPurchase.status
                            )}`}
                          >
                            {selectedPurchase.status ||
                              "PENDING"}
                          </span>

                        </div>

                      </div>


                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                        <p className="text-xs font-medium text-slate-500">
                          Total
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          ₹
                          {Number(
                            selectedPurchase.total ||
                              0
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* DATES */}

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">

                        <CalendarDays className="h-5 w-5 text-slate-600" />

                      </div>

                      <div>

                        <p className="text-xs text-slate-500">
                          Created
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {selectedPurchase.createdAt
                            ? new Date(
                                selectedPurchase.createdAt
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}
                        </p>

                      </div>

                    </div>


                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">

                        <RefreshCw className="h-5 w-5 text-slate-600" />

                      </div>

                      <div>

                        <p className="text-xs text-slate-500">
                          Last Updated
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {selectedPurchase.updatedAt
                            ? new Date(
                                selectedPurchase.updatedAt
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* ITEMS */}

                  <div>

                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                      Purchase Items
                    </h3>


                    {selectedPurchase.items?.length ? (

                      <div className="overflow-hidden rounded-xl border border-slate-200">

                        <div className="overflow-x-auto">

                          <table className="min-w-full">

                            <thead className="bg-slate-50">

                              <tr>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Product
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  SKU
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Quantity
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Cost Price
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Total
                                </th>

                              </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100">

                              {selectedPurchase.items.map(
                                (item, index) => (

                                  <tr
                                    key={
                                      item.id ||
                                      index
                                    }
                                  >

                                    <td className="px-4 py-4">

                                      <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">

                                          <Package className="h-4 w-4 text-slate-600" />

                                        </div>

                                        <span className="font-medium text-slate-900">
                                          {item.product?.name ||
                                            "Unknown Product"}
                                        </span>

                                      </div>

                                    </td>


                                    <td className="px-4 py-4 text-sm text-slate-500">

                                      {item.product?.sku ||
                                        "-"}

                                    </td>


                                    <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">

                                      {item.quantity || 0}

                                    </td>


                                    <td className="px-4 py-4 text-right text-sm text-slate-700">

                                      ₹
                                      {Number(
                                        item.costPrice ||
                                          0
                                      ).toLocaleString(
                                        "en-IN",
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )}

                                    </td>


                                    <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">

                                      ₹
                                      {Number(
                                        item.total ||
                                          Number(
                                            item.quantity ||
                                              0
                                          ) *
                                            Number(
                                              item.costPrice ||
                                                0
                                            )
                                      ).toLocaleString(
                                        "en-IN",
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )}

                                    </td>

                                  </tr>

                                )
                              )}

                            </tbody>

                          </table>

                        </div>

                      </div>

                    ) : (

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">

                        <Package className="mx-auto h-8 w-8 text-slate-400" />

                        <p className="mt-2 text-sm text-slate-500">
                          No purchase items found.
                        </p>

                      </div>

                    )}

                  </div>


                  {/* TOTAL */}

                  <div className="flex items-center justify-end border-t border-slate-200 pt-5">

                    <div className="text-right">

                      <p className="text-sm text-slate-500">
                        Purchase Total
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        ₹
                        {Number(
                          selectedPurchase.total ||
                            0
                        ).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                    </div>

                  </div>

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
                  "
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
};

export default Purchases;