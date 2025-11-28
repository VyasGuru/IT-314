import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { verifyEmail, sendEmailVerification } from "../../services/userApi";
import { Mail, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, isEmailVerified, refreshUserProfile } = useAuth();
  
  const [status, setStatus] = useState("loading"); // loading, success, error, expired, pending
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  useEffect(() => {
    const verifyEmailToken = async () => {
      // If user is already verified, redirect immediately
      if (isEmailVerified && !token) {
        console.log("User already verified, redirecting to home...");
        navigate("/");
        return;
      }

      // If no token, show pending verification state
      if (!token || !uid) {
        setStatus("pending");
        setMessage("Check your email for the verification link.");
        return;
      }

      try {
        const result = await verifyEmail(token, uid);
        
        if (result.message && result.message.includes("already verified")) {
          setStatus("success");
          setMessage("Your email is already verified!");
        } else {
          setStatus("success");
          setMessage("Email verified successfully! You can now list properties.");
        }
        
        // Refresh user profile to update isEmailVerified status
        await refreshUserProfile();
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        
        if (error.message && error.message.includes("expired")) {
          setStatus("expired");
          setMessage("Verification link has expired. Please request a new one.");
        } else {
          setStatus("error");
          setMessage("Email verification failed. Invalid or used link.");
        }
      }
    };

    verifyEmailToken();
  }, [token, uid, navigate, isEmailVerified, refreshUserProfile]);

  const handleResendEmail = async () => {
    if (!currentUser) {
      setMessage("Please log in first.");
      return;
    }

    setResendLoading(true);
    try {
      // Call backend to send verification email
      await sendEmailVerification();
      setStatus("pending");
      setMessage("Verification email sent! Check your inbox.");
    } catch (error) {
      console.error("Resend error:", error);
      setStatus("error");
      setMessage(error.message || "Failed to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0d12] to-[#1c1f26] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1c1f26] rounded-2xl p-8 shadow-xl border border-[#2b2f33]">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-12 w-12 bg-[#0066FF] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">FS</span>
              </div>
              <span className="text-[#0066FF] text-xl font-semibold">FindMySquare</span>
            </Link>
          </div>

          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === "loading" && (
              <Loader className="h-12 w-12 text-[#0066FF] animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
            {status === "expired" && (
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            )}
            {status === "pending" && (
              <Mail className="h-12 w-12 text-[#0066FF]" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-white text-2xl font-bold text-center mb-3">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
            {status === "expired" && "Link Expired"}
            {status === "pending" && "Verify Your Email"}
          </h2>

          {/* Message */}
          <p className="text-gray-400 text-center mb-6">
            {message}
          </p>

          {/* Content based on status */}
          {status === "pending" && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm text-center">
                We've sent a verification link to your email. Click the link to verify your account and start listing properties.
              </p>
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resendLoading && <Loader className="h-4 w-4 animate-spin" />}
                Resend Email
              </button>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm">
                  Your email has been verified successfully. You can now list properties on FindMySquare.
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Go to Home
              </button>
            </div>
          )}

          {(status === "error" || status === "expired") && (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">
                  {status === "expired"
                    ? "Your verification link has expired. Please request a new one."
                    : "There was an issue verifying your email. Please try again or request a new link."}
                </p>
              </div>
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resendLoading && <Loader className="h-4 w-4 animate-spin" />}
                Send New Link
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-[#2b2f33] hover:bg-[#3a3f45] text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Please wait while we verify your email...
              </p>
            </div>
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Already verified?{" "}
          <Link to="/" className="text-[#0066FF] hover:text-[#0052CC] font-semibold">
            Go Home
          </Link>
        </p>
      </div>
    </div>
  );
}
