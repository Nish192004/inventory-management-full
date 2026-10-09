import React, { useEffect, useRef, useState } from "react";

import {
  Menu,
  Package,
  Search,
  X,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Users,
  Building2,
  Tags,
  PackageSearch,
  BarChart3,
  LogOut,
  ShieldCheck,
  Mail,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { getCurrentUser } from "../../services/authService";


// ============================================================
// HELPERS
// ============================================================

// "STAFF" / "staff" -> "Staff"
const formatRole = (role) => {
  if (!role) return "User";
  const value = String(role).toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// Role badge colours (light dropdown background)
const ROLE_STYLES = {
  admin: "bg-slate-900 text-white ring-slate-900",
  manager: "bg-blue-50 text-blue-700 ring-blue-200",
  staff: "bg-slate-100 text-slate-700 ring-slate-200",
};

const getRoleStyle = (role) =>
  ROLE_STYLES[String(role || "").toLowerCase()] ||
  "bg-slate-100 text-slate-700 ring-slate-200";


const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  // ==========================================================
  // USER
  // ==========================================================

  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // used to close the dropdown on outside click / Esc
  const profileRef = useRef(null);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // ==========================================================
  // LOAD USER
  // ==========================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser =
          localStorage.getItem("user") ||
          localStorage.getItem("authUser") ||
          localStorage.getItem("currentUser") ||
          localStorage.getItem("userData");

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);

            const currentUser =
              parsedUser?.user ||
              parsedUser?.data ||
              parsedUser;

            if (currentUser) {
              setUser(currentUser);
            }
          } catch (error) {
            console.log("Invalid stored user data.");
          }
        }

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");

        if (!token) {
          return;
        }

        try {
          const response = await getCurrentUser();

          const profile =
            response?.data?.data ||
            response?.data?.user ||
            response?.data ||
            response?.user ||
            response;

          if (profile) {
            setUser(profile);
          }
        } catch (error) {
          console.log(
            "Could not load profile:",
            error?.response?.data?.message ||
              error?.message
          );
        }
      } catch (error) {
        console.error("Load user error:", error);
      }
    };

    loadUser();
  }, []);

  // ==========================================================
  // CLOSE PROFILE MENU: outside click + Esc
  // ==========================================================

  useEffect(() => {
    if (!showProfile) return;

    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showProfile]);

  // ==========================================================
  // USER INFORMATION
  // ==========================================================

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "User";

  const rawRole = user?.role;
  const userRole = formatRole(rawRole);
  const userEmail = user?.email || "";

  const userInitial =
    userName?.charAt(0)?.toUpperCase() || "U";

  // ==========================================================
  // GLOBAL SEARCH
  // ==========================================================

  useEffect(() => {
    const searchGlobal = async () => {
      const query = search.trim();

      if (!query) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        setSearchLoading(true);
        setShowSearchResults(true);

        const response = await api.get("/search", {
          params: { q: query },
        });

        const results =
          response?.data?.data ||
          response?.data?.results ||
          response?.data ||
          [];

        setSearchResults(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error("Global search error:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timer = setTimeout(searchGlobal, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // ==========================================================
  // SEARCH RESULT ICON
  // ==========================================================

  const getSearchIcon = (type) => {
    switch (type) {
      case "product":
        return Package;
      case "inventory":
        return PackageSearch;
      case "sale":
        return ShoppingCart;
      case "purchase":
        return ShoppingBag;
      case "supplier":
        return Building2;
      case "customer":
        return Users;
      case "category":
        return Tags;
      case "report":
        return BarChart3;
      case "dashboard":
        return LayoutDashboard;
      default:
        return Search;
    }
  };

  // ==========================================================
  // SEARCH RESULT CLICK
  // ==========================================================

  const handleSearchResultClick = (result) => {
    if (!result) {
      return;
    }

    if (result.url) {
      navigate(result.url);
    }

    setSearch("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // ==========================================================
  // CLEAR SEARCH
  // ==========================================================

  const clearSearch = () => {
    setSearch("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");

    localStorage.removeItem("user");
    localStorage.removeItem("authUser");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userData");

    setUser(null);
    setShowProfile(false);

    navigate("/login");
  };

  // ==========================================================
  // NAVBAR
  // ==========================================================

  return (
    <>
      <style>
        {`
          @keyframes navbarMenuIn {
            from { opacity: 0; transform: translateY(-6px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }

          .navbar-menu-in {
            animation: navbarMenuIn 0.15s ease-out;
            transform-origin: top right;
          }

          @media (prefers-reduced-motion: reduce) {
            .navbar-menu-in { animation: none; }
          }
        `}
      </style>

      <nav className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-slate-800 bg-slate-950 text-white shadow-sm">
        <div className="flex h-full w-full min-w-0 items-center justify-between gap-2 px-2 sm:px-4 lg:pr-6">

          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3">

            {/* HAMBURGER */}
            <button
              type="button"
              onClick={onMenuClick}
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700"
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>

            {/* BRAND */}
            <div className="flex min-w-0 items-center gap-2">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950 shadow-sm sm:h-10 sm:w-10">
                <Package className="h-5 w-5" strokeWidth={2.3} />
              </div>

              <div className="hidden min-w-0 sm:block">
                <div className="truncate text-lg font-bold leading-none tracking-tight text-white">
                  Inventory
                  <span className="text-blue-400">Pro</span>
                </div>

                <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Management
                </div>
              </div>

            </div>
          </div>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <div className="relative mx-2 hidden min-w-0 max-w-xl flex-1 md:block lg:mx-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => {
                  if (search.trim()) {
                    setShowSearchResults(true);
                  }
                }}
                placeholder="Search products, sales, customers, suppliers..."
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-slate-700/50"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* SEARCH RESULTS */}
            {showSearchResults && (
              <div className="absolute left-0 right-0 top-12 z-[100] max-h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                {searchLoading ? (
                  <div className="px-4 py-5 text-center">
                    <p className="text-sm text-slate-500">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Search className="mx-auto h-5 w-5 text-slate-400" />

                    <p className="mt-2 text-sm font-medium text-slate-700">
                      No results found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try another search.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto py-2">
                    {searchResults.map((result, index) => {
                      const Icon = getSearchIcon(result.type);

                      return (
                        <button
                          key={`${result.type}-${result.id}-${index}`}
                          type="button"
                          onClick={() => handleSearchResultClick(result)}
                          className="flex w-full min-w-0 items-center gap-2 px-3 py-3 text-left transition hover:bg-slate-50 sm:gap-3 sm:px-4"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {result.title || result.name || "Untitled"}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {result.subtitle || result.type || ""}
                            </p>
                          </div>

                          <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:inline-flex">
                            {result.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ==================================================
              RIGHT SIDE / USER
          ================================================== */}

          <div className="flex shrink-0 items-center">

            {/* thin divider between search area and profile */}
            <div className="mr-3 hidden h-8 w-px bg-slate-800 lg:block" />

            <div ref={profileRef} className="relative">

              {/* TRIGGER */}
              <button
                type="button"
                onClick={() => setShowProfile((previous) => !previous)}
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={showProfile}
                className={`flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-1.5 transition hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 lg:pr-3 ${
                  showProfile ? "bg-slate-800/80" : ""
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white ring-1 ring-slate-600">
                  {userInitial}
                </div>

                <div className="hidden text-left lg:block">
                  <p className="max-w-[140px] truncate text-sm font-semibold leading-tight text-white">
                    {userName}
                  </p>

                  <p className="mt-0.5 text-xs leading-tight text-slate-400">
                    {userRole}
                  </p>
                </div>

                <ChevronDown
                  className={`hidden h-4 w-4 text-slate-400 transition-transform duration-200 lg:block ${
                    showProfile ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ==================================================
                  PROFILE DROPDOWN
              ================================================== */}

              {showProfile && (
                <div
                  role="menu"
                  className="navbar-menu-in absolute right-0 top-full z-[100] mt-2 w-[calc(100vw-1rem)] max-w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 sm:w-80"
                >

                  {/* HEADER */}
                  <div className="border-b border-slate-100 bg-slate-50 px-5 py-5">
                    <div className="flex items-center gap-3.5">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white ring-4 ring-white">
                        {userInitial}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {userName}
                        </p>

                        <span
                          className={`mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getRoleStyle(
                            rawRole
                          )}`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {userRole}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="px-5 py-4">
                    <p className="text-xs font-medium text-slate-400">
                      Email
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-700">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" />

                      <span className="truncate">
                        {userEmail || "Not provided"}
                      </span>
                    </div>
                  </div>

                  {/* SIGN OUT */}
                  <div className="border-t border-slate-100 p-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:bg-red-50 focus-visible:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      </nav>
    </>
  );
};

export default Navbar;