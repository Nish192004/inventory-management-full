import React, { useEffect, useMemo, useState } from "react";

import {
  Building2,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
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
// EMPTY FORM
// ============================================================

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
};


// ============================================================
// SUPPLIERS
// ============================================================

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);

  const [selectedSupplier, setSelectedSupplier] =
    useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });


  // ==========================================================
  // LOAD SUPPLIERS
  // ==========================================================

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

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
      console.error(
        "Load suppliers error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load suppliers.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadSuppliers();
  }, []);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredSuppliers = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    if (!value) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      return (
        supplier.name
          ?.toLowerCase()
          .includes(value) ||

        supplier.email
          ?.toLowerCase()
          .includes(value) ||

        supplier.phone
          ?.toLowerCase()
          .includes(value) ||

        supplier.address
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [suppliers, search]);


  // ==========================================================
  // OPEN ADD
  // ==========================================================

  const openAdd = () => {
    setForm({
      ...emptyForm,
    });

    setSelectedSupplier(null);

    setError("");

    setModal("form");
  };


  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const openEdit = (supplier) => {
    setSelectedSupplier(supplier);

    setForm({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });

    setError("");

    setModal("form");
  };


  // ==========================================================
  // OPEN VIEW
  // ==========================================================

  const openView = async (supplier) => {
    try {
      setError("");

      const response =
        await getSupplierById(
          supplier.id
        );

      const supplierData =
        response?.data ||
        response?.supplier ||
        response ||
        supplier;

      setSelectedSupplier(
        supplierData
      );

      setModal("view");
    } catch (err) {
      console.error(
        "Get supplier error:",
        err
      );

      setSelectedSupplier(
        supplier
      );

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

    setSelectedSupplier(null);

    setForm({
      ...emptyForm,
    });

    setError("");
  };


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
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
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!form.name.trim()) {
      toast.error(
        "Supplier name is required."
      );

      return;
    }

    try {
      setSaving(true);

      setError("");

      const payload = {
        name: form.name.trim(),

        email:
          form.email.trim() || null,

        phone:
          form.phone.trim() || null,

        address:
          form.address.trim() || null,
      };


      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      if (selectedSupplier) {
        await updateSupplier(
          selectedSupplier.id,
          payload
        );

        toast.success(
          "Supplier updated successfully!"
        );
      }


      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      else {
        await createSupplier(
          payload
        );

        toast.success(
          "Supplier added successfully!"
        );
      }


      closeModal();

      await loadSuppliers();
    } catch (err) {
      console.error(
        "Save supplier error:",
        err
      );

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


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (
    supplier
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${supplier.name}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteSupplier(
        supplier.id
      );

      toast.success(
        "Supplier deleted successfully!"
      );

      await loadSuppliers();
    } catch (err) {
      console.error(
        "Delete supplier error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to delete supplier.";

      setError(message);

      toast.error(message);
    }
  };


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    await loadSuppliers();

    toast.success(
      "Suppliers refreshed successfully."
    );
  };


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="w-full space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>

          <div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Suppliers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your suppliers and supplier information.
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
            onClick={openAdd}
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

            Add Supplier
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
              setSearch(
                event.target.value
              )
            }
            placeholder="Search supplier, email, phone..."
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

          <X className="mt-0.5 h-5 w-5 shrink-0" />

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

              Loading suppliers...

            </div>

          </div>

        ) : filteredSuppliers.length === 0 ? (

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

              <Building2 className="h-6 w-6 text-slate-400" />

            </div>

            <h3 className="text-base font-semibold text-slate-900">
              No suppliers found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add your first supplier to get started.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Supplier
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Address
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredSuppliers.map(
                  (supplier) => (

                    <tr
                      key={supplier.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* SUPPLIER */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                            <Building2 className="h-4 w-4 text-slate-600" />

                          </div>

                          <div>

                            <div className="font-semibold text-slate-900">
                              {supplier.name ||
                                "-"}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              ID #{supplier.id}
                            </div>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td className="px-5 py-4">

                        {supplier.email ? (

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <Mail className="h-4 w-4 text-slate-400" />

                            {supplier.email}

                          </div>

                        ) : (

                          <span className="text-sm text-slate-400">
                            —
                          </span>

                        )}

                      </td>


                      {/* PHONE */}

                      <td className="px-5 py-4">

                        {supplier.phone ? (

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <Phone className="h-4 w-4 text-slate-400" />

                            {supplier.phone}

                          </div>

                        ) : (

                          <span className="text-sm text-slate-400">
                            —
                          </span>

                        )}

                      </td>


                      {/* ADDRESS */}

                      <td className="max-w-xs px-5 py-4">

                        {supplier.address ? (

                          <div className="flex items-start gap-2 text-sm text-slate-600">

                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                            <span className="truncate">
                              {supplier.address}
                            </span>

                          </div>

                        ) : (

                          <span className="text-sm text-slate-400">
                            —
                          </span>

                        )}

                      </td>


                      {/* CREATED */}

                      <td className="px-5 py-4 text-sm text-slate-500">

                        {supplier.createdAt
                          ? new Date(
                              supplier.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}

                      </td>


                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              openView(
                                supplier
                              )
                            }
                            title="View supplier"
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


                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                supplier
                              )
                            }
                            title="Edit supplier"
                            className="
                              rounded-lg
                              p-2
                              text-slate-500
                              transition
                              hover:bg-slate-100
                              hover:text-slate-900
                            "
                          >
                            <Pencil className="h-4 w-4" />
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                supplier
                              )
                            }
                            title="Delete supplier"
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
          ADD / EDIT SUPPLIER MODAL
          SAME SIZE AS PRODUCT / PURCHASE MODAL
      ====================================================== */}

      {modal === "form" && (

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

                  {selectedSupplier
                    ? "Edit Supplier"
                    : "Add Supplier"}

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
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto"
            >

              <div className="space-y-6 px-6 py-6">

                {/* SUPPLIER INFORMATION */}

                <div>

                  <div className="mb-5">

                    <h3 className="text-sm font-bold text-slate-900">
                      Supplier Information
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Enter the supplier's contact and address details.
                    </p>

                  </div>


                  <div className="grid gap-5 sm:grid-cols-2">

                    {/* NAME */}

                    <div className="sm:col-span-2">

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Supplier Name
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter supplier name"
                        autoFocus
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


                    {/* EMAIL */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Email
                      </label>

                      <div className="relative">

                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="supplier@example.com"
                          className="
                            w-full
                            rounded-lg
                            border
                            border-slate-300
                            bg-white
                            py-2.5
                            pl-10
                            pr-3.5
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


                    {/* PHONE */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Phone
                      </label>

                      <div className="relative">

                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="text"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 9876543210"
                          className="
                            w-full
                            rounded-lg
                            border
                            border-slate-300
                            bg-white
                            py-2.5
                            pl-10
                            pr-3.5
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


                    {/* ADDRESS */}

                    <div className="sm:col-span-2">

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Address
                      </label>

                      <div className="relative">

                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                        <textarea
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Enter supplier address"
                          className="
                            w-full
                            resize-none
                            rounded-lg
                            border
                            border-slate-300
                            bg-white
                            py-2.5
                            pl-10
                            pr-3.5
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

                  </div>

                </div>


                {/* INFORMATION BOX */}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">

                      <Building2 className="h-4 w-4" />

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Supplier Information
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Supplier details can be used when creating purchase orders and tracking your inventory purchases.
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


      {/* ======================================================
          VIEW SUPPLIER MODAL
      ====================================================== */}

      {modal === "view" &&
        selectedSupplier && (

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
                    Supplier Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    View supplier information.
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

                  {/* SUPPLIER HEADER CARD */}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-950 text-white">

                        <Building2 className="h-7 w-7" />

                      </div>

                      <div>

                        <h3 className="text-xl font-bold text-slate-900">
                          {selectedSupplier.name ||
                            "-"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Supplier ID #
                          {selectedSupplier.id}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* DETAILS */}

                  <div>

                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                      Contact Information
                    </h3>


                    <div className="grid gap-4 sm:grid-cols-2">

                      {/* EMAIL */}

                      <div className="rounded-xl border border-slate-200 p-5">

                        <div className="flex items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                            <Mail className="h-5 w-5 text-slate-600" />

                          </div>

                          <div className="min-w-0">

                            <p className="text-xs font-medium text-slate-500">
                              Email
                            </p>

                            <p className="mt-1 break-all text-sm font-semibold text-slate-900">

                              {selectedSupplier.email ||
                                "Not provided"}

                            </p>

                          </div>

                        </div>

                      </div>


                      {/* PHONE */}

                      <div className="rounded-xl border border-slate-200 p-5">

                        <div className="flex items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                            <Phone className="h-5 w-5 text-slate-600" />

                          </div>

                          <div>

                            <p className="text-xs font-medium text-slate-500">
                              Phone
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">

                              {selectedSupplier.phone ||
                                "Not provided"}

                            </p>

                          </div>

                        </div>

                      </div>


                      {/* ADDRESS */}

                      <div className="rounded-xl border border-slate-200 p-5 sm:col-span-2">

                        <div className="flex items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                            <MapPin className="h-5 w-5 text-slate-600" />

                          </div>

                          <div>

                            <p className="text-xs font-medium text-slate-500">
                              Address
                            </p>

                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">

                              {selectedSupplier.address ||
                                "Not provided"}

                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* DATES */}

                  <div>

                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                      Record Information
                    </h3>


                    <div className="grid gap-4 sm:grid-cols-2">

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                        <p className="text-xs font-medium text-slate-500">
                          Created
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">

                          {selectedSupplier.createdAt
                            ? new Date(
                                selectedSupplier.createdAt
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}

                        </p>

                      </div>


                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                        <p className="text-xs font-medium text-slate-500">
                          Last Updated
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">

                          {selectedSupplier.updatedAt
                            ? new Date(
                                selectedSupplier.updatedAt
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}

                        </p>

                      </div>

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

export default Suppliers;