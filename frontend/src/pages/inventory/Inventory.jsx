import React, { useEffect, useState } from "react";
import {
  Boxes,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";

import {
  getInventory,
  getLowStock,
} from "../../services/inventoryService";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const [inventoryResponse, lowStockResponse] =
        await Promise.all([
          getInventory(),
          getLowStock(),
        ]);

      setInventory(
        inventoryResponse?.data ||
          inventoryResponse?.products ||
          inventoryResponse ||
          []
      );

      setLowStock(
        lowStockResponse?.data ||
          lowStockResponse?.products ||
          lowStockResponse ||
          []
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const totalStock = inventory.reduce(
    (sum, product) =>
      sum + Number(product.quantity || 0),
    0
  );

  const outOfStock = inventory.filter(
    (product) => Number(product.quantity || 0) <= 0
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor stock levels and inventory health.
          </p>
        </div>

        <button
          onClick={loadInventory}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStock.toLocaleString("en-IN")}
          </p>

          <Boxes className="mt-3 h-5 w-5 text-blue-600" />
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-700">
            Low Stock Products
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-900">
            {lowStock.length}
          </p>

          <AlertTriangle className="mt-3 h-5 w-5 text-amber-600" />
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">
            Out of Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-red-900">
            {outOfStock}
          </p>

          <XCircle className="mt-3 h-5 w-5 text-red-600" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            Loading inventory...
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
                    Current Stock
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Minimum Stock
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {inventory.map((product) => {
                  const quantity = Number(
                    product.quantity || 0
                  );

                  const minimum = Number(
                    product.minStock || 0
                  );

                  const out = quantity <= 0;
                  const low =
                    !out && quantity <= minimum;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {product.name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {product.sku || "-"}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {quantity}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {minimum}
                      </td>

                      <td className="px-5 py-4">
                        {out ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Out of Stock
                          </span>
                        ) : low ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Healthy
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

export default Inventory;