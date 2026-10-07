import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCurrentUser();

        const profile =
          response?.data?.data ||
          response?.data?.user ||
          response?.data ||
          response?.user ||
          response;

        if (profile) {
          setUser(profile);

          // Keep localStorage user data updated
          localStorage.setItem("user", JSON.stringify(profile));
        } else {
          setError("Unable to load profile.");
        }
      } catch (err) {
        console.error("Profile loading error:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Admin User";

  const userEmail = user?.email || "No email available";

  const userRole = user?.role || "ADMIN";

  const userInitial =
    userName?.charAt(0)?.toUpperCase() || "A";

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-700" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Unable to load profile
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View your account information and profile details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Profile Header */}
          <div className="border-b border-slate-200 bg-slate-950 px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-950 shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
                {userInitial}
              </div>

              {/* Name */}
              <div className="min-w-0 text-center sm:text-left">
                <h2 className="truncate text-xl font-bold text-white sm:text-2xl">
                  {userName}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-400">
                  {userEmail}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-300" />

                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-200">
                    {userRole}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Account Status
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Your InventoryPro account is currently active.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />

                <span className="text-xs font-bold text-green-700">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <h3 className="mb-5 text-base font-bold text-slate-900">
              Account Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Full Name
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                      {userName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                    <Mail className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Email Address
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                    <Shield className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Account Role
                    </p>

                    <p className="mt-1 text-sm font-semibold uppercase text-slate-900">
                      {userRole}
                    </p>
                  </div>
                </div>
              </div>

              {/* Created At */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                    <Calendar className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Member Since
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {createdAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-8">
            <p className="text-center text-xs text-slate-500 sm:text-left">
              Profile information is retrieved securely from your InventoryPro
              account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;