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
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-5">
      
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          Stock Health
        </h2>

        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Current inventory condition
        </p>
      </div>

      {/* Stock Information */}
      <div className="space-y-4 sm:space-y-5">

        {/* Available Stock */}
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="min-w-0 break-words text-slate-600">
              Available Stock
            </span>

            <span className="shrink-0 font-semibold text-slate-900">
              {total.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Low Stock */}
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="min-w-0 break-words text-slate-600">
              Low Stock Products
            </span>

            <span className="shrink-0 font-semibold text-amber-600">
              {low}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{
                width: `${Math.min(low * 10, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="min-w-0 break-words text-slate-600">
              Out of Stock
            </span>

            <span className="shrink-0 font-semibold text-red-600">
              {out}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-300"
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