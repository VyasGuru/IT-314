import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: replace with real auth call
    alert("Sign in submitted (placeholder)\nEmail: " + email);
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
          <h2 className="text-white text-2xl font-normal">Sign in to your account</h2>
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

          <button
            type="submit"
            className="w-full bg-[#FF4D4D] hover:bg-[#ff6666] text-white px-4 py-3 rounded-lg text-base font-medium transition-colors" 
          >
            Sign In
          </button>
        </form>

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