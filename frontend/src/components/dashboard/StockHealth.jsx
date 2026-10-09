import React from "react";


// ============================================================
// STOCK HEALTH
// loading     -> shows a pulse skeleton (first load only)
// refreshing  -> dims the card while the dashboard reloads
// ============================================================

const StockHealth = ({
  totalStock = 0,
  lowStock = 0,
  outOfStock = 0,
  loading = false,
  refreshing = false,
}) => {
  const total = Number(totalStock || 0);
  const low = Number(lowStock || 0);
  const out = Number(outOfStock || 0);

  const rows = [
    {
      label: "Available Stock",
      value: total.toLocaleString("en-IN"),
      valueClass: "text-slate-900",
      barClass: "bg-emerald-500",
      width: "100%",
    },
    {
      label: "Low Stock Products",
      value: low.toLocaleString("en-IN"),
      valueClass: "text-amber-700",
      barClass: "bg-amber-500",
      width: `${Math.min(low * 10, 100)}%`,
    },
    {
      label: "Out of Stock",
      value: out.toLocaleString("en-IN"),
      valueClass: "text-red-700",
      barClass: "bg-red-500",
      width: `${Math.min(out * 10, 100)}%`,
    },
  ];

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="border-b border-slate-200 px-5 py-4">

        <h3 className="font-semibold text-slate-900">
          Stock Health
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Current inventory condition.
        </p>

      </div>

      {loading ? (

        /* FIRST LOAD SKELETON */
        <div className="animate-pulse space-y-5 px-5 py-5">

          {rows.map((row) => (
            <div key={row.label}>

              <div className="mb-2 flex items-center justify-between">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-4 w-10 rounded bg-slate-200" />
              </div>

              <div className="h-2 w-full rounded-full bg-slate-200" />

            </div>
          ))}

        </div>

      ) : (

        <div
          className={`space-y-5 px-5 py-5 transition-opacity duration-200 ${
            refreshing ? "opacity-70" : "opacity-100"
          }`}
        >

          {rows.map((row) => (
            <div key={row.label} className="min-w-0">

              <div className="mb-2 flex items-center justify-between gap-3 text-sm">

                <span className="min-w-0 break-words text-slate-600">
                  {row.label}
                </span>

                <span className={`shrink-0 font-semibold ${row.valueClass}`}>
                  {row.value}
                </span>

              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${row.barClass}`}
                  style={{ width: row.width }}
                />
              </div>

            </div>
          ))}

        </div>

      )}

    </div>
  );
};

export default StockHealth;