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
    <div className="min-h-screen flex items-stretch bg-gray-100" style={{ backgroundImage: `url(${salahImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>
      
      <div className="w-full md:w-1/2 p-6 flex items-center justify-start z-10">
        <form onSubmit={handleSignup} className="bg-white bg-opacity-95 p-6 rounded-2xl shadow w-full max-w-md space-y-4 max-h-screen overflow-y-auto">
          <h1 className="text-xl font-semibold text-center">Create an Account</h1>
          <p className="text-sm text-gray-600 text-center">
            Please create an account using your official names. The name you enter here will appear on your certificate upon completion.
          </p>
          
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex items-center mt-2">
              <input
                id="subscribe_emails"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={subscribeEmails}
                onChange={(e) => setSubscribeEmails(e.target.checked)}
              />
              <label htmlFor="subscribe_emails" className="ml-2 text-sm text-gray-600">
                I confirm my subscription to receive program-related emails.
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (201) 555-0123"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your password should be at least 8 characters long with at least 1 uppercase letter and 1 special character.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Confirmation</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          
          <div className="flex items-start">
            <input
              id="agree_terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label htmlFor="agree_terms" className="ml-2 text-sm text-gray-600">
              I have read and agree to the{" "}
              <button
                type="button"
                onClick={() => alert('Terms and conditions coming soon!')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                terms and conditions
              </button>
            </label>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
          </p>
        </form>
      </div>

      <div className="w-full md:w-1/2 p-6 flex items-center justify-center z-10">
        <div className="text-white text-center md:text-left max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to VOLO</h2>
          <p className="text-lg md:text-xl">
            Enjoy flexible schedules, lower commissions, 24/7 support, and, most importantly, your share in VOLO's profits through the point-based system!
          </p>
        </div>
      </div>
    </div>
  );
}