import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import salahImage from "../media/salah-regouane-Y2ZS27IE0Xo-unsplash.jpg";

const API_BASE_URL = "http://localhost:8000";

export default function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribeEmails, setSubscribeEmails] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone_number: phoneNumber,
          password,
          password_confirmation: confirmPassword,
          agree_terms: agreeTerms,
          subscribe_emails: subscribeEmails,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.non_field_errors) {
          throw new Error(data.non_field_errors[0]);
        } else if (data.email) {
          throw new Error(`Email: ${data.email[0]}`);
        } else if (data.password) {
          throw new Error(`Password: ${data.password[0]}`);
        } else {
          throw new Error(data.detail || "Signup failed");
        }
      }
      
      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "An error occurred during signup");
      console.error("Signup error:", err);
    }
    setLoading(false);
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="h-screen flex items-stretch bg-gray-100" style={{ backgroundImage: `url(${salahImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="w-full md:w-1/2 p-6 flex items-center justify-start z-10">
        <form onSubmit={handleSignup} className="bg-white bg-opacity-95 p-3 rounded-2xl shadow w-full max-w-md text-sm">
          <h1 className="text-lg font-bold text-center text-gray-800 mb-0.5">Create Account</h1>
          <p className="text-xs text-gray-600 text-center mb-3">
            Use your official name for certificate
          </p>
          
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">First Name</label>
            <input
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 h-8"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Last Name</label>
            <input
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 h-8"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Email</label>
            <input
              type="email"
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 h-8"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex items-start mt-0.5">
              <input
                id="subscribe_emails"
                type="checkbox"
                className="h-2.5 w-2.5 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={subscribeEmails}
                onChange={(e) => setSubscribeEmails(e.target.checked)}
              />
              <label htmlFor="subscribe_emails" className="ml-1.5 text-xs text-gray-600 leading-tight">
                Subscribe to program emails
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Phone Number</label>
            <input
              type="tel"
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 h-8"
              placeholder="+1 (201) 555-0123"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 h-8"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-xs text-gray-500 hover:text-gray-700 bg-transparent"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Min 8 chars, 1 uppercase, 1 special char
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Password Confirmation</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 h-8"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-xs text-gray-500 hover:text-gray-700 bg-transparent"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          
          <div className="flex items-start mt-0.5">
            <input
              id="terms"
              type="checkbox"
              className="h-2.5 w-2.5 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label htmlFor="terms" className="ml-1.5 block text-xs text-gray-600 leading-tight">
              I agree to <a href="#" className="text-blue-600 hover:text-blue-800">terms</a>
            </label>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-black text-white py-1 text-xs rounded hover:bg-gray-800 transition-colors disabled:opacity-50 mt-1 h-8" 
            disabled={loading}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
          
          <p className="text-xs text-gray-600 text-center mt-2">
            Have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-800 font-medium text-xs"
            >
              Login
            </button>
          </p>
        </form>
      </div>

      <div className="w-full md:w-1/2 p-6 flex items-center justify-center z-10">
        <div className="text-center md:text-left max-w-lg bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-yellow-400">Welcome to VOLO</h2>
          <div className="space-y-4">
            <p className="text-xl text-white font-medium leading-relaxed">
              Enjoy flexible schedules, lower commissions, 24/7 support, and, most importantly, your share in VOLO's profits through the point-based system!
            </p>
            <p className="text-lg text-gray-200 leading-relaxed">
              Unlock a world of efficient task management and seamless communication with VOLO. Step into a platform designed to empower your team and drive success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}