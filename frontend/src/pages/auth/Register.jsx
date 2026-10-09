import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";


// ============================================================
// CONSTANTS
// ============================================================

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 6;

const STRENGTH_LEVELS = [
  { label: "Too short", bar: "bg-gray-300", text: "text-gray-500" },
  { label: "Weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", bar: "bg-blue-500", text: "text-blue-600" },
  { label: "Strong", bar: "bg-green-500", text: "text-green-600" },
];


// ============================================================
// HELPERS
// ============================================================

// 0 = too short, 1 = weak ... 4 = strong
const getPasswordStrength = (password) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return 0;
  }

  let score = 1;

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 4);
};

const inputBase =
  "w-full rounded-xl border bg-white py-3 pl-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-4 sm:py-3.5 sm:pl-11";

const inputState = (hasError) =>
  hasError
    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
    : "border-gray-300 focus:border-blue-500 focus:ring-blue-100";

const iconClass =
  "absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 sm:left-4";

const labelClass =
  "mb-2 block text-xs font-semibold text-gray-700 sm:text-sm";


// ============================================================
// REGISTER
// ============================================================

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(formData.password);
  const strengthInfo = STRENGTH_LEVELS[strength];

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;


  // ==================================================
  // HANDLERS
  // ==================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Enter your full name.";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      errors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Create a password.";
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || !validate()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Role is never sent from the browser.
      // The backend decides the role of a new account.
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      <style>
        {`
          @keyframes registerCardIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .register-card-in {
            animation: registerCardIn 0.35s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .register-card-in { animation: none; }
          }
        `}
      </style>

      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="flex min-h-screen w-full items-center justify-center px-3 py-6 sm:px-4 sm:py-10">

          <div className="register-card-in w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-8 md:p-10">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-6 text-center sm:mb-8">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white sm:mb-5 sm:h-14 sm:w-14 sm:rounded-2xl sm:text-xl">
                IM
              </div>

              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-5 text-gray-500 sm:text-base sm:leading-6">
                Set up your inventory management account.
              </p>

            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs leading-5 text-red-600 sm:mb-5 sm:px-4 sm:text-sm"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ==================================================
                FORM
            ================================================== */}

            <form onSubmit={handleSubmit} noValidate>

              {/* FULL NAME */}
              <div className="mb-4 sm:mb-5">
                <label htmlFor="name" className={labelClass}>
                  Full Name
                </label>

                <div className="relative">
                  <User size={18} className={iconClass} />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    autoFocus
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.name)}
                    className={`${inputBase} pr-3 sm:pr-4 ${inputState(
                      fieldErrors.name
                    )}`}
                  />
                </div>

                {fieldErrors.name && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div className="mb-4 sm:mb-5">
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>

                <div className="relative">
                  <Mail size={18} className={iconClass} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={`${inputBase} pr-3 sm:pr-4 ${inputState(
                      fieldErrors.email
                    )}`}
                  />
                </div>

                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="mb-4 sm:mb-5">
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>

                <div className="relative">
                  <Lock size={18} className={iconClass} />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={`${inputBase} pr-11 sm:pr-12 ${inputState(
                      fieldErrors.password
                    )}`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 sm:right-3"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.password}
                  </p>
                )}

                {/* STRENGTH METER */}
                {formData.password && (
                  <div className="mt-3" aria-live="polite">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            strength >= level
                              ? strengthInfo.bar
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <p
                      className={`mt-1.5 text-xs font-medium ${strengthInfo.text}`}
                    >
                      {strengthInfo.label}
                    </p>
                  </div>
                )}

                {!formData.password && !fieldErrors.password && (
                  <p className="mt-2 text-[11px] text-gray-400 sm:text-xs">
                    Use at least {MIN_PASSWORD_LENGTH} characters. Mix upper
                    and lower case, numbers and symbols for a stronger
                    password.
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="mb-5 sm:mb-6">
                <label htmlFor="confirmPassword" className={labelClass}>
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock size={18} className={iconClass} />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    className={`${inputBase} pr-11 sm:pr-12 ${inputState(
                      fieldErrors.confirmPassword
                    )}`}
                  />

                  {passwordsMatch && (
                    <span className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </div>

                {fieldErrors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                {loading ? "Creating account..." : "Create account"}
              </button>

            </form>

            {/* ==================================================
                LOGIN LINK
            ================================================== */}

            <p className="mt-6 text-center text-xs leading-5 text-gray-500 sm:mt-7 sm:text-sm">
              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Log in
              </Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

export default Register;