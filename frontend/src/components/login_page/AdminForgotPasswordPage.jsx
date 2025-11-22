import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/userApi";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function AdminForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await forgotPassword(ADMIN_EMAIL);
      setSuccess(true);
      setMessage(
        response?.message ||
          "Password reset link has been sent to the admin email. Please check the inbox."
      );
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          err.message || "Failed to send password reset email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[480px] mx-auto px-6">
      <div className="rounded-2xl bg-[#1c1f26] p-8">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex flex-col items-center gap-2 mb-4">
            <div className="h-12 w-12 bg-[#0066FF] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">FS</span>
            </div>
            <span className="text-[#0066FF] text-xl font-semibold">
              FindMySquare
            </span>
          </Link>
          <h2 className="text-white text-2xl font-normal mb-2">
            Admin Password Reset
          </h2>
          <p className="text-gray-400 text-sm text-center">
            A password reset link will be sent to the registered admin email address.
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    Email Sent Successfully
                  </p>
                  <p className="text-green-300 text-sm">{message}</p>
                </div>
              </div>
            </div>
            <Link
              to="/login"
              className="block w-full text-center bg-[#0066FF] hover:bg-[#0052CC] text-white px-4 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-white text-base block mb-2"
              >
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  readOnly
                  value={ADMIN_EMAIL}
                  className="w-full bg-[#2b2f33] border-none rounded-lg pl-10 pr-4 py-3 text-gray-400 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg text-base font-medium transition-colors"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
