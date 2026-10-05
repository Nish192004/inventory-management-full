import React, { useEffect, useState } from "react";

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
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";


const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  // ==========================================================
  // USER
  // ==========================================================

  const [user, setUser] = useState(null);

  const [showProfile, setShowProfile] = useState(false);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  const [searchLoading, setSearchLoading] = useState(false);

  const [showSearchResults, setShowSearchResults] =
    useState(false);


  // ==========================================================
  // LOAD USER
  // ==========================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        // ----------------------------------------------------
        // First try localStorage
        // ----------------------------------------------------

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
            console.log(
              "Invalid stored user data."
            );
          }
        }


        // ----------------------------------------------------
        // Then try backend profile
        // ----------------------------------------------------

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");

        if (!token) {
          return;
        }

        try {
          const response = await api.get(
            "/auth/profile"
          );

          const profile =
            response?.data?.data ||
            response?.data?.user ||
            response?.data;

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
        console.error(
          "Load user error:",
          error
        );
      }
    };

    loadUser();
  }, []);


  // ==========================================================
  // USER INFORMATION
  // ==========================================================

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Admin";

  const userRole =
    user?.role ||
    "ADMIN";

  const userInitial =
    userName
      ?.charAt(0)
      ?.toUpperCase() || "A";


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

        const response = await api.get(
          "/search",
          {
            params: {
              q: query,
            },
          }
        );

        const results =
          response?.data?.data ||
          response?.data?.results ||
          response?.data ||
          [];

        setSearchResults(
          Array.isArray(results)
            ? results
            : []
        );
      } catch (error) {
        console.error(
          "Global search error:",
          error
        );

        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };


    const timer = setTimeout(
      searchGlobal,
      350
    );

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

    navigate("/login");
  };


  // ==========================================================
  // NAVBAR
  // ==========================================================

  return (
    <nav
      className="
        fixed
        left-0
        right-0
        top-0
        z-50
        h-16
        border-b
        border-slate-800
        bg-slate-950
        text-white
        shadow-sm
      "
    >

      <div
        className="
          flex
          h-full
          items-center
          justify-between
          px-3
          sm:px-4
        "
      >

        {/* ==================================================
            LEFT SIDE
        ================================================== */}

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">

          {/* HAMBURGER */}

          <button
            type="button"
            onClick={onMenuClick}
            title="Toggle sidebar"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-white
              transition
              hover:bg-slate-800
              focus:outline-none
              focus:ring-2
              focus:ring-slate-700
            "
          >
            <Menu
              className="h-6 w-6"
              strokeWidth={2}
            />
          </button>


          {/* ==================================================
              INVENTORY PRO BRAND
          ================================================== */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2.5
            "
          >

            {/* LOGO */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white
                text-slate-950
                shadow-sm
              "
            >
              <Package
                className="h-5 w-5"
                strokeWidth={2.3}
              />
            </div>


            {/* BRAND */}

            <div className="hidden min-w-0 sm:block">

              <div
                className="
                  truncate
                  text-lg
                  font-bold
                  leading-none
                  tracking-tight
                  text-white
                "
              >
                Inventory
                <span className="text-blue-400">
                  Pro
                </span>
              </div>

              <div
                className="
                  mt-1
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-slate-500
                "
              >
                Management
              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            SEARCH
        ================================================== */}

        <div
          className="
            relative
            mx-4
            hidden
            max-w-xl
            flex-1
            md:block
          "
        >

          <div className="relative">

            <Search
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-500
              "
            />


            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onFocus={() => {
                if (search.trim()) {
                  setShowSearchResults(true);
                }
              }}
              placeholder="Search products, sales, customers, suppliers..."
              className="
                h-10
                w-full
                rounded-lg
                border
                border-slate-800
                bg-slate-900
                pl-10
                pr-10
                text-sm
                text-white
                outline-none
                transition
                placeholder:text-slate-500
                focus:border-slate-600
                focus:ring-2
                focus:ring-slate-700/50
              "
            />


            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="
                  absolute
                  right-2
                  top-1/2
                  flex
                  h-7
                  w-7
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-md
                  text-slate-400
                  hover:bg-slate-800
                  hover:text-white
                "
              >
                <X className="h-4 w-4" />
              </button>
            )}

          </div>


          {/* ==================================================
              SEARCH RESULTS
          ================================================== */}

          {showSearchResults && (

            <div
              className="
                absolute
                left-0
                right-0
                top-12
                z-[100]
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-2xl
              "
            >

              {searchLoading ? (

                <div className="px-4 py-5 text-center">

                  <p className="text-sm text-slate-500">
                    Searching...
                  </p>

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

                  {searchResults.map(
                    (result, index) => {

                      const Icon =
                        getSearchIcon(
                          result.type
                        );

                      return (
                        <button
                          key={`${result.type}-${result.id}-${index}`}
                          type="button"
                          onClick={() =>
                            handleSearchResultClick(
                              result
                            )
                          }
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            px-4
                            py-3
                            text-left
                            transition
                            hover:bg-slate-50
                          "
                        >

                          <div
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              bg-slate-100
                              text-slate-700
                            "
                          >
                            <Icon className="h-4 w-4" />
                          </div>


                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {result.title ||
                                result.name ||
                                "Untitled"}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {result.subtitle ||
                                result.type ||
                                ""}
                            </p>

                          </div>


                          <span
                            className="
                              shrink-0
                              rounded-full
                              bg-slate-100
                              px-2
                              py-1
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wide
                              text-slate-500
                            "
                          >
                            {result.type}
                          </span>

                        </button>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          )}

        </div>


        {/* ==================================================
            RIGHT SIDE / USER
        ================================================== */}

        <div className="flex shrink-0 items-center">

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setShowProfile(
                  (previous) => !previous
                )
              }
              className="
                flex
                items-center
                gap-2
                rounded-lg
                px-2
                py-1.5
                transition
                hover:bg-slate-800
              "
            >

              {/* AVATAR */}

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-sm
                  font-bold
                  text-slate-950
                "
              >
                {userInitial}
              </div>


              {/* USER NAME */}

              <div className="hidden text-left lg:block">

                <p className="max-w-[130px] truncate text-sm font-semibold text-white">
                  {userName}
                </p>

                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  {userRole}
                </p>

              </div>


              <ChevronDown
                className={`
                  hidden
                  h-4
                  w-4
                  text-slate-400
                  transition-transform
                  lg:block
                  ${
                    showProfile
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </button>


            {/* ==================================================
                PROFILE DROPDOWN
            ================================================== */}

            {showProfile && (

              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-[100]
                  w-64
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  shadow-2xl
                "
              >

                {/* USER INFO */}

                <div className="border-b border-slate-100 px-4 py-4">

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-950
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      {userInitial}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-slate-900">
                        {userName}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {user?.email ||
                          "InventoryPro User"}
                      </p>

                    </div>

                  </div>

                </div>


                {/* ROLE */}

                <div className="px-4 py-3">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-medium text-slate-500">
                      Role
                    </span>

                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-700
                      "
                    >
                      {userRole}
                    </span>

                  </div>

                </div>


                {/* LOGOUT */}

                <div className="border-t border-slate-100 p-2">

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      w-full
                      rounded-lg
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      font-semibold
                      text-red-600
                      transition
                      hover:bg-red-50
                    "
                  >
                    Sign out
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </nav>
  );
};


export default Navbar;