import React, { useEffect, useMemo, useState } from "react";

import {
  Users,
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
  CalendarDays,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../services/customerService";


const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
};


const Customers = () => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form, setForm] = useState(emptyForm);


  // ==========================================================
  // LOAD CUSTOMERS
  // ==========================================================

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCustomers();

      setCustomers(
        response?.data ||
          response?.customers ||
          response ||
          []
      );
    } catch (err) {
      console.error("Load customers error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load customers.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadCustomers();
  }, []);


  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  const filteredCustomers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name
          ?.toLowerCase()
          .includes(value) ||

        customer.email
          ?.toLowerCase()
          .includes(value) ||

        customer.phone
          ?.toLowerCase()
          .includes(value) ||

        customer.address
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [customers, search]);


  // ==========================================================
  // OPEN ADD
  // ==========================================================

  const openAdd = () => {
    setSelectedCustomer(null);

    setForm({
      ...emptyForm,
    });

    setError("");

    setModal("form");
  };


  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const openEdit = (customer) => {
    setSelectedCustomer(customer);

    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setError("");

    setModal("form");
  };


  // ==========================================================
  // OPEN VIEW
  // ==========================================================

  const openView = async (customer) => {
    try {
      setError("");

      const response = await getCustomerById(customer.id);

      const data =
        response?.data ||
        response?.customer ||
        response ||
        customer;

      setSelectedCustomer(data);

      setModal("view");
    } catch (err) {
      console.error("Get customer error:", err);

      // Fallback to the customer already available in table
      setSelectedCustomer(customer);

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

    setSelectedCustomer(null);

    setForm({
      ...emptyForm,
    });

    setError("");
  };


  // ==========================================================
  // HANDLE FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================================
  // SAVE CUSTOMER
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("Customer name is required.");

      toast.error("Customer name is required.");

      return;
    }

    try {
      setSaving(true);

      setError("");

      const payload = {
        name: name,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      };


      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      if (selectedCustomer) {
        await updateCustomer(
          selectedCustomer.id,
          payload
        );

        toast.success(
          "Customer updated successfully!"
        );
      }


      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      else {
        await createCustomer(payload);

        toast.success(
          "Customer added successfully!"
        );
      }


      closeModal();

      await loadCustomers();
    } catch (err) {
      console.error(
        "Save customer error:",
        err
      );

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


  // ==========================================================
  // DELETE CUSTOMER
  // ==========================================================

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Delete "${customer.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteCustomer(customer.id);

      toast.success(
        "Customer deleted successfully!"
      );

      await loadCustomers();
    } catch (err) {
      console.error(
        "Delete customer error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to delete customer.";

      setError(message);

      toast.error(message);
    }
  };


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    await loadCustomers();

    toast.success(
      "Customers refreshed successfully."
    );
  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "-";
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
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Customers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your customers and their information
            </p>
          </div>

        </div>


        <div className="flex items-center gap-3">

          {/* Refresh */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
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
              hover:bg-slate-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>


          {/* Add Customer */}

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

            Add Customer
          </button>

        </div>

      </div>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="relative max-w-xl">

          <Search
            className="
              pointer-events-none
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
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search customers by name, email, phone or address..."
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
              focus:border-slate-950
              focus:ring-2
              focus:ring-slate-950/10
            "
          />

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && !modal && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}


      {/* ======================================================
          CUSTOMER TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">

              <RefreshCw className="h-5 w-5 animate-spin" />

              Loading customers...

            </div>

          </div>

        ) : filteredCustomers.length === 0 ? (

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

              <Users className="h-6 w-6 text-slate-500" />

            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              No customers found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {search
                ? "Try changing your search."
                : "Add your first customer to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openAdd}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />

                Add Customer
              </button>
            )}

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Address
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredCustomers.map(
                  (customer) => (

                    <tr
                      key={customer.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* Customer */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">

                            {customer.name
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}

                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-slate-900">
                              {customer.name || "-"}
                            </p>

                            <p className="text-xs text-slate-500">
                              Customer #{customer.id}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* Email */}

                      <td className="px-5 py-4">

                        {customer.email ? (

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <Mail className="h-4 w-4 text-slate-400" />

                            <span>
                              {customer.email}
                            </span>

                          </div>

                        ) : (
                          <span className="text-sm text-slate-400">
                            -
                          </span>
                        )}

                      </td>


                      {/* Phone */}

                      <td className="px-5 py-4">

                        {customer.phone ? (

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <Phone className="h-4 w-4 text-slate-400" />

                            <span>
                              {customer.phone}
                            </span>

                          </div>

                        ) : (
                          <span className="text-sm text-slate-400">
                            -
                          </span>
                        )}

                      </td>


                      {/* Address */}

                      <td className="max-w-[250px] px-5 py-4">

                        {customer.address ? (

                          <div className="flex items-start gap-2 text-sm text-slate-600">

                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                            <span className="truncate">
                              {customer.address}
                            </span>

                          </div>

                        ) : (
                          <span className="text-sm text-slate-400">
                            -
                          </span>
                        )}

                      </td>


                      {/* Created */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-500">

                          <CalendarDays className="h-4 w-4 text-slate-400" />

                          {formatDate(
                            customer.createdAt
                          )}

                        </div>

                      </td>


                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-1">

                          {/* View */}

                          <button
                            type="button"
                            onClick={() =>
                              openView(customer)
                            }
                            title="View Customer"
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


                          {/* Edit */}

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(customer)
                            }
                            title="Edit Customer"
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


                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(customer)
                            }
                            title="Delete Customer"
                            className="
                              rounded-lg
                              p-2
                              text-red-500
                              transition
                              hover:bg-red-50
                              hover:text-red-700
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
          ADD / EDIT CUSTOMER MODAL
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
            left: "var(--sidebar-width, 0px)",
          }}
        >

          <div
            className="
              flex
              h-full
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

            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-7 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">

                  {selectedCustomer
                    ? "Edit Customer"
                    : "Add Customer"}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {selectedCustomer
                    ? "Update customer information below."
                    : "Enter customer information below."}

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


            {/* ==================================================
                SCROLLABLE FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto"
            >

              <div className="px-7 py-6">

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* CUSTOMER NAME */}

                  <FormField
                    label="Customer Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    required
                  />


                  {/* EMAIL */}

                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                  />


                  {/* PHONE */}

                  <FormField
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />


                  {/* ADDRESS */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Address

                    </label>

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Enter customer address"
                      className="
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-slate-300
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-slate-950
                        focus:ring-2
                        focus:ring-slate-950/10
                      "
                    />

                  </div>

                </div>


                {/* ERROR */}

                {error && (

                  <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

                    {error}

                  </div>

                )}

              </div>


              {/* ==================================================
                  MODAL FOOTER
              ================================================== */}

              <div className="sticky bottom-0 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-7 py-4">

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
                    shadow-sm
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
                    shadow-sm
                    transition
                    hover:bg-slate-800
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

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


      {/* ======================================================
          VIEW CUSTOMER MODAL
      ====================================================== */}

      {modal === "view" && selectedCustomer && (

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

            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-7 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Customer Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  View customer information
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

              <div className="px-7 py-6">

                {/* CUSTOMER PROFILE */}

                <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xl font-bold text-white">

                    {selectedCustomer.name
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}

                  </div>


                  <div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedCustomer.name || "-"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Customer #{selectedCustomer.id}
                    </p>

                  </div>

                </div>


                {/* DETAILS */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <Detail
                    icon={Mail}
                    label="Email"
                    value={
                      selectedCustomer.email ||
                      "Not provided"
                    }
                  />

                  <Detail
                    icon={Phone}
                    label="Phone"
                    value={
                      selectedCustomer.phone ||
                      "Not provided"
                    }
                  />

                  <Detail
                    icon={MapPin}
                    label="Address"
                    value={
                      selectedCustomer.address ||
                      "Not provided"
                    }
                  />

                  <Detail
                    icon={CalendarDays}
                    label="Created At"
                    value={formatDate(
                      selectedCustomer.createdAt
                    )}
                  />

                  <Detail
                    icon={CalendarDays}
                    label="Last Updated"
                    value={formatDate(
                      selectedCustomer.updatedAt
                    )}
                  />

                </div>

              </div>

            </div>


            {/* FOOTER */}

            <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-7 py-4">

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


// ==========================================================
// FORM FIELD COMPONENT
// ==========================================================

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="
          w-full
          rounded-lg
          border
          border-slate-300
          bg-white
          px-4
          py-2.5
          text-sm
          text-slate-900
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-slate-950
          focus:ring-2
          focus:ring-slate-950/10
        "
      />

    </div>
  );
};


// ==========================================================
// DETAIL COMPONENT
// ==========================================================

const Detail = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">

      <div className="mb-3 flex items-center gap-2">

        {Icon && (
          <Icon className="h-4 w-4 text-slate-400" />
        )}

        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </p>

      </div>

      <p className="break-words text-sm font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
};


export default Customers;