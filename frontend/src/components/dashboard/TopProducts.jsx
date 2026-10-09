import React from "react";

import { Package } from "lucide-react";


// ============================================================
// TOP PRODUCTS
// loading     -> shows a pulse skeleton (first load only)
// refreshKey  -> changes after every dashboard refresh so rows
//                replay their fade-in animation
// refreshing  -> dims the list while the dashboard reloads
// ============================================================

const TopProducts = ({
  products = [],
  loading = false,
  refreshKey = 0,
  refreshing = false,
}) => {
  const items = Array.isArray(products) ? products.slice(0, 5) : [];

  return (
    <>
      <style>
        {`
          @keyframes topProductsRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .top-products-row-in {
            animation: topProductsRowIn 0.3s ease-out both;
          }

          @media (prefers-reduced-motion: reduce) {
            .top-products-row-in {
              animation: none;
            }
          }
        `}
      </style>

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}
        <div className="border-b border-slate-200 px-5 py-4">

          <h3 className="font-semibold text-slate-900">
            Top Products
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Best performing products.
          </p>

        </div>

        {loading ? (

          /* FIRST LOAD SKELETON */
          <div className="animate-pulse divide-y divide-slate-100">

            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 px-5 py-4"
              >

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-200" />

                  <div>
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-16 rounded bg-slate-100" />
                  </div>
                </div>

                <div className="h-4 w-20 rounded bg-slate-200" />

              </div>
            ))}

          </div>

        ) : items.length === 0 ? (

          <div className="py-16 text-center">

            <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" />

            <p className="font-medium text-slate-700">
              No product sales available.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Top products will appear here once sales are made.
            </p>

          </div>

        ) : (

          <div
            className={`divide-y divide-slate-100 transition-opacity duration-200 ${
              refreshing ? "opacity-70" : "opacity-100"
            }`}
          >

            {items.map((product, index) => (
              <div
                key={`${product.id || index}-${refreshKey}`}
                className="top-products-row-in flex min-w-0 items-center justify-between gap-3 px-5 py-4 transition hover:bg-slate-50"
                style={{
                  animationDelay: `${Math.min(index, 12) * 30}ms`,
                }}
              >

                {/* PRODUCT INFORMATION */}
                <div className="flex min-w-0 flex-1 items-center gap-3">

                  {/* RANK */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                    {index + 1}
                  </div>

                  {/* NAME + QUANTITY */}
                  <div className="min-w-0 flex-1">

                    <p className="break-words font-semibold text-slate-900">
                      {product.name || "Unknown Product"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Sold: {Number(product.quantity || 0).toLocaleString("en-IN")}
                    </p>

                  </div>

                </div>

                {/* REVENUE */}
                <p className="shrink-0 text-right font-bold text-slate-900">
                  ₹{Number(product.revenue || 0).toLocaleString("en-IN")}
                </p>

              </div>
            ))}

          </div>

        )}

      </div>
    </>
  );
};

export default TopProducts;