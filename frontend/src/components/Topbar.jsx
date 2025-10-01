import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BsList, BsBell, BsSearch, BsChatSquareText, BsSun, BsMoon } from 'react-icons/bs';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(3); // Example count

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuToggle}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 md:hidden"
          aria-label="Toggle menu"
        >
          <BsList className="h-6 w-6" />
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BsSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks, messages, or users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <BsSun className="h-5 w-5" />
            ) : (
              <BsMoon className="h-5 w-5" />
            )}
          </button>
          
          {/* Messages */}
          <button 
            onClick={() => window.location.href = '/messages'}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 relative"
          >
            <BsChatSquareText className="h-5 w-5" />
            <span className="sr-only">Messages</span>
          </button>
          
          {/* Notifications */}
          <button 
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 relative"
            onClick={() => setNotificationCount(0)}
          >
            <BsBell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center text-xs font-medium text-white bg-red-500 rounded-full">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative ml-2">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              id="user-menu"
              aria-haspopup="true"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white font-medium">
                {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline-block ml-2 text-sm font-medium text-gray-700">
                {user?.name || 'User'}
              </span>
            </button>

            {isProfileOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    Your Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
