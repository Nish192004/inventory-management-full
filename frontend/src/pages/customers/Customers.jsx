import React, { useEffect, useState } from "react";

import {
  Users,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../services/customerService";


// ============================================================
// CONSTANTS
// ============================================================

// Minimum time the refresh animation stays visible (ms)
const MIN_REFRESH_TIME = 700;

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

const CUSTOMER_HEADINGS = [
  "Customer",
  "Email",
  "Phone",
  "Address",
  "Created",
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

const CustomerTableHead = () => (
  <thead className="border-b border-slate-200 bg-slate-50">
    <tr>
      {CUSTOMER_HEADINGS.map((heading) => (
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
// CUSTOMER TABLE SKELETON (first load only)
// ============================================================

const CustomerTableSkeleton = () => {
  const rows = Array.from({ length: 7 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[950px] text-left text-sm">

        <CustomerTableHead />

        <tbody className="divide-y divide-slate-100">
          {rows.map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-5 py-5"><div className="h-4 w-32 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-40 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-28 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-44 rounded bg-slate-200" /></td>
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
// CUSTOMERS
// ============================================================

const Customers = () => {
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

  // id of the customer currently being deleted
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });


  // ==================================================
  // LOAD CUSTOMERS
  // silent = true  -> table stays on screen
  // silent = false -> skeleton (first load only)
  // returns true on success, false on failure
  // ==================================================

  const loadCustomers = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const response = await getCustomers();

      setCustomers(
        toArray(
          response?.data ||
            response?.customers ||
            response
        )
      );

      setLastUpdated(new Date());

      return true;

    } catch (err) {
      console.error("Customers loading error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load customers.";

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
    loadCustomers();
  }, []);


  // ==================================================
  // SILENT RELOAD + REPLAY ROW ANIMATION
  // used after create / update / delete
  // ==================================================

  const reloadAndAnimate = async () => {
    await loadCustomers({ silent: true });
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
        loadCustomers({ silent: true }),
        wait(MIN_REFRESH_TIME),
      ]);

      // replay the row fade-in animation with the fresh data
      setRefreshKey((previous) => previous + 1);

      if (ok) {
        toast.success("Customers refreshed successfully.", {
          toastId: "customers-refreshed",
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

  const filteredCustomers = customers.filter((customer) => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return true;
    }

    return (
      customer.name?.toLowerCase().includes(value) ||
      customer.email?.toLowerCase().includes(value) ||
      customer.phone?.toLowerCase().includes(value) ||
      customer.address?.toLowerCase().includes(value) ||
      String(customer.id).toLowerCase().includes(value)
    );
  });


  // ==================================================
  // ADD / EDIT MODAL
  // ==================================================

  const openAdd = () => {
    setError("");
    setForm({ ...emptyForm });
    setSelectedCustomer(null);
    setModal("form");
  };

  const openEdit = (customer) => {
    setError("");

    setSelectedCustomer(customer);

    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setModal("form");
  };


  // ==================================================
  // VIEW CUSTOMER
  // ==================================================

  const openView = async (customer) => {
    try {
      setError("");

      const response = await getCustomerById(customer.id);

      setSelectedCustomer(
        response?.data?.customer ||
          response?.data ||
          response?.customer ||
          response ||
          customer
      );

      setModal("view");
    } catch (err) {
      console.error("Customer details error:", err);

      setSelectedCustomer(customer);
      setModal("view");
    }
  };


  // ==================================================
  // CLOSE MODAL
  // ==================================================

  const closeModal = () => {
    if (!saving) {
      setModal(null);
      setSelectedCustomer(null);
      setError("");
    }
  };


  // ==================================================
  // SUBMIT (CREATE / UPDATE)
  // ==================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Customer name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      };

      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, payload);
        toast.success("Customer updated successfully!");
      } else {
        await createCustomer(payload);
        toast.success("Customer added successfully!");
      }

      // close directly (saving is still true here,
      // so closeModal() would refuse to run)
      setModal(null);
      setSelectedCustomer(null);
      setForm({ ...emptyForm });

      // silent reload -> no skeleton flash after saving
      await reloadAndAnimate();
    } catch (err) {
      console.error("Save customer error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save customer.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };


  // ==================================================
  // DELETE CUSTOMER
  // ==================================================

  const handleDelete = async (customer) => {
    if (
      !window.confirm(
        `Delete "${customer.name}"?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(customer.id);
      setError("");

      await deleteCustomer(customer.id);

      toast.success("Customer deleted successfully!");

      await reloadAndAnimate();
    } catch (err) {
      console.error("Delete customer error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to delete customer.";

      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };


  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      <style>
        {`
          @keyframes customersPageFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .customers-page-fade-in {
            animation: customersPageFadeIn 0.35s ease-out;
          }

          @keyframes customersProgress {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }

          .customers-progress-bar {
            animation: customersProgress 1.1s ease-in-out infinite;
          }

          @keyframes customersRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .customers-row-in {
            animation: customersRowIn 0.3s ease-out both;
          }

          @keyframes customersOverlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          .customers-overlay-in {
            animation: customersOverlayIn 0.2s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .customers-page-fade-in,
            .customers-progress-bar,
            .customers-row-in,
            .customers-overlay-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="customers-page-fade-in w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Customers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your customers and their information.
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

            {/* ADD CUSTOMER */}
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Add Customer
            </button>

          </div>
        </div>

        {/* ERROR (hidden while the form modal is open;
            the modal shows its own error) */}
        {error && modal !== "form" && (
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
              placeholder="Search by name, email, phone or address..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

          </div>
        </div>

        {/* CUSTOMERS TABLE */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOP PROGRESS BAR (while refreshing) */}
          {refreshing && (
            <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden bg-slate-100">
              <div className="customers-progress-bar h-full w-1/4 rounded-full bg-slate-900" />
            </div>
          )}

          {/* FLOATING "REFRESHING" PILL (same as Sales.jsx) */}
          {refreshing && (
            <div className="customers-overlay-in pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-24 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
                <RefreshCw className="h-4 w-4 animate-spin text-slate-900" />
              </div>
            </div>
          )}

          {/* SKELETON ONLY ON FIRST LOAD */}
          {loading ? (

            <CustomerTableSkeleton />

          ) : filteredCustomers.length === 0 ? (

            <div className="py-16 text-center">

              <Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="font-medium text-slate-700">
                No customers found.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {search.trim()
                  ? "Try a different name, email or phone."
                  : "Add your first customer to get started."}
              </p>

            </div>

          ) : (

            <div
              className={`overflow-x-auto transition-opacity duration-200 ${
                refreshing ? "opacity-70" : "opacity-100"
              }`}
            >

              <table className="w-full min-w-[950px] text-left text-sm">

                <CustomerTableHead />

                <tbody className="divide-y divide-slate-100">

                  {filteredCustomers.map((customer, index) => (
                    <tr
                      key={`${customer.id}-${refreshKey}`}
                      className="customers-row-in transition hover:bg-slate-50"
                      style={{
                        animationDelay: `${Math.min(index, 12) * 30}ms`,
                      }}
                    >

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {customer.name || customer.id}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {customer.email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {customer.phone || "-"}
                      </td>

                      <td className="max-w-xs truncate px-5 py-4 text-slate-600">
                        {customer.address || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-1">

                          <button
                            type="button"
                            onClick={() => openView(customer)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="View Customer"
                            aria-label="View customer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(customer)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="Edit Customer"
                            aria-label="Edit customer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(customer)}
                            disabled={deletingId === customer.id}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete Customer"
                            aria-label="Delete customer"
                          >
                            {deletingId === customer.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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
            ADD / EDIT CUSTOMER MODAL
        ================================================== */}

        {modal === "form" && (
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
                    {selectedCustomer ? "Edit Customer" : "Add Customer"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedCustomer
                      ? "Update customer information."
                      : "Add a new customer to your system."}
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
                onSubmit={handleSubmit}
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

                  {/* NAME */}
                  <div>

                    <label
                      htmlFor="customer-name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Customer Name
                    </label>

                    <input
                      id="customer-name"
                      value={form.name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          name: event.target.value,
                        })
                      }
                      placeholder="Enter customer name"
                      autoFocus
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                  </div>

                  {/* EMAIL & PHONE */}
                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>

                      <label
                        htmlFor="customer-email"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Email
                      </label>

                      <input
                        id="customer-email"
                        type="email"
                        placeholder="customer@example.com"
                        value={form.email}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            email: event.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                    </div>

                    <div>

                      <label
                        htmlFor="customer-phone"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Phone
                      </label>

                      <input
                        id="customer-phone"
                        type="text"
                        placeholder="+91 9876543210"
                        value={form.phone}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            phone: event.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                    </div>

                  </div>

                  {/* ADDRESS */}
                  <div>

                    <label
                      htmlFor="customer-address"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Address
                    </label>

                    <textarea
                      id="customer-address"
                      rows={4}
                      placeholder="Enter customer address"
                      value={form.address}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          address: event.target.value,
                        })
                      }
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

                    {saving
                      ? "Saving..."
                      : selectedCustomer
                      ? "Update Customer"
                      : "Add Customer"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* ==================================================
            VIEW CUSTOMER MODAL
        ================================================== */}

        {modal === "view" && selectedCustomer && (
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
                    Customer Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    View customer information.
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

                  {/* CUSTOMER INFORMATION */}
                  <div className="grid gap-4 sm:grid-cols-2">

                    <Info
                      label="Customer Name"
                      value={selectedCustomer.name}
                    />

                    <Info
                      label="Customer ID"
                      value={`#${selectedCustomer.id}`}
                    />

                    <Info
                      label="Email"
                      value={selectedCustomer.email || "Not provided"}
                    />

                    <Info
                      label="Phone"
                      value={selectedCustomer.phone || "Not provided"}
                    />

                    <Info
                      label="Address"
                      value={selectedCustomer.address || "Not provided"}
                    />

                    <Info
                      label="Created"
                      value={
                        selectedCustomer.createdAt
                          ? new Date(selectedCustomer.createdAt).toLocaleString("en-IN")
                          : "-"
                      }
                    />

                    <Info
                      label="Last Updated"
                      value={
                        selectedCustomer.updatedAt
                          ? new Date(selectedCustomer.updatedAt).toLocaleString("en-IN")
                          : "-"
                      }
                    />

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

    <p className="mt-1 break-words font-semibold text-slate-800">
      {value || "-"}
    </p>

  </div>
);

export default Customers;