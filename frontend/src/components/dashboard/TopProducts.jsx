import React from "react";

const TopProducts = ({ products = [] }) => {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-5">
      
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          Top Products
        </h2>

        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Best performing products
        </p>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 sm:py-10 sm:text-sm">
          No product sales available
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {products.slice(0, 5).map((product, index) => (
            <div
              key={product.id || index}
              className="
                flex
                min-w-0
                items-center
                justify-between
                gap-3
                border-b
                border-slate-100
                pb-3
                last:border-0
              "
            >
              {/* Product Information */}
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                
                {/* Rank */}
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-slate-100
                    text-xs
                    font-bold
                    text-slate-700
                    sm:h-9
                    sm:w-9
                    sm:text-sm
                  "
                >
                  {index + 1}
                </div>

                {/* Name + Quantity */}
                <div className="min-w-0 flex-1">
                  <p className="break-words text-xs font-medium text-slate-900 sm:text-sm">
                    {product.name || "Unknown Product"}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                    Sold: {product.quantity || 0}
                  </p>
                </div>
              </div>

              {/* Revenue */}
              <p className="shrink-0 text-right text-xs font-semibold text-slate-900 sm:text-sm">
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