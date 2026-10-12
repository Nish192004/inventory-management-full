import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Package,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";


// ============================================================
// CONSTANTS
// ============================================================

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FEATURES = [
  "Easy inventory management",
  "Secure authentication",
  "Real-time stock tracking",
];

const inputBase =
  "h-11 w-full rounded-lg border bg-white pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2";

const inputState = (hasError) =>
  hasError
    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
    : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10";

const iconClass =
  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";


// ============================================================
// LOGIN
// ============================================================

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


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

    if (!formData.email.trim()) {
      errors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Enter your password.";
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

      await login(formData.email.trim(), formData.password);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      await googleLogin(credentialResponse.credential);

      toast.success("Logged in with Google");
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };


  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      <style>
        {`
          @keyframes loginCardIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .login-card-in {
            animation: loginCardIn 0.35s ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .login-card-in { animation: none; }
          }
        `}
      </style>

      <div className="min-h-screen w-full bg-slate-50">
        <div className="flex min-h-screen w-full items-center justify-center px-4 py-6">

          <div className="login-card-in grid w-full max-w-[860px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[2fr_3fr]">

            {/* ==================================================
                LEFT SIDE
            ================================================== */}

            <div className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">

              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950 shadow-sm">
                    <Package className="h-5 w-5" strokeWidth={2.3} />
                  </div>

                  <div>
                    <div className="text-lg font-bold leading-none tracking-tight">
                      Inventory
                      <span className="text-blue-400">Pro</span>
                    </div>

                    <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      Management
                    </div>
                  </div>
                </div>

                <h1 className="mt-10 text-2xl font-bold leading-tight">
                  Inventory
                  <br />
                  Management System
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Manage your products, stock, users and inventory from one
                  platform.
                </p>
              </div>

              <ul className="mt-10 space-y-3 text-sm text-slate-300">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-200 ring-1 ring-slate-700">
                      <Check size={12} strokeWidth={3} />
                    </span>

                    {feature}
                  </li>
                ))}
              </ul>

            </div>

            {/* ==================================================
                RIGHT SIDE
            ================================================== */}

            <div className="w-full p-6 sm:p-10">
              <div className="mx-auto w-full max-w-sm">

                {/* MOBILE BRAND */}
                <div className="mb-6 flex items-center gap-2.5 lg:hidden">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Package className="h-5 w-5" strokeWidth={2.3} />
                  </div>

                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    Inventory<span className="text-blue-600">Pro</span>
                  </span>
                </div>

                {/* HEADER */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Welcome back
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Sign in to your inventory account.
                  </p>
                </div>

                {/* ERROR */}
                {error && (
                  <div
                    role="alert"
                    className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                  {/* EMAIL */}
                  <div className="mb-4">
                    <label htmlFor="email" className={labelClass}>
                      Email address
                    </label>

                    <div className="relative">
                      <Mail size={17} className={iconClass} />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        aria-invalid={Boolean(fieldErrors.email)}
                        className={`${inputBase} pr-3 ${inputState(
                          fieldErrors.email
                        )}`}
                      />
                    </div>

                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-slate-700"
                      >
                        Password
                      </label>

                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative">
                      <Lock size={17} className={iconClass} />

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        aria-invalid={Boolean(fieldErrors.password)}
                        className={`${inputBase} pr-11 ${inputState(
                          fieldErrors.password
                        )}`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>

                {/* DIVIDER */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs text-slate-400">OR</span>

                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* GOOGLE */}
                <div
                  className={`flex justify-center ${
                    loading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="320"
                  />
                </div>

                {/* REGISTER */}
                <p className="mt-6 text-center text-sm text-slate-500">
                  Don't have an account?{" "}

                  <Link
                    to="/register"
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    Create account
                  </Link>
                </p>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;