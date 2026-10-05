import React, { useEffect, useMemo, useState } from "react";

import {
  Package,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";

import { getCategories } from "../../services/categoryService";


// ============================================================
// EMPTY FORM
// ============================================================

const emptyForm = {
  name: "",
  sku: "",
  description: "",
  categoryId: "",
  quantity: "",
  price: "",
  costPrice: "",
  minStock: "",
};


// ============================================================
// PRODUCTS
// ============================================================

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });


  // ==========================================================
  // LOAD PRODUCTS
  // ==========================================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

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

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load products.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // LOAD CATEGORIES
  // ==========================================================

  const loadCategories = async () => {
    try {
      const response = await getCategories();

      const categoryData =
        response?.data ||
        response?.categories ||
        response ||
        [];

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : []
      );
    } catch (err) {
      console.error("Load categories error:", err);

      setCategories([]);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredProducts = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    if (!value) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name
          ?.toLowerCase()
          .includes(value) ||

        product.sku
          ?.toLowerCase()
          .includes(value) ||

        product.category?.name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [products, search]);


  // ==========================================================
  // OPEN ADD
  // ==========================================================

  const openAdd = () => {
    setForm({
      ...emptyForm,
    });

    setSelectedProduct(null);
    setError("");

    setModal("form");
  };


  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const openEdit = (product) => {
    setSelectedProduct(product);

    setForm({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",

      categoryId:
        product.categoryId ?? "",

      quantity:
        product.quantity ?? "",

      price:
        product.price ?? "",

      costPrice:
        product.costPrice ?? "",

      minStock:
        product.minStock ?? "",
    });

    setError("");

    setModal("form");
  };


  // ==========================================================
  // OPEN VIEW
  // ==========================================================

  const openView = (product) => {
    setSelectedProduct(product);

    setModal("view");
  };


  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModal(null);

    setSelectedProduct(null);

    setForm({
      ...emptyForm,
    });
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

    if (!form.name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (!form.sku.trim()) {
      toast.error("SKU is required.");
      return;
    }

    if (Number(form.quantity || 0) < 0) {
      toast.error(
        "Initial stock cannot be negative."
      );
      return;
    }

    if (Number(form.price || 0) < 0) {
      toast.error(
        "Selling price cannot be negative."
      );
      return;
    }

    if (Number(form.costPrice || 0) < 0) {
      toast.error(
        "Cost price cannot be negative."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),

        sku: form.sku.trim(),

        description:
          form.description.trim() || null,

        categoryId:
          form.categoryId === "" ||
          form.categoryId === null
            ? null
            : Number(form.categoryId),

        quantity:
          Number(form.quantity || 0),

        price:
          Number(form.price || 0),

        costPrice:
          Number(form.costPrice || 0),

        minStock:
          Number(form.minStock || 0),
      };


      // UPDATE

      if (selectedProduct) {
        await updateProduct(
          selectedProduct.id,
          payload
        );

        toast.success(
          "Product updated successfully!"
        );
      }


      // CREATE

      else {
        await createProduct(payload);

        toast.success(
          "Product added successfully!"
        );
      }

      closeModal();

      await loadProducts();

    } catch (err) {
      console.error(
        "Save product error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save product.";

      setError(message);

      toast.error(message);

    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProduct(product.id);

      toast.success(
        "Product deleted successfully!"
      );

      await loadProducts();

    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to delete product.";

      setError(message);

      toast.error(message);
    }
  };


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    await loadProducts();

    toast.success(
      "Products refreshed successfully."
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

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your inventory products.
          </p>
        </div>


        <div className="flex gap-2">

          <button
            type="button"
            onClick={handleRefresh}
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
              shadow-sm
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>


          <button
            type="button"
            onClick={openAdd}
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
              shadow-sm
              transition
              hover:bg-slate-800
            "
          >
            <Plus className="h-4 w-4" />

            Add Product
          </button>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-red-200
          bg-red-50
          p-4
          text-sm
          text-red-700
        ">

          <AlertTriangle className="h-5 w-5 shrink-0" />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError("")}
            className="
              ml-auto
              rounded-md
              p-1
              transition
              hover:bg-red-100
            "
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      )}


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
      ">

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
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search product, SKU or category..."
            className="
              h-11
              w-full
              rounded-lg
              border
              border-slate-200
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
              focus:ring-slate-900/10
            "
          />

        </div>

      </div>


      {/* ======================================================
          PRODUCT TABLE
      ====================================================== */}

      <div className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      ">

        {loading ? (

          <div className="
            flex
            items-center
            justify-center
            py-16
            text-slate-500
          ">

            <RefreshCw
              className="
                mr-2
                h-5
                w-5
                animate-spin
              "
            />

            Loading products...

          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="py-16 text-center">

            <Package
              className="
                mx-auto
                mb-3
                h-10
                w-10
                text-slate-300
              "
            />

            <p className="font-medium text-slate-700">
              No products found.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Add your first product to get started.
            </p>

            <button
              type="button"
              onClick={openAdd}
              className="
                mt-4
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
              Add Product
            </button>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="
              w-full
              min-w-[1000px]
              text-left
              text-sm
            ">

              <thead className="
                border-b
                border-slate-200
                bg-slate-50
              ">

                <tr>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Product
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    SKU
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Category
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Cost
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Price
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Stock
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-slate-600">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredProducts.map(
                  (product) => {

                    const quantity =
                      Number(
                        product.quantity || 0
                      );

                    const minimum =
                      Number(
                        product.minStock || 0
                      );

                    const outOfStock =
                      quantity <= 0;

                    const lowStock =
                      !outOfStock &&
                      quantity <= minimum;


                    return (
                      <tr
                        key={product.id}
                        className="
                          transition
                          hover:bg-slate-50
                        "
                      >

                        <td className="px-5 py-4">

                          <div className="
                            font-semibold
                            text-slate-900
                          ">
                            {product.name}
                          </div>

                          {product.description && (
                            <div className="
                              mt-1
                              max-w-xs
                              truncate
                              text-xs
                              text-slate-400
                            ">
                              {product.description}
                            </div>
                          )}

                        </td>


                        <td className="
                          px-5
                          py-4
                          text-slate-600
                        ">
                          {product.sku || "-"}
                        </td>


                        <td className="
                          px-5
                          py-4
                          text-slate-600
                        ">
                          {product.category?.name ||
                            product.categoryName ||
                            "-"}
                        </td>


                        <td className="
                          px-5
                          py-4
                          text-slate-700
                        ">
                          ₹
                          {Number(
                            product.costPrice || 0
                          ).toLocaleString("en-IN")}
                        </td>


                        <td className="
                          px-5
                          py-4
                          font-semibold
                          text-slate-900
                        ">
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString("en-IN")}
                        </td>


                        <td className="
                          px-5
                          py-4
                          font-semibold
                          text-slate-900
                        ">
                          {quantity}
                        </td>


                        <td className="px-5 py-4">

                          {outOfStock ? (

                            <span className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-full
                              bg-red-100
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              text-red-700
                            ">

                              <XCircle className="h-3.5 w-3.5" />

                              Out of Stock

                            </span>

                          ) : lowStock ? (

                            <span className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-full
                              bg-amber-100
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              text-amber-700
                            ">

                              <AlertTriangle className="h-3.5 w-3.5" />

                              Low Stock

                            </span>

                          ) : (

                            <span className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-full
                              bg-emerald-100
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              text-emerald-700
                            ">
                              In Stock
                            </span>

                          )}

                        </td>


                        <td className="px-5 py-4">

                          <div className="
                            flex
                            justify-end
                            gap-1
                          ">

                            <button
                              type="button"
                              onClick={() =>
                                openView(product)
                              }
                              title="View"
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
                                openEdit(product)
                              }
                              title="Edit"
                              className="
                                rounded-lg
                                p-2
                                text-blue-600
                                transition
                                hover:bg-blue-50
                              "
                            >
                              <Pencil className="h-4 w-4" />
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(product)
                              }
                              title="Delete"
                              className="
                                rounded-lg
                                p-2
                                text-red-600
                                transition
                                hover:bg-red-50
                              "
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ======================================================
          ADD / EDIT MODAL
          IMPORTANT:
          Modal follows sidebar width dynamically.
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

            <div className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-200
              bg-white
              px-5
              py-4
              sm:px-7
              sm:py-5
            ">

              <div>

                <h2 className="
                  text-lg
                  font-bold
                  text-slate-900
                  sm:text-xl
                ">
                  {selectedProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                  sm:text-sm
                ">
                  {selectedProduct
                    ? "Update product information below."
                    : "Enter product information below."}
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


            {/* SCROLLABLE FORM */}

            <form
              onSubmit={handleSubmit}
              className="
                min-h-0
                flex-1
                overflow-y-auto
              "
            >

              <div className="
                px-5
                py-5
                sm:px-7
                sm:py-6
              ">

                <div className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                ">

                  {/* PRODUCT NAME */}

                  <FormField
                    label="Product Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                  />


                  {/* SKU */}

                  <FormField
                    label="SKU"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                    required
                  />


                  {/* CATEGORY */}

                  <div>

                    <label className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    ">
                      Category
                    </label>

                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-slate-300
                        bg-white
                        px-3
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
                        Select category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        )
                      )}

                    </select>

                  </div>


                  {/* INITIAL STOCK */}

                  <FormField
                    label="Initial Stock"
                    name="quantity"
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="0"
                  />


                  {/* COST */}

                  <FormField
                    label="Cost Price"
                    name="costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />


                  {/* SELLING PRICE */}

                  <FormField
                    label="Selling Price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />


                  {/* MINIMUM STOCK */}

                  <FormField
                    label="Minimum Stock"
                    name="minStock"
                    type="number"
                    min="0"
                    value={form.minStock}
                    onChange={handleChange}
                    placeholder="5"
                  />


                  {/* DESCRIPTION */}

                  <div className="md:col-span-2">

                    <label className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    ">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Enter product description..."
                      className="
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-slate-300
                        bg-white
                        px-3
                        py-3
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-slate-900
                        focus:ring-2
                        focus:ring-slate-900/10
                      "
                    />

                  </div>

                </div>

              </div>


              {/* FOOTER */}

              <div className="
                sticky
                bottom-0
                flex
                shrink-0
                justify-end
                gap-3
                border-t
                border-slate-200
                bg-white
                px-5
                py-4
                sm:px-7
              ">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="
                    rounded-lg
                    border
                    border-slate-300
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
                    shadow-sm
                    transition
                    hover:bg-slate-800
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving
                    ? "Saving..."
                    : selectedProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* ======================================================
          VIEW PRODUCT MODAL
      ====================================================== */}

      {modal === "view" && selectedProduct && (

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
              max-w-xl
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

            <div className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-200
              px-5
              py-4
              sm:px-6
              sm:py-5
            ">

              <div>

                <h2 className="
                  text-lg
                  font-bold
                  text-slate-900
                  sm:text-xl
                ">
                  Product Details
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                  sm:text-sm
                ">
                  View product information
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


            {/* DETAILS */}

            <div className="
              min-h-0
              flex-1
              overflow-y-auto
            ">

              <div className="
                grid
                gap-4
                p-5
                sm:grid-cols-2
                sm:p-6
              ">

                <Detail
                  label="Product Name"
                  value={
                    selectedProduct.name
                  }
                />

                <Detail
                  label="SKU"
                  value={
                    selectedProduct.sku
                  }
                />

                <Detail
                  label="Category"
                  value={
                    selectedProduct.category?.name ||
                    selectedProduct.categoryName ||
                    "-"
                  }
                />

                <Detail
                  label="Stock"
                  value={
                    selectedProduct.quantity
                  }
                />

                <Detail
                  label="Cost Price"
                  value={`₹${Number(
                    selectedProduct.costPrice || 0
                  ).toLocaleString("en-IN")}`}
                />

                <Detail
                  label="Selling Price"
                  value={`₹${Number(
                    selectedProduct.price || 0
                  ).toLocaleString("en-IN")}`}
                />

                <Detail
                  label="Minimum Stock"
                  value={
                    selectedProduct.minStock
                  }
                />

                <div className="sm:col-span-2">

                  <Detail
                    label="Description"
                    value={
                      selectedProduct.description ||
                      "No description"
                    }
                  />

                </div>

              </div>

            </div>


            {/* FOOTER */}

            <div className="
              flex
              shrink-0
              justify-end
              border-t
              border-slate-200
              px-5
              py-4
              sm:px-6
            ">

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


// ============================================================
// FORM FIELD
// ============================================================

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  min,
  step,
}) => {
  return (
    <div>

      <label className="
        mb-2
        block
        text-sm
        font-semibold
        text-slate-700
      ">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>


      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="
          h-11
          w-full
          rounded-lg
          border
          border-slate-300
          bg-white
          px-3
          text-sm
          text-slate-900
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-slate-900
          focus:ring-2
          focus:ring-slate-900/10
        "
      />

    </div>
  );
};


// ============================================================
// DETAIL
// ============================================================

const Detail = ({
  label,
  value,
}) => {
  return (
    <div className="
      rounded-xl
      border
      border-slate-200
      bg-slate-50
      p-4
    ">

      <p className="
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-slate-400
      ">
        {label}
      </p>

      <p className="
        mt-1
        break-words
        text-sm
        font-semibold
        text-slate-800
      ">
        {value || "-"}
      </p>

    </div>
  );
};


export default Products;