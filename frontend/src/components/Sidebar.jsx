import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BsGrid, BsListTask, BsChatDots, BsGear, BsBoxArrowRight, BsPerson } from 'react-icons/bs';

const NavItem = ({ to, icon, label, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  </li>
);

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <BsGrid className="text-xl" /> },
    { to: '/tasks', label: 'Tasks', icon: <BsListTask className="text-xl" /> },
    { to: '/messages', label: 'Messages', icon: <BsChatDots className="text-xl" /> },
  ];

  // Add admin link if user is admin
  if (user?.role?.name === 'admin') {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: <BsGear className="text-xl" /> });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white h-screen flex flex-col border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Volo Africa</h1>
        <p className="text-sm text-gray-500">Departmental Communication System</p>
      </div>
      
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.to}
                onClick={() => navigate(item.to)}
              />
            ))}
          </ul>
          
          <div className="mt-8 pt-4 border-t border-gray-100">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Account
            </h3>
            <ul className="space-y-2">
              <NavItem
                to="/profile"
                icon="👤"
                label="My Profile"
                isActive={pathname === '/profile'}
                onClick={() => navigate('/profile')}
              />
              <NavItem
                to="/settings"
                icon="⚙️"
                label="Settings"
                isActive={pathname === '/settings'}
                onClick={() => navigate('/settings')}
              />
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="mr-3 text-xl">🚪</span>
                  <span className="font-medium">Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {user.first_name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user.first_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user.role?.name || 'User'} • {user.department?.name || 'No Department'}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
