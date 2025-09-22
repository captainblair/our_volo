import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import MessagingPage from "./pages/MessagingPage";
import AdminPage from "./pages/AdminPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

// PrivateRoute Component for protecting routes
function PrivateRoute({ children }) {
  const { token } = useAuth();  // Access the token from AuthContext
  // If token is available, allow the route, otherwise redirect to login
  return token ? children : <Navigate to="/login" />;
}

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
        <Route path="/messaging" element={<PrivateRoute><MessagingPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

// Rendering the App
createRoot(document.getElementById("root")).render(<App />);
