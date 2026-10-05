import React, { useEffect, useState } from "react";

import {
  RefreshCw,
  ShoppingCart,
  Search,
  Plus,
  Eye,
  X,
  Trash2,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getSales,
  getSaleById,
  createSale,
} from "../../services/saleService";

import { getProducts } from "../../services/productService";
import { getCustomers } from "../../services/customerService";

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

const Sales = () => {
  const [sales, setSales] = useState([]);

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  const [form, setForm] = useState(emptySale);

  const [items, setItems] = useState([
    {
      ...emptyItem,
    },
  ]);

  // ==================================================
  // LOAD SALES
  // ==================================================

  const loadSales = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSales();

      setSales(
        response?.data ||
          response?.sales ||
          response ||
          []
      );
    } catch (err) {
      console.error("Sales loading error:", err);

      const message =
        err?.response?.data?.message ||
        "Failed to load sales.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
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
        productResponse?.data ||
          productResponse?.products ||
          productResponse ||
          []
      );

      setCustomers(
        customerResponse?.data ||
          customerResponse?.customers ||
          customerResponse ||
          []
      );
    } catch (err) {
      console.error(
        "Sales form data loading error:",
        err
      );
    }
  };

  useEffect(() => {
    loadSales();
    loadFormData();
  }, []);

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredSales = sales.filter((sale) => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return true;
    }

    return (
      sale.invoiceNumber
        ?.toLowerCase()
        .includes(value) ||
      sale.customer?.name
        ?.toLowerCase()
        .includes(value) ||
      sale.customerName
        ?.toLowerCase()
        .includes(value) ||
      String(sale.id)
        .toLowerCase()
        .includes(value)
    );
  });

  // ==================================================
  // CREATE MODAL
  // ==================================================

  const openCreate = () => {
    setError("");

    setForm({
      ...emptySale,
    });

    setItems([
      {
        ...emptyItem,
      },
    ]);

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
    setItems((previous) => [
      ...previous,
      {
        ...emptyItem,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems((previous) =>
      previous.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const updateItem = (index, field, value) => {
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
      (item) =>
        String(item.id) === String(customerId)
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
        toast.error(
          "Product quantity must be greater than 0."
        );
        return;
      }

      if (
        item.price === "" ||
        item.price === null ||
        Number(item.price) < 0
      ) {
        toast.error(
          "Product price must be a valid amount."
        );
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

        customerName:
          form.customerName || null,

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

      setForm({
        ...emptySale,
      });

      setItems([
        {
          ...emptyItem,
        },
      ]);

      await loadSales();
    } catch (err) {
      console.error("Create sale error:", err);

      const message =
        err?.response?.data?.message ||
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
    <div className="w-full space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sales
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage sales and invoices.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={loadSales}
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
            onClick={openCreate}
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

            Create Sale
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

      {/* SEARCH */}
      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
        "
      >
        <div className="relative">

          <Search
            className="
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="
              w-full
              rounded-lg
              border
              border-slate-200
              py-2.5
              pl-10
              pr-4
              text-sm
              outline-none
              transition
              focus:border-slate-900
              focus:ring-2
              focus:ring-slate-900/10
            "
          />

        </div>
      </div>

      {/* SALES TABLE */}
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

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">

            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />

            Loading sales...

          </div>
        ) : filteredSales.length === 0 ? (
          <div className="py-16 text-center text-slate-500">

            <ShoppingCart
              className="
                mx-auto
                mb-3
                h-10
                w-10
                text-slate-300
              "
            />

            <p>No sales found.</p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px] text-left text-sm">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4">
                    Invoice
                  </th>

                  <th className="px-5 py-4">
                    Customer
                  </th>

                  <th className="px-5 py-4">
                    Items
                  </th>

                  <th className="px-5 py-4">
                    Total
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="
                      transition
                      hover:bg-slate-50
                    "
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
                        className={`
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${
                            sale.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : sale.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : sale.status === "REFUNDED"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-emerald-100 text-emerald-700"
                          }
                        `}
                      >
                        {sale.status || "COMPLETED"}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {sale.createdAt
                        ? new Date(
                            sale.createdAt
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            openView(sale)
                          }
                          className="
                            rounded-lg
                            p-2
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            hover:text-slate-900
                          "
                          title="View Sale"
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
                className="
                  rounded-lg
                  p-2
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-slate-900
                  disabled:opacity-50
                "
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* BODY */}
            <form
              onSubmit={handleCreate}
              className="
                min-h-0
                flex-1
                overflow-y-auto
              "
            >

              <div className="space-y-6 px-6 py-6">

                {/* CUSTOMER */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Customer
                  </label>

                  <select
                    value={form.customerId}
                    onChange={(event) =>
                      handleCustomerChange(
                        event.target.value
                      )
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

                    <option value="">
                      Walk-in Customer
                    </option>

                    {customers.map((customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name}
                        {customer.phone
                          ? ` — ${customer.phone}`
                          : ""}
                      </option>
                    ))}

                  </select>

                </div>

                {/* CUSTOMER NAME FOR WALK-IN */}
                {!form.customerId && (
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Customer Name
                    </label>

                    <input
                      value={form.customerName}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          customerName:
                            event.target.value,
                        })
                      }
                      placeholder="Walk-in Customer"
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
                )}

                {/* ITEMS */}
                <div>

                  <div
                    className="
                      mb-3
                      flex
                      items-center
                      justify-between
                    "
                  >

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
                      className="
                        flex
                        items-center
                        gap-1.5
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
                      <Plus className="h-3.5 w-3.5" />

                      Add Item
                    </button>

                  </div>

                  <div className="space-y-3">

                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50/50
                          p-4
                        "
                      >

                        <div
                          className="
                            grid
                            gap-4
                            md:grid-cols-[1fr_140px_170px_auto]
                          "
                        >

                          {/* PRODUCT */}
                          <div>

                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
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
                              required
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
                                focus:border-slate-900
                                focus:ring-2
                                focus:ring-slate-900/10
                              "
                            >

                              <option value="">
                                Select product
                              </option>

                              {products.map((product) => (
                                <option
                                  key={product.id}
                                  value={product.id}
                                >
                                  {product.name} — Stock:{" "}
                                  {product.quantity ??
                                    0}
                                </option>
                              ))}

                            </select>

                          </div>

                          {/* QUANTITY */}
                          <div>

                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
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
                              required
                              className="
                                w-full
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                outline-none
                                focus:border-slate-900
                                focus:ring-2
                                focus:ring-slate-900/10
                              "
                            />

                          </div>

                          {/* PRICE */}
                          <div>

                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Selling Price
                            </label>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "price",
                                  event.target.value
                                )
                              }
                              required
                              placeholder="0.00"
                              className="
                                w-full
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                outline-none
                                focus:border-slate-900
                                focus:ring-2
                                focus:ring-slate-900/10
                              "
                            />

                          </div>

                          {/* REMOVE */}
                          <div className="flex items-end">

                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(index)
                                }
                                className="
                                  rounded-lg
                                  p-2.5
                                  text-red-600
                                  transition
                                  hover:bg-red-50
                                "
                                title="Remove item"
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

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tax
                    </label>

                    <input
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
                      className="
                        w-full
                        rounded-lg
                        border
                        border-slate-300
                        bg-white
                        px-4
                        py-3
                        text-sm
                        outline-none
                        focus:border-slate-900
                        focus:ring-2
                        focus:ring-slate-900/10
                      "
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Discount
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.discount}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          discount:
                            event.target.value,
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
                        outline-none
                        focus:border-slate-900
                        focus:ring-2
                        focus:ring-slate-900/10
                      "
                    />

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
                    hover:bg-slate-100
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
                    ? "Creating..."
                    : "Create Sale"}
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
                  Sale Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  View invoice and sale information.
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

                {/* SALE INFORMATION */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <Info
                    label="Invoice"
                    value={
                      selectedSale.invoiceNumber
                    }
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
                    value={
                      selectedSale.status ||
                      "COMPLETED"
                    }
                  />

                  <Info
                    label="Date"
                    value={
                      selectedSale.createdAt
                        ? new Date(
                            selectedSale.createdAt
                          ).toLocaleString("en-IN")
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

                          <th className="px-4 py-3">
                            Product
                          </th>

                          <th className="px-4 py-3">
                            Quantity
                          </th>

                          <th className="px-4 py-3">
                            Price
                          </th>

                          <th className="px-4 py-3 text-right">
                            Total
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {(
                          selectedSale.items ||
                          selectedSale.saleItems ||
                          []
                        ).map((item, index) => (

                          <tr
                            key={
                              item.id || index
                            }
                          >

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
                              {Number(
                                item.price || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td className="px-4 py-3 text-right font-semibold text-slate-900">
                              ₹
                              {Number(
                                item.total ||
                                  Number(
                                    item.quantity || 0
                                  ) *
                                    Number(
                                      item.price || 0
                                    )
                              ).toLocaleString(
                                "en-IN"
                              )}
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
            <div
              className="
                sticky
                bottom-0
                flex
                shrink-0
                justify-end
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