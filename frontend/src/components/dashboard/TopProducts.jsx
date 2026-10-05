import React from "react";

const TopProducts = ({ products = [] }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">
          Top Products
        </h2>

        <p className="text-sm text-slate-500">
          Best performing products
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">
          No product sales available
        </div>
      ) : (
        <div className="space-y-4">
          {products.slice(0, 5).map((product, index) => (
            <div
              key={product.id || index}
              className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                  {index + 1}
                </div>

                <div>
                  <p className="font-medium text-slate-900">
                    {product.name || "Unknown Product"}
                  </p>

                  <p className="text-xs text-slate-500">
                    Sold: {product.quantity || 0}
                  </p>
                </div>
              </div>

              <p className="font-semibold text-slate-900">
                ₹{Number(product.revenue || 0).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProducts;