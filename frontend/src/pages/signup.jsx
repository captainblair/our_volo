import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import salahImage from "../media/salah-regouane-Y2ZS27IE0Xo-unsplash.jpg"; // Adjust path as needed

const API_BASE_URL = "http://localhost:8000"; // Django backend URL

export default function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state for the form
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!firstName || !lastName || !email || !username || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, username, password }),
      });
      
      const responseText = await response.text();
      console.log("Signup response:", { status: response.status, text: responseText });
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (err) {
        throw new Error("Invalid JSON response from server");
      }
      
      if (!response.ok) {
        throw new Error(data.message || `Signup failed with status ${response.status}`);
      }
      
      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "An error occurred during signup");
      console.error("Signup error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-stretch bg-gray-100" style={{ backgroundImage: `url(${salahImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      {/* Scrim overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>
      
      {/* Signup Form on the left */}
      <div className="w-full md:w-1/2 p-6 flex items-center justify-start z-10">
        <form onSubmit={handleSignup} className="bg-white bg-opacity-90 p-6 rounded-2xl shadow w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold">Create an Account</h1>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded px-3 py-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="flex items-center mt-2 text-sm">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="mr-2"
              />
              Show Password
            </label>
          </div>
          <button className="w-full bg-black text-white py-2 rounded" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>

      {/* Text on the right */}
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