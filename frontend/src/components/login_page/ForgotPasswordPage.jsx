import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/userApi";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
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

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const response = await forgotPassword(email);
      setSuccess(true);
      // Backend returns ApiResponse format: { success, message, data }
      setMessage(
        response?.message ||
          "Password reset link has been sent to your email. Please check your inbox."
      );
    } catch (err) {
      // Handle different error types
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 404) {
        setError("No account found with this email address.");
      } else if (err.response?.status === 400) {
        setError("Invalid email address. Please check and try again.");
      } else if (err.response?.status === 500) {
        setError("Server error. The reset link may still have been generated. Please contact support if you don't receive an email.");
        // Even on 500, check if we got a reset link in response
        if (err.response?.data?.data?.resetLink) {
          setSuccess(true);
          setMessage("Password reset link generated. Please check the server logs or contact support for the reset link.");
        }
      } else if (err.message && err.message.includes("timeout")) {
        setError("Request timed out. Please check if the backend server is running and try again.");
      } else if (err.message && err.message.includes("Network Error")) {
        setError("Cannot connect to backend server. Please ensure it's running on http://localhost:8000");
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
            Reset Your Password
          </h2>
          <p className="text-gray-400 text-sm text-center">
            Enter your email address and we'll send you a link to reset your
            password
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
            <div className="bg-[#2b2f33] rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">
                Didn't receive the email?
              </p>
              <ul className="text-gray-400 text-xs space-y-1 ml-4 list-disc">
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes and try again</li>
              </ul>
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
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-[#2b2f33] border-none rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
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

            {message && !success && (
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
                <p className="text-blue-400 text-sm">{message}</p>
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

