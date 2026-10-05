import React from "react";

const StockHealth = ({
  totalStock = 0,
  lowStock = 0,
  outOfStock = 0,
}) => {
  const total = Number(totalStock || 0);
  const low = Number(lowStock || 0);
  const out = Number(outOfStock || 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">
          Stock Health
        </h2>

        <p className="text-sm text-slate-500">
          Current inventory condition
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-600">Available Stock</span>
            <span className="font-semibold text-slate-900">
              {total.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full rounded-full bg-emerald-500" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-600">Low Stock Products</span>
            <span className="font-semibold text-amber-600">
              {low}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{
                width: `${Math.min(low * 10, 100)}%`,
              }}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-600">Out of Stock</span>
            <span className="font-semibold text-red-600">
              {out}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-red-500"
              style={{
                width: `${Math.min(out * 10, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockHealth;