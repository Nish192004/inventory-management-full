import React, { useEffect, useState } from "react";

import {
  Tags,
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
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";


// ============================================================
// CONSTANTS
// ============================================================

// Minimum time the refresh animation stays visible (ms)
const MIN_REFRESH_TIME = 700;

const emptyForm = {
  name: "",
};

const CATEGORY_HEADINGS = [
  "Category",
  "Products",
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

const getProductCount = (category) =>
  Array.isArray(category?.products)
    ? category.products.length
    : category?._count?.products ??
      category?.productCount ??
      0;


// ============================================================
// TABLE HEAD (shared by skeleton + real table)
// ============================================================

const CategoryTableHead = () => (
  <thead className="border-b border-slate-200 bg-slate-50">
    <tr>
      {CATEGORY_HEADINGS.map((heading) => (
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
// CATEGORY TABLE SKELETON (first load only)
// ============================================================

const CategoryTableSkeleton = () => {
  const rows = Array.from({ length: 7 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[950px] text-left text-sm">

        <CategoryTableHead />

        <tbody className="divide-y divide-slate-100">
          {rows.map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-5 py-5"><div className="h-4 w-36 rounded bg-slate-200" /></td>
              <td className="px-5 py-5"><div className="h-4 w-10 rounded bg-slate-200" /></td>
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
// CATEGORIES
// ============================================================

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  // first load only -> skeleton
  const [loading, setLoading] = useState(true);

  // manual refresh -> progress bar + overlay (table stays visible)
  const [refreshing, setRefreshing] = useState(false);

  // changes after every refresh so rows replay their fade-in animation
  const [refreshKey, setRefreshKey] = useState(0);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [saving, setSaving] = useState(false);

  // id of the category currently being deleted
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });


  // ==================================================
  // LOAD CATEGORIES
  // silent = true  -> table stays on screen
  // silent = false -> skeleton (first load only)
  // returns true on success, false on failure
  // ==================================================

  const loadCategories = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const response = await getCategories();

      setCategories(
        toArray(
          response?.data ||
            response?.categories ||
            response
        )
      );

      setLastUpdated(new Date());

      return true;

    } catch (err) {
      console.error("Categories loading error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load categories.";

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
    loadCategories();
  }, []);


  // ==================================================
  // SILENT RELOAD + REPLAY ROW ANIMATION
  // used after create / update / delete
  // ==================================================

  const reloadAndAnimate = async () => {
    await loadCategories({ silent: true });
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
        loadCategories({ silent: true }),
        wait(MIN_REFRESH_TIME),
      ]);

      // replay the row fade-in animation with the fresh data
      setRefreshKey((previous) => previous + 1);

      if (ok) {
        toast.success("Categories refreshed successfully.", {
          toastId: "categories-refreshed",
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

  const filteredCategories = categories.filter((category) => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return true;
    }

    return (
      category.name?.toLowerCase().includes(value) ||
      String(category.id).toLowerCase().includes(value)
    );
  });


  // ==================================================
  // ADD / EDIT MODAL
  // ==================================================

  const openAdd = () => {
    setError("");
    setForm({ ...emptyForm });
    setSelectedCategory(null);
    setModal("form");
  };

  const openEdit = (category) => {
    setError("");

    setSelectedCategory(category);

    setForm({
      name: category.name || "",
    });

    setModal("form");
  };


  // ==================================================
  // VIEW CATEGORY
  // ==================================================

  const openView = async (category) => {
    try {
      setError("");

      const response = await getCategoryById(category.id);

      setSelectedCategory(
        response?.data ||
          response?.category ||
          response ||
          category
      );

      setModal("view");
    } catch (err) {
      console.error("Category details error:", err);

      // use table data if the detail API fails
      setSelectedCategory(category);
      setModal("view");
    }
  };


  // ==================================================
  // CLOSE MODAL
  // ==================================================

  const closeModal = () => {
    if (!saving) {
      setModal(null);
      setSelectedCategory(null);
      setError("");
    }
  };


  // ==================================================
  // SUBMIT (CREATE / UPDATE)
  // ==================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = { name };

      if (selectedCategory) {
        await updateCategory(selectedCategory.id, payload);
        toast.success("Category updated successfully!");
      } else {
        await createCategory(payload);
        toast.success("Category added successfully!");
      }

      // close directly (saving is still true here,
      // so closeModal() would refuse to run)
      setModal(null);
      setSelectedCategory(null);
      setForm({ ...emptyForm });

      // silent reload -> no skeleton flash after saving
      await reloadAndAnimate();
    } catch (err) {
      console.error("Save category error:", err);

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


  // ==================================================
  // DELETE CATEGORY
  // ==================================================

  const handleDelete = async (category) => {
    if (
      !window.confirm(
        `Delete "${category.name}"?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(category.id);
      setError("");

      await deleteCategory(category.id);

      toast.success("Category deleted successfully!");

      await reloadAndAnimate();
    } catch (err) {
      console.error("Delete category error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to delete category.";

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
          @keyframes categoriesPageFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .categories-page-fade-in {
            animation: categoriesPageFadeIn 0.35s ease-out;
          }

          @keyframes categoriesProgress {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }

          .categories-progress-bar {
            animation: categoriesProgress 1.1s ease-in-out infinite;
          }

          @keyframes categoriesRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .categories-row-in {
            animation: categoriesRowIn 0.3s ease-out both;
          }

          @keyframes categoriesOverlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          .categories-overlay-in {
            animation: categoriesOverlayIn 0.2s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .categories-page-fade-in,
            .categories-progress-bar,
            .categories-row-in,
            .categories-overlay-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="categories-page-fade-in w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Categories
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage product categories.
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

            {/* ADD CATEGORY */}
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Add Category
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
              placeholder="Search categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

          </div>
        </div>

        {/* CATEGORIES TABLE */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOP PROGRESS BAR (while refreshing) */}
          {refreshing && (
            <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden bg-slate-100">
              <div className="categories-progress-bar h-full w-1/4 rounded-full bg-slate-900" />
            </div>
          )}

          {/* FLOATING "REFRESHING" PILL (same as Sales.jsx) */}
          {refreshing && (
            <div className="categories-overlay-in pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-24 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
                <RefreshCw className="h-4 w-4 animate-spin text-slate-900" />
              </div>
            </div>
          )}

          {/* SKELETON ONLY ON FIRST LOAD */}
          {loading ? (

            <CategoryTableSkeleton />

          ) : filteredCategories.length === 0 ? (

            <div className="py-16 text-center">

              <Tags className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="font-medium text-slate-700">
                No categories found.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {search.trim()
                  ? "Try a different category name."
                  : "Add your first category to get started."}
              </p>

            </div>

          ) : (

            <div
              className={`overflow-x-auto transition-opacity duration-200 ${
                refreshing ? "opacity-70" : "opacity-100"
              }`}
            >

              <table className="w-full min-w-[950px] text-left text-sm">

                <CategoryTableHead />

                <tbody className="divide-y divide-slate-100">

                  {filteredCategories.map((category, index) => (
                    <tr
                      key={`${category.id}-${refreshKey}`}
                      className="categories-row-in transition hover:bg-slate-50"
                      style={{
                        animationDelay: `${Math.min(index, 12) * 30}ms`,
                      }}
                    >

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {category.name || category.id}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getProductCount(category)}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-1">

                          <button
                            type="button"
                            onClick={() => openView(category)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="View Category"
                            aria-label="View category"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(category)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="Edit Category"
                            aria-label="Edit category"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            disabled={deletingId === category.id}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete Category"
                            aria-label="Delete category"
                          >
                            {deletingId === category.id ? (
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
            ADD / EDIT CATEGORY MODAL
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
                    {selectedCategory ? "Edit Category" : "Add Category"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedCategory
                      ? "Update category information."
                      : "Add a new product category."}
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
                      htmlFor="category-name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Category Name
                    </label>

                    <input
                      id="category-name"
                      value={form.name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          name: event.target.value,
                        })
                      }
                      placeholder="Enter category name"
                      autoFocus
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
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
                      : selectedCategory
                      ? "Update Category"
                      : "Add Category"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* ==================================================
            VIEW CATEGORY MODAL
        ================================================== */}

        {modal === "view" && selectedCategory && (
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
                    Category Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    View category information.
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

                  {/* CATEGORY INFORMATION */}
                  <div className="grid gap-4 sm:grid-cols-2">

                    <Info
                      label="Category Name"
                      value={selectedCategory.name}
                    />

                    <Info
                      label="Category ID"
                      value={`#${selectedCategory.id}`}
                    />

                    <Info
                      label="Products"
                      value={String(getProductCount(selectedCategory))}
                    />

                    <Info
                      label="Created"
                      value={
                        selectedCategory.createdAt
                          ? new Date(selectedCategory.createdAt).toLocaleString("en-IN")
                          : "-"
                      }
                    />

                    <Info
                      label="Last Updated"
                      value={
                        selectedCategory.updatedAt
                          ? new Date(selectedCategory.updatedAt).toLocaleString("en-IN")
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

export default Categories;