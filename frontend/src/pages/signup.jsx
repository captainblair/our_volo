import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import salahImage from "../media/salah-regouane-Y2ZS27IE0Xo-unsplash.jpg";

const API_BASE_URL = "http://localhost:8000";

export default function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribeEmails, setSubscribeEmails] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Load departments on component mount
    fetch(`${API_BASE_URL}/api/departments/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load departments');
        return res.json();
      })
      .then(data => {
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error loading departments:', err);
        setError('Failed to load departments. Please refresh the page.');
      });
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!firstName || !lastName || !email || !phoneNumber || !departmentId || !password || !confirmPassword) {
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
          department_id: parseInt(departmentId),
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

  // Fallback if there's any rendering error
  if (error && departments.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Page</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch bg-gray-100" style={{ backgroundImage: `url(${salahImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      
      <div className="w-full md:w-1/2 p-8 flex items-center justify-start z-10">
        <form onSubmit={handleSignup} className="bg-white bg-opacity-95 p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Create an Account</h1>
          <p className="text-sm text-gray-700 text-center mb-6">
            Please create an account using your official names. The name you enter here will appear on your certificate upon completion.
          </p>
          
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">First Name</label>
            <input
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Last Name</label>
            <input
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
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
              <label htmlFor="subscribe_emails" className="ml-2 text-sm text-gray-700">
                I confirm my subscription to receive program-related emails.
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Phone Number</label>
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
            <label className="block text-sm font-medium text-gray-800 mb-1">Department</label>
            <select
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
            >
              <option value="">Select your department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-600 hover:text-gray-900 bg-transparent"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Min 8 chars, 1 uppercase, 1 special char
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Password Confirmation</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-600 hover:text-gray-900 bg-transparent"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I have read and agree to the <a href="#" className="text-blue-600 hover:text-blue-800">terms and conditions</a>
            </label>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50 mt-4" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          
          <p className="text-sm text-gray-700 text-center mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Login
            </button>
          </p>
        </form>
      </div>

    </div>
  );
}