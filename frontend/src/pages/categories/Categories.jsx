import React, { useEffect, useMemo, useState } from "react";

import {
  Tags,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  CalendarDays,
  Package,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";


const emptyForm = {
  name: "",
};


const Categories = () => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [form, setForm] = useState(emptyForm);


  // ==========================================================
  // LOAD CATEGORIES
  // ==========================================================

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCategories();

      setCategories(
        response?.data ||
          response?.categories ||
          response ||
          []
      );
    } catch (err) {
      console.error("Load categories error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load categories.";

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
    loadCategories();
  }, []);


  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  const filteredCategories = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return categories;
    }

    return categories.filter((category) => {
      return category.name
        ?.toLowerCase()
        .includes(value);
    });
  }, [categories, search]);


  // ==========================================================
  // OPEN ADD
  // ==========================================================

  const openAdd = () => {
    setSelectedCategory(null);

    setForm({
      ...emptyForm,
    });

    setError("");

    setModal("form");
  };


  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const openEdit = (category) => {
    setSelectedCategory(category);

    setForm({
      name: category.name || "",
    });

    setError("");

    setModal("form");
  };


  // ==========================================================
  // OPEN VIEW
  // ==========================================================

  const openView = async (category) => {
    try {
      setError("");

      const response = await getCategoryById(
        category.id
      );

      const data =
        response?.data ||
        response?.category ||
        response ||
        category;

      setSelectedCategory(data);

      setModal("view");
    } catch (err) {
      console.error("Get category error:", err);

      // Use table data if detail API fails
      setSelectedCategory(category);

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

    setSelectedCategory(null);

    setForm({
      ...emptyForm,
    });

    setError("");
  };


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================================
  // SAVE CATEGORY
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("Category name is required.");

      toast.error("Category name is required.");

      return;
    }

    try {
      setSaving(true);

      setError("");

      const payload = {
        name,
      };


      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      if (selectedCategory) {
        await updateCategory(
          selectedCategory.id,
          payload
        );

        toast.success(
          "Category updated successfully!"
        );
      }


      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      else {
        await createCategory(payload);

        toast.success(
          "Category added successfully!"
        );
      }


      closeModal();

      await loadCategories();
    } catch (err) {
      console.error(
        "Save category error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save category.";

      setError(message);

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // DELETE CATEGORY
  // ==========================================================

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteCategory(category.id);

      toast.success(
        "Category deleted successfully!"
      );

      await loadCategories();
    } catch (err) {
      console.error(
        "Delete category error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to delete category.";

      setError(message);

      toast.error(message);
    }
  };


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    await loadCategories();

    toast.success(
      "Categories refreshed successfully."
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
            <Tags className="h-5 w-5" />
          </div>

          <div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Categories
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage product categories
            </p>

          </div>

        </div>


        <div className="flex items-center gap-3">

          {/* REFRESH */}

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


          {/* ADD CATEGORY */}

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

            Add Category

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
            placeholder="Search categories..."
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
          CATEGORY TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">

              <RefreshCw className="h-5 w-5 animate-spin" />

              Loading categories...

            </div>

          </div>

        ) : filteredCategories.length === 0 ? (

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

              <Tags className="h-6 w-6 text-slate-500" />

            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              No categories found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">

              {search
                ? "Try changing your search."
                : "Add your first category to get started."}

            </p>


            {!search && (

              <button
                type="button"
                onClick={openAdd}
                className="
                  mt-5
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
                  hover:bg-slate-800
                "
              >

                <Plus className="h-4 w-4" />

                Add Category

              </button>

            )}

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[750px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Products
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

                {filteredCategories.map(
                  (category) => (

                    <tr
                      key={category.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* CATEGORY */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">

                            <Tags className="h-4 w-4" />

                          </div>

                          <div>

                            <p className="font-semibold text-slate-900">
                              {category.name || "-"}
                            </p>

                            <p className="text-xs text-slate-500">
                              Category #{category.id}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* PRODUCTS */}

                      <td className="px-5 py-4">

                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">

                          <Package className="h-3.5 w-3.5" />

                          {Array.isArray(
                            category.products
                          )
                            ? category.products.length
                            : category._count?.products ??
                              category.productCount ??
                              0}

                        </div>

                      </td>


                      {/* CREATED */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-500">

                          <CalendarDays className="h-4 w-4 text-slate-400" />

                          {formatDate(
                            category.createdAt
                          )}

                        </div>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-1">

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              openView(category)
                            }
                            title="View Category"
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


                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(category)
                            }
                            title="Edit Category"
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


                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(category)
                            }
                            title="Delete Category"
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
          ADD / EDIT CATEGORY MODAL
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
                HEADER
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-7 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">

                  {selectedCategory
                    ? "Edit Category"
                    : "Add Category"}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {selectedCategory
                    ? "Update category information below."
                    : "Enter category information below."}

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
                SCROLLABLE BODY
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto"
            >

              <div className="px-7 py-6">

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* CATEGORY NAME */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Category Name

                      <span className="ml-1 text-red-500">
                        *
                      </span>

                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter category name"
                      required
                      autoFocus
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


                  {/* PREVIEW */}

                  <div className="md:col-span-2">

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Category Preview
                      </p>

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">

                          <Tags className="h-5 w-5" />

                        </div>

                        <div>

                          <p className="font-semibold text-slate-900">

                            {form.name.trim() ||
                              "Category Name"}

                          </p>

                          <p className="text-xs text-slate-500">
                            Product Category
                          </p>

                        </div>

                      </div>

                    </div>

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
                  FOOTER
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
                    : selectedCategory
                    ? "Update Category"
                    : "Add Category"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          VIEW CATEGORY MODAL
      ====================================================== */}

      {modal === "view" && selectedCategory && (

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
                  Category Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  View category information
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

                {/* CATEGORY PROFILE */}

                <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">

                    <Tags className="h-7 w-7" />

                  </div>


                  <div>

                    <h3 className="text-lg font-bold text-slate-900">

                      {selectedCategory.name ||
                        "-"}

                    </h3>

                    <p className="mt-1 text-sm text-slate-500">

                      Category #
                      {selectedCategory.id}

                    </p>

                  </div>

                </div>


                {/* DETAILS */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <Detail
                    icon={Tags}
                    label="Category Name"
                    value={
                      selectedCategory.name ||
                      "-"
                    }
                  />


                  <Detail
                    icon={Package}
                    label="Products"
                    value={
                      Array.isArray(
                        selectedCategory.products
                      )
                        ? selectedCategory.products.length
                        : selectedCategory
                            ._count?.products ??
                          selectedCategory.productCount ??
                          0
                    }
                  />


                  <Detail
                    icon={CalendarDays}
                    label="Created At"
                    value={formatDate(
                      selectedCategory.createdAt
                    )}
                  />


                  <Detail
                    icon={CalendarDays}
                    label="Last Updated"
                    value={formatDate(
                      selectedCategory.updatedAt
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


export default Categories;