import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './index.css';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/DashboardNew';
import AdminDashboard from './pages/AdminDashboard';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import MessagingPage from './pages/MessagingPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import DepartmentsPage from './pages/DepartmentsPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';

// Components
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// PrivateRoute Component for protecting routes
function PrivateRoute() {
  const { token } = useAuth();
  return token ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
}

// Public route component
function PublicRoute() {
  return <PublicLayout><Outlet /></PublicLayout>;
}

// Protected public route component (redirects if authenticated)
function ProtectedPublicRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : children;
}

// Dashboard route component that renders different dashboards based on user role
function DashboardRoute() {
  const { user } = useAuth();
  return user?.role?.name === 'Admin' ? <AdminDashboard /> : <Dashboard />;
}

const App = () => (
  <AuthProvider>
    <ThemeProvider>
      <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<ProtectedPublicRoute><Login /></ProtectedPublicRoute>} />
          <Route path="/signup" element={<ProtectedPublicRoute><Signup /></ProtectedPublicRoute>} />
          <Route path="/" element={<ProtectedPublicRoute><HomePage /></ProtectedPublicRoute>} />
          <Route path="/about" element={<div className="container mx-auto p-4">About Us Page</div>} />
          <Route path="/features" element={<div className="container mx-auto p-4">Features Page</div>} />
          <Route path="/pricing" element={<div className="container mx-auto p-4">Pricing Page</div>} />
        </Route>

        {/* Protected routes with layout */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardRoute />} />
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
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
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