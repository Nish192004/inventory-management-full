import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await forgotPassword(email);

      setMessage(
        data.message ||
          "If an account exists with this email, a reset link has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        flex
        min-h-screen
        w-full
        items-center
        justify-center
        bg-gradient-to-br
        from-blue-50
        via-white
        to-indigo-100
        px-3
        py-6
        sm:px-4
        sm:py-8
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
        {/* Header */}
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
              rounded-2xl
              bg-blue-600
              text-white
              sm:mb-5
              sm:h-14
              sm:w-14
            "
          >
            <Mail
              size={24}
              className="sm:h-[26px] sm:w-[26px]"
            />
          </div>

          <h1
            className="
              text-2xl
              font-bold
              text-gray-900
              sm:text-3xl
            "
          >
            Forgot Password?
          </h1>

          <p
            className="
              mx-auto
              mt-2
              max-w-sm
              text-sm
              leading-5
              text-gray-500
              sm:text-base
              sm:leading-6
            "
          >
            Enter your email and we'll help you reset your password.
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

        {/* Success */}
        {message && (
          <div
            className="
              mb-4
              rounded-xl
              border
              border-green-200
              bg-green-50
              px-3
              py-3
              text-xs
              leading-5
              text-green-700
              sm:mb-5
              sm:px-4
              sm:text-sm
            "
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
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

          <div className="relative mb-5 sm:mb-6">
            <Mail
              size={18}
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-gray-400
                sm:left-4
              "
            />

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Back to Login */}
        <Link
          to="/login"
          className="
            mt-6
            flex
            items-center
            justify-center
            gap-2
            text-xs
            font-semibold
            text-blue-600
            hover:text-blue-700
            sm:mt-7
            sm:text-sm
          "
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;