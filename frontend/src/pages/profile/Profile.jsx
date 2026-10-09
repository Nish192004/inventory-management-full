import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  CalendarDays,
  Hash,
  ArrowLeft,
  Pencil,
  Camera,
  Upload,
  Trash2,
  X,
  CheckCircle2,
  LoaderCircle,
  Building2,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as authService from "../../services/authService";

// ------------------------------------------------------
// HELPERS
// ------------------------------------------------------

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

const extractProfile = (response) =>
  response?.data?.data ||
  response?.data?.user ||
  response?.data ||
  response?.user ||
  response ||
  null;

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

const getExtrasKey = (user) =>
  `profile_extras_${user?.id || user?.email || "current"}`;

const readExtras = (user) => {
  try {
    return JSON.parse(localStorage.getItem(getExtrasKey(user)) || "{}");
  } catch {
    return {};
  }
};

const readCachedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const resizeImage = (file, size = 256) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read the image."));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Invalid image file."));

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const side = Math.min(image.width, image.height);
        const x = (image.width - side) / 2;
        const y = (image.height - side) / 2;

        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Unable to process this image."));
          return;
        }

        context.drawImage(
          image,
          x,
          y,
          side,
          side,
          0,
          0,
          size,
          size
        );

        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

// ------------------------------------------------------
// REUSABLE COMPONENTS
// ------------------------------------------------------

const Avatar = ({ src, name, size = "h-24 w-24", textSize = "text-3xl" }) => (
  <div
    className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-slate-800 to-slate-950 font-bold text-white shadow-lg`}
  >
    {src ? (
      <img
        src={src}
        alt={`${name || "User"} profile`}
        className="h-full w-full object-cover"
      />
    ) : (
      <span className={textSize}>{getInitials(name)}</span>
    )}
  </div>
);

const SectionHeading = ({ icon: Icon, title, description, action }) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <Icon size={19} />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
    {action}
  </div>
);

const InfoCard = ({ icon: Icon, label, value, helper }) => (
  <div className="group flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition group-hover:bg-slate-100">
      <Icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value || "Not provided"}
      </p>
      {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
    </div>
  </div>
);

const Field = ({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  helper,
}) => (
  <div className="min-w-0">
    <label
      htmlFor={`profile-${name}`}
      className="mb-2 block text-sm font-semibold text-slate-700"
    >
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      )}
      <input
        id={`profile-${name}`}
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border py-3 ${Icon ? "pl-10" : "pl-3.5"
          } pr-3.5 text-sm outline-none transition ${disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-700 focus:ring-4 focus:ring-slate-900/5"
          }`}
      />
    </div>
    {helper && <p className="mt-1.5 text-xs text-slate-400">{helper}</p>}
  </div>
);

// ------------------------------------------------------
// PROFILE PAGE
// ------------------------------------------------------

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    designation: "",
    department: "",
    location: "",
    avatar: "",
  });

  // ------------------------------------------------------
  // LOAD PROFILE
  // ------------------------------------------------------

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authService.getCurrentUser();
        const profile = extractProfile(response);

        if (!profile || typeof profile !== "object") {
          throw new Error("Unable to load your profile.");
        }

        const merged = {
          ...readExtras(profile),
          ...profile,
        };

        if (!active) return;

        setUser(merged);
        localStorage.setItem("user", JSON.stringify(merged));
      } catch (err) {
        console.error("Profile loading error:", err);

        const cached = readCachedUser();

        if (!active) return;

        if (cached) {
          setUser({ ...readExtras(cached), ...cached });
        } else {
          setError(
            err?.response?.data?.message ||
            err?.message ||
            "Unable to load your profile. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const userName =
    user?.name || user?.fullName || user?.username || "User";

  const userEmail = user?.email || "";
  const userPhone = user?.phone || "";
  const userDesignation = user?.designation || "";
  const userDepartment = user?.department || "";
  const userLocation = user?.location || "";
  const userAvatar = user?.avatar || user?.photo || "";
  const userRole = String(user?.role || "USER").toUpperCase();

  const roleLabel =
    userRole === "ADMIN"
      ? "Administrator"
      : userRole.charAt(0) + userRole.slice(1).toLowerCase();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "Not available";
  // ------------------------------------------------------
  // PROFILE COMPLETION
  // ------------------------------------------------------

  const profileFields = [
    user?.name || user?.fullName || user?.username,
    userEmail,
    userPhone,
    userDesignation,
    userDepartment,
    userLocation,
    userAvatar,
  ];

  const completion = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );

  // ------------------------------------------------------
  // EDIT PROFILE
  // ------------------------------------------------------

  const openEdit = () => {
    setForm({
      name: user?.name || user?.fullName || user?.username || "",
      phone: userPhone,
      designation: userDesignation,
      department: userDepartment,
      location: userLocation,
      avatar: userAvatar,
    });

    setShowEdit(true);
  };

  const closeEdit = () => {
    if (!saving) setShowEdit(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ------------------------------------------------------
  // PHOTO UPLOAD
  // ------------------------------------------------------

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      toast.error("Photo must be smaller than 2 MB.");
      return;
    }

    try {
      const avatar = await resizeImage(file);

      setForm((previous) => ({
        ...previous,
        avatar,
      }));
    } catch (err) {
      console.error("Profile photo error:", err);
      toast.error("Unable to process this photo.");
    }
  };

  const handleRemovePhoto = () => {
    setForm((previous) => ({
      ...previous,
      avatar: "",
    }));
  };

  // ------------------------------------------------------
  // SAVE PROFILE
  // ------------------------------------------------------

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    const phone = form.phone.trim();

    if (phone) {
      const digits = phone.replace(/\D/g, "");

      if (!/^[0-9+\-\s()]+$/.test(phone) ||
        digits.length < 10 ||
        digits.length > 15) {
        toast.error("Please enter a valid phone number.");
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      phone: phone || null,
      designation: form.designation.trim() || null,
      department: form.department.trim() || null,
      location: form.location.trim() || null,
      avatar: form.avatar || null,
    };

    try {
      setSaving(true);

      const hasServerUpdate =
        typeof authService.updateProfile === "function";

      let serverProfile = null;

      if (hasServerUpdate) {
        const response = await authService.updateProfile(payload);
        serverProfile = extractProfile(response);

        if (!serverProfile || typeof serverProfile !== "object") {
          throw new Error("The server did not return updated profile data.");
        }
      }

      const updated = {
        ...user,
        ...payload,
        ...(serverProfile || {}),
      };

      // Cache the profile extras for fields not yet supported by the API.
      // A backend endpoint is required for permanent database persistence.
      const extras = {
        phone: updated.phone || "",
        designation: updated.designation || "",
        department: updated.department || "",
        location: updated.location || "",
        avatar: updated.avatar || "",
      };

      localStorage.setItem(
        `profile_extras_${updated.id || updated.email || "current"}`,
        JSON.stringify(extras)
      );

      localStorage.setItem("user", JSON.stringify(updated));

      setUser(updated);
      setShowEdit(false);

      toast.success(
        hasServerUpdate
          ? "Profile updated successfully."
          : "Profile saved on this device only."
      );
    } catch (err) {
      console.error("Profile save error:", err);

      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
          <div className="h-48 rounded-2xl border border-slate-200 bg-white" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-64 rounded-2xl bg-white lg:col-span-2" />
            <div className="h-64 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------
  // ERROR STATE
  // ------------------------------------------------------

  if (error && !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldCheck size={26} />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------
  // MAIN PAGE
  // ------------------------------------------------------

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* PAGE HEADER */}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Building2 size={15} />
              Inventory Management System
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Manage your personal details and professional information.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </header>

        {/* PROFILE HERO */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 sm:h-40">
            <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10" />
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-400 to-transparent" />
          </div>

          <div className="px-4 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                <div className="relative">
                  <Avatar
                    src={userAvatar}
                    name={userName}
                    size="h-24 w-24 sm:h-28 sm:w-28"
                  />

                  <button
                    type="button"
                    onClick={openEdit}
                    title="Change profile photo"
                    aria-label="Change profile photo"
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-slate-900 text-white shadow-md transition hover:bg-slate-700"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <div className="min-w-0 pb-1 text-center sm:text-left">
                  <h2 className="break-words text-xl font-bold text-slate-950 sm:text-2xl">
                    {userName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {userDesignation || roleLabel}
                    {userDepartment ? ` · ${userDepartment}` : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      <ShieldCheck size={13} />
                      {roleLabel}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={13} />
                      Account active
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={openEdit}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            </div>

            <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Mail size={17} className="shrink-0 text-slate-500" />
                <span className="break-all text-sm text-slate-700">
                  {userEmail || "No email available"}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Phone size={17} className="shrink-0 text-slate-500" />
                <span className="break-words text-sm text-slate-700">
                  {userPhone || "Add a phone number"}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3 sm:col-span-2 lg:col-span-1">
                <MapPin size={17} className="shrink-0 text-slate-500" />
                <span className="break-words text-sm text-slate-700">
                  {userLocation || "Add your location"}
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* MAIN CONTENT */}

        <div className="grid items-start gap-6 lg:grid-cols-3">
          {/* PERSONAL AND WORK INFORMATION */}

          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                icon={User}
                title="Personal & Work Information"
                description="Your contact details and professional profile."
                action={
                  <button
                    type="button"
                    onClick={openEdit}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={User}
                  label="Full Name"
                  value={userName}
                />

                <InfoCard
                  icon={Mail}
                  label="Email Address"
                  value={userEmail}
                />

                <InfoCard
                  icon={Phone}
                  label="Phone Number"
                  value={userPhone}
                />

                <InfoCard
                  icon={Briefcase}
                  label="Job Designation"
                  value={userDesignation}
                />

                <InfoCard
                  icon={Building2}
                  label="Department"
                  value={userDepartment}
                />

                <InfoCard
                  icon={MapPin}
                  label="Work Location"
                  value={userLocation}
                />
              </div>
            </div>

            {/* PROFILE COMPLETION */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Profile completeness
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Complete your details to maintain an up-to-date profile.
                  </p>
                </div>

                <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-800">
                  {completion}%
                </span>
              </div>

              <div
                className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Profile completeness"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completion}
              >
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>

              {completion < 100 && (
                <button
                  type="button"
                  onClick={openEdit}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                >
                  Complete your profile
                  <Pencil size={14} />
                </button>
              )}
            </div>
          </section>

          {/* ACCOUNT DETAILS */}

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading
                icon={ShieldCheck}
                title="Account Details"
                description="Your account information."
              />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Hash size={18} />
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Account ID
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                      {user?.id ? `#${user.id}` : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <CalendarDays size={18} />
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Member Since
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {memberSince}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={18} />
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Account Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-700">
                      Active
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <ShieldCheck size={18} />
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Assigned Role
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {roleLabel}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* PROFILE SUMMARY */}

            <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white shadow-sm sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Building2 size={21} />
              </div>

              <h3 className="mt-4 text-base font-bold">
                Your workspace
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Keep your contact and professional information accurate so
                your IMS account stays up to date.
              </p>

              <button
                type="button"
                onClick={openEdit}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                <Pencil size={15} />
                Update Information
              </button>
            </section>
          </aside>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}

      {showEdit && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEdit();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="my-auto flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl sm:max-h-[90vh]"
          >
            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
              <div>
                <h2
                  id="edit-profile-title"
                  className="text-lg font-bold text-slate-950"
                >
                  Edit Profile
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update your personal and work details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Close edit profile"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* EDIT FORM */}

            <form
              onSubmit={handleSave}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="space-y-6 p-5 sm:p-7">
                {/* PHOTO */}

                <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row">
                  <Avatar
                    src={form.avatar}
                    name={form.name || userName}
                    size="h-20 w-20"
                    textSize="text-2xl"
                  />

                  <div className="min-w-0 text-center sm:text-left">
                    <h3 className="text-sm font-bold text-slate-900">
                      Profile photo
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Choose an image up to 2 MB. JPG, PNG, and WebP are
                      suitable formats.
                    </p>

                    <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        <Upload size={14} />
                        {form.avatar ? "Change photo" : "Upload photo"}
                      </button>

                      {form.avatar && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* FORM FIELDS */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full Name *"
                    icon={User}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />

                  <Field
                    label="Phone Number"
                    icon={Phone}
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    type="tel"
                  />

                  <Field
                    label="Email Address"
                    icon={Mail}
                    name="email"
                    value={userEmail}
                    disabled
                    helper="Your login email cannot be changed here."
                  />

                  <Field
                    label="Account Role"
                    icon={ShieldCheck}
                    name="role"
                    value={roleLabel}
                    disabled
                    helper="Your role is assigned by the administrator."
                  />

                  <Field
                    label="Job Designation"
                    icon={Briefcase}
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. Inventory Manager"
                  />

                  <Field
                    label="Department"
                    icon={Building2}
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Operations"
                  />

                  <div className="sm:col-span-2">
                    <Field
                      label="Work Location"
                      icon={MapPin}
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}

              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Profile;