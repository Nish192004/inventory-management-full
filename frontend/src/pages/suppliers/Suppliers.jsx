import React, { useEffect, useState } from "react";

import {
  Building2,
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
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../services/supplierService";


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

const SUPPLIER_HEADINGS = [
  "Supplier",
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

const SupplierTableHead = () => (
  <thead className="border-b border-slate-200 bg-slate-50">
    <tr>
      {SUPPLIER_HEADINGS.map((heading) => (
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
// SUPPLIER TABLE SKELETON (first load only)
// ============================================================

const SupplierTableSkeleton = () => {
  const rows = Array.from({ length: 7 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[950px] text-left text-sm">

        <SupplierTableHead />

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
// SUPPLIERS
// ============================================================

const Suppliers = () => {
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

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });


  // ==================================================
  // LOAD SUPPLIERS
  // silent = true  -> table stays on screen
  // silent = false -> skeleton (first load only)
  // returns true on success, false on failure
  // ==================================================

  const loadSuppliers = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const response = await getSuppliers();

      setSuppliers(
        toArray(
          response?.data ||
            response?.suppliers ||
            response
        )
      );

      setLastUpdated(new Date());

      return true;

    } catch (err) {
      console.error("Suppliers loading error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load suppliers.";

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
    loadSuppliers();
  }, []);


  // ==================================================
  // SILENT RELOAD + REPLAY ROW ANIMATION
  // used after create / update / delete
  // ==================================================

  const reloadAndAnimate = async () => {
    await loadSuppliers({ silent: true });
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
        loadSuppliers({ silent: true }),
        wait(MIN_REFRESH_TIME),
      ]);

      // replay the row fade-in animation with the fresh data
      setRefreshKey((previous) => previous + 1);

      if (ok) {
        toast.success("Suppliers refreshed successfully.", {
          toastId: "suppliers-refreshed",
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

  const filteredSuppliers = suppliers.filter((supplier) => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return true;
    }

    return (
      supplier.name?.toLowerCase().includes(value) ||
      supplier.email?.toLowerCase().includes(value) ||
      supplier.phone?.toLowerCase().includes(value) ||
      supplier.address?.toLowerCase().includes(value) ||
      String(supplier.id).toLowerCase().includes(value)
    );
  });


  // ==================================================
  // ADD / EDIT MODAL
  // ==================================================

  const openAdd = () => {
    setError("");
    setForm({ ...emptyForm });
    setSelectedSupplier(null);
    setModal("form");
  };

  const openEdit = (supplier) => {
    setError("");

    setSelectedSupplier(supplier);

    setForm({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });

    setModal("form");
  };


  // ==================================================
  // VIEW SUPPLIER
  // ==================================================

  const openView = async (supplier) => {
    try {
      setError("");

      const response = await getSupplierById(supplier.id);

      setSelectedSupplier(
        response?.data ||
          response?.supplier ||
          response ||
          supplier
      );

      setModal("view");
    } catch (err) {
      console.error("Supplier details error:", err);

      setSelectedSupplier(supplier);
      setModal("view");
    }
  };


  // ==================================================
  // CLOSE MODAL
  // ==================================================

  const closeModal = () => {
    if (!saving) {
      setModal(null);
      setSelectedSupplier(null);
      setError("");
    }
  };


  // ==================================================
  // SUBMIT (CREATE / UPDATE)
  // ==================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Supplier name is required.");
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

      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, payload);
        toast.success("Supplier updated successfully!");
      } else {
        await createSupplier(payload);
        toast.success("Supplier added successfully!");
      }

      // close directly (saving is still true here,
      // so closeModal() would refuse to run)
      setModal(null);
      setSelectedSupplier(null);
      setForm({ ...emptyForm });

      // silent reload -> no skeleton flash after saving
      await reloadAndAnimate();
    } catch (err) {
      console.error("Save supplier error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save supplier.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };


  // ==================================================
  // DELETE SUPPLIER
  // ==================================================

  const handleDelete = async (supplier) => {
    if (
      !window.confirm(
        `Delete "${supplier.name}"?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setError("");

      await deleteSupplier(supplier.id);

      toast.success("Supplier deleted successfully!");

      await reloadAndAnimate();
    } catch (err) {
      console.error("Delete supplier error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to delete supplier.";

      setError(message);
      toast.error(message);
    }
  };


  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      <style>
        {`
          @keyframes supplierPageFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .supplier-page-fade-in {
            animation: supplierPageFadeIn 0.35s ease-out;
          }

          @keyframes supplierProgress {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }

          .supplier-progress-bar {
            animation: supplierProgress 1.1s ease-in-out infinite;
          }

          @keyframes supplierRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .supplier-row-in {
            animation: supplierRowIn 0.3s ease-out both;
          }

          @keyframes supplierOverlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          .supplier-overlay-in {
            animation: supplierOverlayIn 0.2s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .supplier-page-fade-in,
            .supplier-progress-bar,
            .supplier-row-in,
            .supplier-overlay-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="supplier-page-fade-in w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Suppliers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your suppliers and supplier information.
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

            {/* ADD SUPPLIER */}
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Add Supplier
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
              placeholder="Search supplier, email, phone..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

          </div>
        </div>

        {/* SUPPLIERS TABLE */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOP PROGRESS BAR (while refreshing) */}
          {refreshing && (
            <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden bg-slate-100">
              <div className="supplier-progress-bar h-full w-1/4 rounded-full bg-slate-900" />
            </div>
          )}

          {/* FLOATING "REFRESHING" PILL (same as Sales.jsx) */}
          {refreshing && (
            <div className="supplier-overlay-in pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-24 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
                <RefreshCw className="h-4 w-4 animate-spin text-slate-900" />
              </div>
            </div>
          )}

          {/* SKELETON ONLY ON FIRST LOAD */}
          {loading ? (

            <SupplierTableSkeleton />

          ) : filteredSuppliers.length === 0 ? (

            <div className="py-16 text-center">

              <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="font-medium text-slate-700">
                No suppliers found.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {search.trim()
                  ? "Try a different supplier name, email or phone."
                  : "Add your first supplier to get started."}
              </p>

            </div>

          ) : (

            <div
              className={`overflow-x-auto transition-opacity duration-200 ${
                refreshing ? "opacity-70" : "opacity-100"
              }`}
            >

              <table className="w-full min-w-[950px] text-left text-sm">

                <SupplierTableHead />

                <tbody className="divide-y divide-slate-100">

                  {filteredSuppliers.map((supplier, index) => (
                    <tr
                      key={`${supplier.id}-${refreshKey}`}
                      className="supplier-row-in transition hover:bg-slate-50"
                      style={{
                        animationDelay: `${Math.min(index, 12) * 30}ms`,
                      }}
                    >

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {supplier.name || supplier.id}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {supplier.email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {supplier.phone || "-"}
                      </td>

                      <td className="max-w-xs truncate px-5 py-4 text-slate-600">
                        {supplier.address || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {supplier.createdAt
                          ? new Date(supplier.createdAt).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-1">

                          <button
                            type="button"
                            onClick={() => openView(supplier)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="View Supplier"
                            aria-label="View supplier"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(supplier)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="Edit Supplier"
                            aria-label="Edit supplier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(supplier)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Delete Supplier"
                            aria-label="Delete supplier"
                          >
                            <Trash2 className="h-4 w-4" />
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
            ADD / EDIT SUPPLIER MODAL
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
                    {selectedSupplier ? "Edit Supplier" : "Add Supplier"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedSupplier
                      ? "Update supplier information."
                      : "Add a new supplier to your inventory system."}
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
                      htmlFor="supplier-name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Supplier Name
                    </label>

                    <input
                      id="supplier-name"
                      value={form.name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          name: event.target.value,
                        })
                      }
                      placeholder="Enter supplier name"
                      autoFocus
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                  </div>

                  {/* EMAIL & PHONE */}
                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>

                      <label
                        htmlFor="supplier-email"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Email
                      </label>

                      <input
                        id="supplier-email"
                        type="email"
                        placeholder="supplier@example.com"
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
                        htmlFor="supplier-phone"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Phone
                      </label>

                      <input
                        id="supplier-phone"
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
                      htmlFor="supplier-address"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Address
                    </label>

                    <textarea
                      id="supplier-address"
                      rows={4}
                      placeholder="Enter supplier address"
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
                      : selectedSupplier
                      ? "Update Supplier"
                      : "Add Supplier"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* ==================================================
            VIEW SUPPLIER MODAL
        ================================================== */}

        {modal === "view" && selectedSupplier && (
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
                    Supplier Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    View supplier information.
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

                  {/* SUPPLIER INFORMATION */}
                  <div className="grid gap-4 sm:grid-cols-2">

                    <Info
                      label="Supplier Name"
                      value={selectedSupplier.name}
                    />

                    <Info
                      label="Supplier ID"
                      value={`#${selectedSupplier.id}`}
                    />

                    <Info
                      label="Email"
                      value={selectedSupplier.email || "Not provided"}
                    />

                    <Info
                      label="Phone"
                      value={selectedSupplier.phone || "Not provided"}
                    />

                    <Info
                      label="Address"
                      value={selectedSupplier.address || "Not provided"}
                    />

                    <Info
                      label="Created"
                      value={
                        selectedSupplier.createdAt
                          ? new Date(selectedSupplier.createdAt).toLocaleString("en-IN")
                          : "-"
                      }
                    />

                    <Info
                      label="Last Updated"
                      value={
                        selectedSupplier.updatedAt
                          ? new Date(selectedSupplier.updatedAt).toLocaleString("en-IN")
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

export default Suppliers;