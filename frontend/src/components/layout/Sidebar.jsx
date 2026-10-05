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
} from "lucide-react";

import { NavLink } from "react-router-dom";


const Sidebar = ({ collapsed = false }) => {
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
    <aside
      className={`
        fixed
        left-0
        top-16
        bottom-0
        z-40
        border-r
        border-slate-800
        bg-slate-950
        text-white
        transition-all
        duration-300
        ease-in-out
        ${
          collapsed
            ? "w-20"
            : "w-64"
        }
      `}
    >

      <nav
        className={`
          h-full
          overflow-y-auto
          py-5
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
                className={({ isActive }) => `
                  group
                  flex
                  h-11
                  items-center
                  rounded-lg
                  transition-all
                  duration-200

                  ${
                    collapsed
                      ? "justify-center"
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

                {!collapsed && (
                  <span className="text-sm font-medium">
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
  );
};

export default Sidebar;