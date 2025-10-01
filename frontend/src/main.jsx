import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './index.css';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import MessagingPage from './pages/MessagingPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

// PrivateRoute Component for protecting routes
function PrivateRoute() {
  const { token } = useAuth();
  return token ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
}

// Public route component
function PublicRoute() {
  const { token } = useAuth();
  // Only redirect to dashboard if user is trying to access login/signup when already authenticated
  const location = window.location.pathname;
  if (token && (location === '/login' || location === '/signup')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected routes with layout */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/messages/:id" element={<MessagingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminPage />}>
            <Route path="users" element={<div>Users Management</div>} />
            <Route path="departments" element={<div>Departments</div>} />
            <Route path="settings" element={<div>System Settings</div>} />
          </Route>
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

// Rendering the App
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);