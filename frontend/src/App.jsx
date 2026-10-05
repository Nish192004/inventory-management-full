import React, { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import DashboardDetails from "./pages/dashboard/DashboardDetails";

import Products from "./pages/products/Products";
import Inventory from "./pages/inventory/Inventory";
import Sales from "./pages/sales/Sales";
import Purchases from "./pages/purchases/Purchases";
import Suppliers from "./pages/suppliers/Suppliers";
import Customers from "./pages/customers/Customers";
import Categories from "./pages/categories/Categories";
import Reports from "./pages/reports/Reports";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";


// ============================================================
// APP LAYOUT
// ============================================================

const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  /*
   * Sidebar widths:
   *
   * Open      = 16rem = 256px
   * Collapsed = 5rem  = 80px
   *
   * This CSS variable is also used by page modals.
   */

  const sidebarWidth = sidebarCollapsed
    ? "5rem"
    : "16rem";


  return (
    <div
      className="h-screen overflow-hidden bg-slate-50"
      style={{
        "--sidebar-width": sidebarWidth,
      }}
    >

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <Navbar
        onMenuClick={() =>
          setSidebarCollapsed(
            (previous) => !previous
          )
        }
      />


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        collapsed={sidebarCollapsed}
      />


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className={`
          fixed
          bottom-0
          right-0
          top-16
          overflow-y-auto
          overflow-x-hidden
          bg-slate-50
          transition-all
          duration-300
          ${sidebarCollapsed
            ? "left-20"
            : "left-64"
          }
        `}
      >

        <div
          className="
            mx-auto
            w-full
            max-w-[1600px]
            px-4
            py-6
            md:px-6
            lg:px-8
          "
        >
          {children}
        </div>

      </main>

    </div>
  );
};


// ============================================================
// PROTECTED LAYOUT
// ============================================================

const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <AppLayout>
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
};


// ============================================================
// APP
// ============================================================

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* ====================================================
            AUTH
        ==================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* ====================================================
            DASHBOARD
        ==================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />


        {/* ====================================================
            DASHBOARD DETAILS
        ==================================================== */}

        <Route
          path="/dashboard/products"
          element={
            <ProtectedLayout>
              <DashboardDetails
                type="products"
              />
            </ProtectedLayout>
          }
        />

        <Route
          path="/dashboard/stock"
          element={
            <ProtectedLayout>
              <DashboardDetails
                type="stock"
              />
            </ProtectedLayout>
          }
        />

        <Route
          path="/dashboard/sales"
          element={
            <ProtectedLayout>
              <DashboardDetails
                type="sales"
              />
            </ProtectedLayout>
          }
        />

        <Route
          path="/dashboard/revenue"
          element={
            <ProtectedLayout>
              <DashboardDetails
                type="revenue"
              />
            </ProtectedLayout>
          }
        />


        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        <Route
          path="/products"
          element={
            <ProtectedLayout>
              <Products />
            </ProtectedLayout>
          }
        />


        {/* ====================================================
            INVENTORY
        ==================================================== */}

        <Route
          path="/inventory"
          element={
            <ProtectedLayout>
              <Inventory />
            </ProtectedLayout>
          }
        />


        {/* ====================================================
            SALES
        ==================================================== */}

        <Route
          path="/sales"
          element={
            <ProtectedLayout>
              <Sales />
            </ProtectedLayout>
          }
        />


        {/* ====================================================
            PURCHASES
        ==================================================== */}

        <Route
          path="/purchases"
          element={
            <ProtectedLayout>
              <Purchases />
            </ProtectedLayout>
          }
        />


        {/* ====================================================
            SUPPLIERS
        ==================================================== */}

        <Route
          path="/suppliers"
          element={
            <ProtectedLayout>
              <Suppliers />
            </ProtectedLayout>
          }
        />


        {/* ====================================================
            CUSTOMERS
        ==================================================== */}

        <Route
          path="/customers"
          element={
            <ProtectedLayout>
              <Customers />
            </ProtectedLayout>
          }
        />


        {/* ====================================================
            CATEGORIES
        ==================================================== */}

        <Route
          path="/categories"
          element={
            <ProtectedLayout>
              <Categories />
            </ProtectedLayout>
          }
        />


        {/* ====================================================
            REPORTS
        ==================================================== */}

        <Route
          path="/reports"
          element={
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          }
        />


        {/* ====================================================
            DEFAULT
        ==================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
};


export default App;