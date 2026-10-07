import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthInput from "../../components/auth/AuthInput";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
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

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await register(
        formData.name,
        formData.email,
        formData.password
      );

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        w-full
        bg-gradient-to-br
        from-blue-50
        via-white
        to-indigo-100
      "
    >
      <div
        className="
          flex
          min-h-screen
          w-full
          items-center
          justify-center
          px-3
          py-6
          sm:px-4
          sm:py-10
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-2xl
            bg-white
            p-5
            shadow-2xl
            sm:rounded-3xl
            sm:p-8
            md:p-10
          "
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-6 text-center sm:mb-8">
            <div
              className="
                mx-auto
                mb-4
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                text-lg
                font-bold
                text-white
                sm:mb-5
                sm:h-14
                sm:w-14
                sm:rounded-2xl
                sm:text-xl
              "
            >
              IM
            </div>

            <h1
              className="
                text-2xl
                font-bold
                text-gray-900
                sm:text-3xl
              "
            >
              Create Account
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-5
                text-gray-500
                sm:text-base
                sm:leading-6
              "
            >
              Create your inventory management account
            </p>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

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

          {/* ==================================================
              FORM
          ================================================== */}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}

            <AuthInput
              label="Full Name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />

            {/* Email */}

            <AuthInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />

            {/* ==================================================
                PASSWORD
            ================================================== */}

            <div className="mb-5 sm:mb-6">
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
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-3
                    py-3
                    pr-11
                    text-sm
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                    sm:px-4
                    sm:py-3.5
                    sm:pr-12
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="
                    absolute
                    right-2.5
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

              {/* Password hint */}

              <p className="mt-2 text-[11px] text-gray-400 sm:text-xs">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* ==================================================
                REGISTER BUTTON
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
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          {/* ==================================================
              LOGIN LINK
          ================================================== */}

          <p
            className="
              mt-6
              text-center
              text-xs
              leading-5
              text-gray-500
              sm:mt-7
              sm:text-sm
            "
          >
            Already have an account?{" "}

            <Link
              to="/login"
              className="
                font-semibold
                text-blue-600
                hover:text-blue-700
              "
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;