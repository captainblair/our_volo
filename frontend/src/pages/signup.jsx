import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import salahImage from "../media/salah-regouane-Y2ZS27IE0Xo-unsplash.jpg";

const API_BASE_URL = "http://localhost:8000";

export default function Signup() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState({ code: "+254", flag: "🇰🇪", name: "Kenya" });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  const countries = [
    { code: "+254", flag: "🇰🇪", name: "Kenya" },
    { code: "+1", flag: "🇺🇸", name: "United States" },
    { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
    { code: "+234", flag: "🇳🇬", name: "Nigeria" },
    { code: "+27", flag: "🇿🇦", name: "South Africa" },
    { code: "+256", flag: "🇺🇬", name: "Uganda" },
    { code: "+255", flag: "🇹🇿", name: "Tanzania" },
    { code: "+250", flag: "🇷🇼", name: "Rwanda" },
    { code: "+91", flag: "🇮🇳", name: "India" },
    { code: "+86", flag: "🇨🇳", name: "China" },
    { code: "+33", flag: "🇫🇷", name: "France" },
    { code: "+49", flag: "🇩🇪", name: "Germany" },
    { code: "+39", flag: "🇮🇹", name: "Italy" },
    { code: "+34", flag: "🇪🇸", name: "Spain" },
    { code: "+81", flag: "🇯🇵", name: "Japan" },
    { code: "+82", flag: "🇰🇷", name: "South Korea" },
    { code: "+61", flag: "🇦🇺", name: "Australia" },
    { code: "+55", flag: "🇧🇷", name: "Brazil" },
    { code: "+52", flag: "🇲🇽", name: "Mexico" },
    { code: "+7", flag: "🇷🇺", name: "Russia" },
    { code: "+20", flag: "🇪🇬", name: "Egypt" },
    { code: "+212", flag: "🇲🇦", name: "Morocco" },
    { code: "+233", flag: "🇬🇭", name: "Ghana" },
    { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
    { code: "+260", flag: "🇿🇲", name: "Zambia" }
  ];
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribeEmails, setSubscribeEmails] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);
  
  // Check password match whenever passwords change
  useEffect(() => {
    if (confirmPassword === '') {
      setPasswordMatch(null);
    } else if (password === confirmPassword && password !== '') {
      setPasswordMatch(true);
    } else if (confirmPassword !== '') {
      setPasswordMatch(false);
    }
  }, [password, confirmPassword]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest('.country-selector')) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown]);

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
          phone_number: selectedCountry.code + phoneNumber,
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
    <div className={`min-h-screen flex items-stretch transition-colors ${
      theme === 'dark' ? 'bg-black' : 'bg-gray-100'
    }`} style={{ backgroundImage: `url(${salahImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className={`absolute inset-0 z-0 ${
        theme === 'dark' ? 'bg-black/70' : 'bg-black/50'
      }`}></div>
      
      <div className="w-full md:w-1/2 p-4 sm:p-6 lg:p-8 flex items-center justify-center z-10">
        <form onSubmit={handleSignup} className={`p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md transition-colors ${
          theme === 'dark'
            ? 'bg-black/95 backdrop-blur-md border border-zinc-700'
            : 'bg-white/95 backdrop-blur-md'
        }`}>
          <h1 className={`text-xl sm:text-2xl font-bold text-center mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Create an Account</h1>
          <p className={`text-xs sm:text-sm text-center mb-4 sm:mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Please create an account using your official names. The name you enter here will appear on your certificate upon completion.
          </p>
          
          {error && <div className={`text-red-600 text-sm p-2 rounded mb-4 ${
            theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
          }`}>{error}</div>}
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>First Name</label>
            <input
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>Last Name</label>
            <input
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>Email</label>
            <input
              type="email"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex items-center mt-2">
              <input
                id="subscribe_emails"
                type="checkbox"
                className="h-5 w-5 rounded border-2 border-gray-400 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer checked:bg-blue-600 checked:border-blue-600 hover:checked:bg-blue-600 hover:checked:border-blue-600"
                checked={subscribeEmails}
                onChange={(e) => setSubscribeEmails(e.target.checked)}
              />
              <label htmlFor="subscribe_emails" className={`ml-2 text-sm cursor-pointer font-medium ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                I confirm my subscription to receive program-related emails.
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>Phone Number</label>
            <div className="flex country-selector">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className={`flex items-center px-2 sm:px-3 py-2 text-sm border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <span className="mr-2 text-lg">{selectedCountry.flag}</span>
                  <span className="mr-1">{selectedCountry.code}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showCountryDropdown && (
                  <div className={`absolute top-full left-0 z-10 w-full sm:w-64 border rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-y-auto ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country);
                          setShowCountryDropdown(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        <span className="mr-3 text-lg">{country.flag}</span>
                        <span className="mr-2">{country.code}</span>
                        <span className="text-sm">{country.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="tel"
                className={`flex-1 border rounded-r px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="700 000 000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>Department</label>
            <select
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
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
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full border rounded px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className={`absolute inset-y-0 right-0 flex items-center pr-3 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
                } bg-transparent`}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className={`text-xs mt-0.5 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Min 8 chars, 1 uppercase, 1 special char
            </p>
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>Password Confirmation</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full border rounded px-3 py-2 pr-20 focus:outline-none focus:ring-2 transition-colors ${
                  passwordMatch === true ? 'border-green-500 focus:ring-green-500' : 
                  passwordMatch === false ? 'border-red-500 focus:ring-red-500' : 
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                }`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                {passwordMatch === true && (
                  <span className="text-green-600 font-bold text-lg">✓</span>
                )}
                {passwordMatch === false && (
                  <span className="text-red-600 font-bold text-lg">✗</span>
                )}
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className={`text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                  } bg-transparent`}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {passwordMatch === true && (
              <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
            )}
            {passwordMatch === false && (
              <p className="text-xs text-red-600 mt-1">✗ Passwords do not match</p>
            )}
          </div>
          
          <div className="flex items-center mb-4">
            <input
              id="terms"
              type="checkbox"
              className="h-5 w-5 rounded border-2 border-gray-400 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer checked:bg-blue-600 checked:border-blue-600 hover:checked:bg-blue-600 hover:checked:border-blue-600"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label htmlFor="terms" className={`ml-2 block text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              I have read and agree to the <a href="#" className={`transition-colors ${
                theme === 'dark'
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-800'
              }`}>terms and conditions</a>
            </label>
          </div>
          
          <button 
            type="submit"
            className={`w-full py-2 rounded transition-colors disabled:opacity-50 mt-4 ${
              theme === 'dark'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          
          <p className={`text-sm text-center mt-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={`font-medium transition-colors ${
                theme === 'dark'
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              Login
            </button>
          </p>
        </form>
      </div>

    </div>
  );
}