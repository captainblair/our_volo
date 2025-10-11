import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Load saved credentials if Remember Me was checked
  const savedEmail = localStorage.getItem('rememberedEmail') || "";
  const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
  
  const [email, setEmail] = useState(savedEmail || "");
  const [rememberMe, setRememberMe] = useState(savedRememberMe);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await login(email, password);
      
      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      
      // Show specific error messages
      if (err.response?.status === 401) {
        setError("❌ Wrong email or password. Please try again.");
      } else if (err.response?.status === 400) {
        setError("❌ Invalid credentials. Please check your email and password.");
      } else {
        const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.non_field_errors?.[0] || 
                       "❌ Login failed. Please try again.";
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-r from-blue-900 to-gray-800 text-white px-4 py-8">
      {/* Left Side Content */}
      <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center mb-8 md:mb-0">
        <div className="text-center max-w-md">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-yellow-400">VOLO</h1>
          <p className="text-base md:text-lg mb-4 text-white">Unlock a world of efficient task management and seamless communication with VOLO.</p>
          <p className="text-sm md:text-md text-gray-100">Step into a platform designed to empower your team and drive success.</p>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-6 text-gray-900 text-center">Sign In</h1>
          {error && <div className="text-red-600 text-sm mb-4 text-center">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 text-gray-900 bg-white"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-900 bg-transparent"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember_me" className="ml-2 text-sm text-gray-800">Remember me</label>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <button
                  type="button"
                  onClick={() => alert('Forgot password feature coming soon!')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => alert('Email confirmation resend feature coming soon!')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Resend email confirmation
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
            <p className="text-sm text-gray-800 text-center">
              Don’t have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}