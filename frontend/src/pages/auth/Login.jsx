import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login(formData.email, formData.password);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google Login will be connected with Google OAuth.");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="flex min-h-screen w-full items-center justify-center px-3 py-6 sm:px-4 sm:py-10">
        <div
          className="
            grid
            w-full
            max-w-5xl
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
            sm:rounded-3xl
            lg:grid-cols-2
          "
        >
          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div
            className="
              hidden
              bg-gradient-to-br
              from-blue-600
              to-indigo-700
              p-10
              text-white
              lg:flex
              lg:flex-col
              lg:justify-center
              lg:p-12
            "
          >
            <div className="mb-8">
              <div
                className="
                  mb-6
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/20
                  text-2xl
                  font-bold
                  backdrop-blur
                "
              >
                IM
              </div>

              <h1
                className="
                  text-3xl
                  font-bold
                  leading-tight
                  xl:text-4xl
                "
              >
                Inventory
                <br />
                Management System
              </h1>

              <p
                className="
                  mt-5
                  max-w-md
                  text-base
                  leading-7
                  text-blue-100
                  xl:text-lg
                  xl:leading-8
                "
              >
                Manage your products, stock, users and inventory from one
                powerful platform.
              </p>
            </div>

            <div className="space-y-4 text-sm text-blue-100 xl:text-base">
              <div className="flex items-center gap-3">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white/20
                  "
                >
                  ✓
                </span>

                <span>Easy inventory management</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white/20
                  "
                >
                  ✓
                </span>

                <span>Secure authentication</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white/20
                  "
                >
                  ✓
                </span>

                <span>Real-time stock tracking</span>
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div
            className="
              w-full
              p-5
              sm:p-8
              md:p-10
              lg:p-12
            "
          >
            <div className="mx-auto w-full max-w-md">

              {/* Header */}

              <div className="mb-6 sm:mb-8">
                <h2
                  className="
                    text-2xl
                    font-bold
                    text-gray-900
                    sm:text-3xl
                  "
                >
                  Welcome Back
                </h2>

                <p className="mt-2 text-sm text-gray-500 sm:text-base">
                  Login to your inventory account
                </p>
              </div>

              {/* Error */}

              {error && (
                <div
                  className="
                    mb-4
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-3
                    py-3
                    text-xs
                    leading-5
                    text-red-600
                    sm:mb-5
                    sm:px-4
                    sm:text-sm
                  "
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* ==================================================
                    EMAIL
                ================================================== */}

                <div className="mb-4 sm:mb-5">
                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-xs
                      font-semibold
                      text-gray-700
                      sm:text-sm
                    "
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        sm:left-4
                        sm:h-[19px]
                        sm:w-[19px]
                      "
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        py-3
                        pl-10
                        pr-3
                        text-sm
                        outline-none
                        transition
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-100
                        sm:py-3.5
                        sm:pl-11
                        sm:pr-4
                      "
                    />
                  </div>
                </div>

                {/* ==================================================
                    PASSWORD
                ================================================== */}

                <div className="mb-2">
                  <label
                    htmlFor="password"
                    className="
                      mb-2
                      block
                      text-xs
                      font-semibold
                      text-gray-700
                      sm:text-sm
                    "
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        sm:left-4
                        sm:h-[19px]
                        sm:w-[19px]
                      "
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        py-3
                        pl-10
                        pr-11
                        text-sm
                        outline-none
                        transition
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-100
                        sm:py-3.5
                        sm:pl-11
                        sm:pr-12
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        flex
                        h-8
                        w-8
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-md
                        text-gray-400
                        transition
                        hover:bg-gray-100
                        hover:text-gray-700
                        sm:right-3
                      "
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* ==================================================
                    FORGOT PASSWORD
                ================================================== */}

                <div className="mb-5 flex justify-end sm:mb-6">
                  <Link
                    to="/forgot-password"
                    className="
                      text-xs
                      font-semibold
                      text-blue-600
                      hover:text-blue-700
                      sm:text-sm
                    "
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* ==================================================
                    LOGIN
                ================================================== */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    rounded-xl
                    bg-blue-600
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    sm:py-3.5
                  "
                >
                  {loading
                    ? "Logging in..."
                    : "Login"}
                </button>
              </form>

              {/* ==================================================
                  DIVIDER
              ================================================== */}

              <div className="my-6 flex items-center gap-3 sm:my-7 sm:gap-4">
                <div className="h-px flex-1 bg-gray-200" />

                <span className="text-xs text-gray-400 sm:text-sm">
                  OR
                </span>

                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* ==================================================
                  GOOGLE
              ================================================== */}

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  py-3
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                  sm:gap-3
                  sm:py-3.5
                "
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0"
                >
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64Z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.09A12 12 0 0 0 12 24Z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M5.27 14.29A7.22 7.22 0 0 1 4.89 12c0-.79.14-1.56.38-2.29V6.62H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.09Z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 4.76c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.11 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.87 8.87 4.76 12 4.76Z"
                  />
                </svg>

                <span>Continue with Google</span>
              </button>

              {/* ==================================================
                  REGISTER
              ================================================== */}

              <p
                className="
                  mt-6
                  text-center
                  text-xs
                  leading-5
                  text-gray-500
                  sm:mt-8
                  sm:text-sm
                "
              >
                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="
                    font-semibold
                    text-blue-600
                    hover:text-blue-700
                  "
                >
                  Create New Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;