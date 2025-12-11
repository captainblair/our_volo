import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  BsGrid, 
  BsListTask, 
  BsChatDots, 
  BsGear, 
  BsPerson,
  BsHouseDoor,
  BsPeople,
  BsCalendarEvent,
  BsFileText,
  BsEnvelope,
  BsBoxArrowRight
} from 'react-icons/bs';
// Using BsBoxArrowRight from react-icons/bs instead of FiLogOut

const NavItem = ({ to, icon, label, badge, isActive, onClick, className = '' }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };
  
  return (
    <li>
      <a
        href={to || '#'}
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-left ${
          isActive
            ? 'bg-primary-600 text-white'
            : `text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800 ${className}`
        }`}
      >
        <div className="flex items-center">
          <span className="mr-3 flex-shrink-0">{icon}</span>
          <span className="font-medium text-sm">{label}</span>
        </div>
        {badge && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {badge}
          </span>
        )}
      </a>
    </li>
  );
};

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activePath, setActivePath] = useState(pathname);

  // Update active path when route changes
  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  useEffect(() => {
    // Check if user has admin role (case-insensitive)
    const roleName = user?.role?.name?.toLowerCase() || user?.role?.toLowerCase() || '';
    if (roleName === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const navItems = [
    { 
      to: '/dashboard', 
      label: 'Dashboard', 
      icon: <BsGrid className="text-lg" />,
      exact: true
    },
    { 
      to: '/tasks', 
      label: 'Tasks', 
      icon: <BsListTask className="text-lg" />,
      exact: false
    },
    { 
      to: '/messages', 
      label: 'Messages', 
      icon: <BsChatDots className="text-lg" />,
      exact: false
    },
    { 
      to: '/departments', 
      label: 'Departments', 
      icon: <BsPeople className="text-lg" />,
      exact: true
    },
    { 
      to: '/calendar', 
      label: 'Calendar', 
      icon: <BsCalendarEvent className="text-lg" />,
      exact: true
    },
    { 
      to: '/reports', 
      label: 'Reports', 
      icon: <BsFileText className="text-lg" />,
      exact: true
    }
  ];

  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({ 
      to: '/admin', 
      label: 'Admin Panel', 
      icon: <BsGear className="text-lg" />,
      exact: false
    });
  }

  const isActive = (to, exact = false) => {
    if (exact) {
      return activePath === to;
    }
    return activePath.startsWith(to) && (to !== '/' || activePath === '/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className={`w-64 h-full flex flex-col border-r transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-black border-zinc-800' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Logo/Brand */}
      <div className="p-6">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${
            theme === 'dark' ? 'bg-primary-700' : 'bg-primary-600'
          }`}>
            <BsHouseDoor className="text-white text-lg" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Volo Africa</h1>
        </div>
        
        {/* Main Navigation */}
        <nav className="mt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Navigation
          </h3>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={isActive(item.to, item.exact)}
                className="mb-1"
              />
            ))}
          </ul>
        </nav>
        
        {/* Account Section */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-zinc-700">
          <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Account
          </h3>
          <ul className="space-y-1">
            <NavItem
              to="/profile"
              icon={<BsPerson className="text-lg" />}
              label="My Profile"
              isActive={isActive('/profile', true)}
            />
            <NavItem
              to="/settings"
              icon={<BsGear className="text-lg" />}
              label="Settings"
              isActive={isActive('/settings', true)}
            />
            <NavItem
              onClick={handleLogout}
              icon={<BsBoxArrowRight className="text-lg" />}
              label="Logout"
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              />
          </ul>
        </div>
      </div>
      
      {/* User Profile */}
      <div className={`p-4 border-t ${
        theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
      }`}>
        {user && (
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white ${
              theme === 'dark' ? 'bg-primary-700' : 'bg-primary-600'
            } text-white`}>
              {user.name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3 min-w-0">
              <p className={`text-sm font-medium truncate ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {user.name || user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.role?.name || user.role || 'User'}
              </p>
              <p className={`text-xs truncate ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {user.role?.name || 'User'} • {user.department?.name || 'No Department'}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
