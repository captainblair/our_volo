import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './index.css';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/DashboardNew';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import MessagingPage from './pages/MessagingPage';
import AdminPanel from './components/admin/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import DepartmentsPage from './pages/DepartmentsPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';

// Components
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

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
    <ThemeProvider>
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
          
          {/* Feature pages */}
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminPanel />} />
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </AuthProvider>
);

// Rendering the App
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);