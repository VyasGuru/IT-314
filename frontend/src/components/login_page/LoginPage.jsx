import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Shield, User } from "lucide-react";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null); // 'admin' or 'user'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithEmailPassword, signInWithGoogle } = useAuth();

  // If no role selected, show role selection
  if (!selectedRole) {
    return (
      <div className="w-[480px] mx-auto px-6">
        <div className="rounded-2xl bg-[#1c1f26] p-8">
          <div className="flex flex-col items-center mb-6">
            <Link to="/" className="flex flex-col items-center gap-2 mb-4">
              <div className="h-12 w-12 bg-[#0066FF] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">FS</span>
              </div>
              <span className="text-[#0066FF] text-xl font-semibold">FindMySquare</span>
            </Link>
            <h2 className="text-white text-2xl font-normal mb-2">Sign in to your account</h2>
            <p className="text-gray-400 text-sm">Please select your account type</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setSelectedRole("admin")}
              className="w-full flex items-center gap-4 bg-[#2b2f33] hover:bg-[#3a3f45] border-2 border-transparent hover:border-[#0066FF] rounded-lg p-4 transition-all"
            >
              <div className="h-12 w-12 bg-[#0066FF]/20 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#0066FF]" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-semibold text-lg">Administrator</h3>
                <p className="text-gray-400 text-sm">Sign in as an admin</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole("user")}
              className="w-full flex items-center gap-4 bg-[#2b2f33] hover:bg-[#3a3f45] border-2 border-transparent hover:border-[#0066FF] rounded-lg p-4 transition-all"
            >
              <div className="h-12 w-12 bg-[#0066FF]/20 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-[#0066FF]" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-semibold text-lg">User</h3>
                <p className="text-gray-400 text-sm">Sign in as a regular user</p>
              </div>
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-gray-400 hover:text-white text-sm">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Role selected, show login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailPassword(email, password, selectedRole);
      navigate("/");
    } catch (error) {
      // Handle different Firebase auth errors
      if (error.message && error.message.includes("registered as")) {
        setError(error.message);
      } else {
        switch (error.code) {
          case "auth/invalid-email":
            setError("Invalid email address.");
            break;
          case "auth/user-disabled":
            setError("This account has been disabled.");
            break;
          case "auth/user-not-found":
            setError("No account found with this email.");
            break;
          case "auth/wrong-password":
            setError("Incorrect password.");
            break;
          case "auth/too-many-requests":
            setError("Too many failed attempts. Please try again later.");
            break;
          default:
            setError(error.message || "Failed to sign in. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle(selectedRole);
      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error.message && error.message.includes("registered as")) {
        setError(error.message);
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Pop-up was blocked. Please allow pop-ups and try again.");
      } else {
        setError(error.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
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
            <span className="text-[#0066FF] text-xl font-semibold">FindMySquare</span>
          </Link>
          <h2 className="text-white text-2xl font-normal">Sign in as {selectedRole === "admin" ? "Administrator" : "User"}</h2>
          <button
            onClick={() => setSelectedRole(null)}
            className="mt-2 text-gray-400 hover:text-white text-sm"
          >
            Change account type
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-white text-base block mb-2">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#2b2f33] border-none rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-white text-base block mb-2">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2b2f33] border-none rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-[#FF4D4D] hover:bg-[#ff6666] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg text-base font-medium transition-colors" 
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1c1f26] text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-[#2b2f33] hover:bg-[#3a3f45] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg text-base font-medium transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[#FF4D4D] text-sm">Forgot Password? Contact us via email at<br />support@findmysquare.com</p>
          <div className="mt-4 bg-[#2b2f33] rounded-lg p-3">
            <span className="text-gray-400">New user? </span>
            <Link to="/register" className="text-[#FF4D4D]">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
