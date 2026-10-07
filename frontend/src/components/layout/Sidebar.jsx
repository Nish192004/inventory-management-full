import React from "react";

import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  ShoppingBag,
  Building2,
  Users,
  Tags,
  BarChart3,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const Sidebar = ({
  collapsed = false,
  mobileOpen = false,
  onMobileClose,
}) => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: Warehouse,
    },
    {
      name: "Sales",
      path: "/sales",
      icon: ShoppingCart,
    },
    {
      name: "Purchases",
      path: "/purchases",
      icon: ShoppingBag,
    },
    {
      name: "Suppliers",
      path: "/suppliers",
      icon: Building2,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: Users,
    },
    {
      name: "Categories",
      path: "/categories",
      icon: Tags,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="
            fixed
            inset-0
            z-40
            bg-black/50
            backdrop-blur-[1px]
            lg:hidden
          "
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed
          left-0
          top-16
          bottom-0
          z-50
          border-r
          border-slate-800
          bg-slate-950
          text-white
          shadow-xl
          transition-all
          duration-300
          ease-in-out

          w-64

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0

          ${
            collapsed
              ? "lg:w-20"
              : "lg:w-64"
          }
        `}
      >
        {/* =================================================
            MOBILE SIDEBAR HEADER
        ================================================= */}

        <div
          className="
            flex
            h-14
            items-center
            justify-between
            border-b
            border-slate-800
            px-4
            lg:hidden
          "
        >
          <div className="text-sm font-semibold text-white">
            Navigation
          </div>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close sidebar"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-300
              transition
              hover:bg-slate-800
              hover:text-white
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav
          className={`
            h-[calc(100%-3.5rem)]
            overflow-y-auto
            py-4
            lg:h-full
            lg:py-5

            ${
              collapsed
                ? "px-2"
                : "px-3"
            }
          `}
        >
          {/* =================================================
              MAIN NAVIGATION
          ================================================= */}

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={
                    collapsed
                      ? item.name
                      : undefined
                  }
                  onClick={onMobileClose}
                  className={({ isActive }) => `
                    group
                    flex
                    h-11
                    w-full
                    items-center
                    rounded-lg
                    transition-all
                    duration-200

                    ${
                      collapsed
                        ? "lg:justify-center"
                        : "gap-3 px-2"
                    }

                    ${
                      isActive
                        ? `
                          bg-white
                          text-slate-950
                          shadow-sm
                        `
                        : `
                          text-slate-300
                          hover:bg-slate-800
                          hover:text-white
                        `
                    }
                  `}
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    strokeWidth={2}
                  />

                  {/* Desktop collapsed mode */}
                  {!collapsed && (
                    <span className="truncate text-sm font-medium">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* =================================================
              SIDEBAR FOOTER
          ================================================= */}

          <div className="mt-8 border-t border-slate-800 pt-5">
            {!collapsed ? (
              <div className="px-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Inventory Management
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Manage your business
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div
                  title="Inventory Management"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-slate-900
                    text-xs
                    font-bold
                    text-slate-400
                  "
                >
                  IP
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;