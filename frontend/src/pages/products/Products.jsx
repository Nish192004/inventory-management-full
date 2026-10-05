import React, { useEffect, useState } from "react";
import {
  Package,
  Search,
  RefreshCw,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import api from "../../services/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      const result = response.data;

      setProducts(
        result?.data ||
          result?.products ||
          result ||
          []
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const value = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(value) ||
      product.sku?.toLowerCase().includes(value) ||
      product.category?.name?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your inventory products.
          </p>
        </div>

        <button
          onClick={loadProducts}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search by product name, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
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
                    Price
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Stock
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const quantity = Number(
                    product.quantity || 0
                  );

                  const minStock = Number(
                    product.minStock || 0
                  );

                  let status = "In Stock";

                  if (quantity <= 0) {
                    status = "Out of Stock";
                  } else if (quantity <= minStock) {
                    status = "Low Stock";
                  }

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {product.name}
                        </div>

                        {product.description && (
                          <div className="mt-1 max-w-xs truncate text-xs text-slate-400">
                            {product.description}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {product.sku || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {product.category?.name ||
                          product.categoryName ||
                          "-"}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-900">
                        ₹
                        {Number(
                          product.price || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-900">
                        {quantity}
                      </td>

                      <td className="px-5 py-4">
                        {status === "Out of Stock" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            <XCircle className="h-3.5 w-3.5" />
                            Out of Stock
                          </span>
                        ) : status === "Low Stock" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;