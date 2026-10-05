import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  ShoppingCart,
  Search,
} from "lucide-react";

import { getSales } from "../../services/saleService";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load sales."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const filteredSales = sales.filter((sale) => {
    const value = search.toLowerCase();

    return (
      sale.invoiceNumber
        ?.toLowerCase()
        .includes(value) ||
      sale.customer?.name
        ?.toLowerCase()
        .includes(value)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sales
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage sales and invoices.
          </p>
        </div>

        <button
          onClick={loadSales}
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
            placeholder="Search invoice or customer..."
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
            Loading sales...
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            No sales found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Invoice
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Customer
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Items
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Total
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {sale.invoiceNumber ||
                        sale.invoice ||
                        sale.id}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {sale.customer?.name ||
                        sale.customerName ||
                        "Walk-in Customer"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {sale.items?.length ||
                        sale.saleItems?.length ||
                        0}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      ₹
                      {Number(
                        sale.total || sale.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;