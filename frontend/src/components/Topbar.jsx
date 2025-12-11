import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BsList, BsBell, BsSearch, BsChatSquareText, BsSun, BsMoon, BsCamera } from 'react-icons/bs';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const API_BASE_URL = 'http://localhost:8000'; // Update this with your backend URL

export default function Topbar({ onMenuToggle }) {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  // Load unread message count
  useEffect(() => {
    const loadNotificationCount = async () => {
      try {
        const response = await api.get('/messaging/department/');
        const messages = response.data || [];
        
        // Get read messages from localStorage
        const readMessages = JSON.parse(localStorage.getItem('readMessages') || '[]');
        const currentUserEmail = user?.email;
        
        // Check if user is admin
        const isAdmin = user?.role?.name?.toLowerCase() === 'admin';
        
        // Count unread messages
        let unreadCount = 0;
        
        if (isAdmin) {
          // Admin sees all unread messages from all departments (except own)
          unreadCount = messages.filter(msg => 
            !readMessages.includes(msg.id) && 
            msg.sender?.email !== currentUserEmail
          ).length;
        } else {
          // Regular users see unread messages from their department only (except own)
          unreadCount = messages.filter(msg => 
            !readMessages.includes(msg.id) && 
            msg.sender?.email !== currentUserEmail
          ).length;
        }
        
        setNotificationCount(unreadCount);
      } catch (error) {
        console.error('Error loading notification count:', error);
      }
    };

    if (user) {
      loadNotificationCount();
      
      // Refresh count every 30 seconds
      const interval = setInterval(loadNotificationCount, 30000);
      
      // Listen for messages read event
      const handleMessagesRead = () => {
        loadNotificationCount();
      };
      window.addEventListener('messagesRead', handleMessagesRead);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('messagesRead', handleMessagesRead);
      };
    }
  }, [user]);

  // Debounced search function for real-time suggestions
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    
    setIsSearching(true);
    try {
      // Search across tasks, messages, and users
      const [tasksRes, messagesRes, usersRes] = await Promise.all([
        api.get('/tasks/').catch(() => ({ data: [] })),
        api.get('/messaging/department/').catch(() => ({ data: [] })),
        api.get('/users/manage/').catch(() => ({ data: [] }))
      ]);
      
      const tasks = tasksRes.data || [];
      const messages = messagesRes.data || [];
      const users = usersRes.data || [];
      
      const lowerQuery = query.toLowerCase();
      
      // Filter results based on search query
      const filteredTasks = tasks.filter(task => 
        task.task_title?.toLowerCase().includes(lowerQuery) ||
        task.task_desc?.toLowerCase().includes(lowerQuery) ||
        task.assigned_to?.first_name?.toLowerCase().includes(lowerQuery) ||
        task.assigned_to?.email?.toLowerCase().includes(lowerQuery)
      );
      
      const filteredMessages = messages.filter(msg =>
        msg.message_body?.toLowerCase().includes(lowerQuery) ||
        msg.sender?.first_name?.toLowerCase().includes(lowerQuery) ||
        msg.sender?.last_name?.toLowerCase().includes(lowerQuery) ||
        msg.sender?.email?.toLowerCase().includes(lowerQuery)
      );
      
      const filteredUsers = users.filter(u =>
        u.first_name?.toLowerCase().includes(lowerQuery) ||
        u.last_name?.toLowerCase().includes(lowerQuery) ||
        u.email?.toLowerCase().includes(lowerQuery) ||
        u.username?.toLowerCase().includes(lowerQuery)
      );
      
      setSearchResults({
        tasks: filteredTasks.slice(0, 5),
        messages: filteredMessages.slice(0, 5),
        users: filteredUsers.slice(0, 5)
      });
    } catch (error) {
      console.error('Search error:', error);
      // Don't logout on error, just show empty results
      setSearchResults({
        tasks: [],
        messages: [],
        users: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };
  
  // Highlight matching text in search results
  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-900 font-semibold">{part}</span>
      ) : (
        part
      )
    );
  };
  
  // Real-time search as user types (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    
    // Debounce: wait 300ms after user stops typing
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/me/upload-profile-picture/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload profile picture');
      }

      const data = await response.json();
      
      // Update the user context with the new profile picture
      updateUser({ ...user, profile_picture: data.profile_picture });
      
      // Show success message
      alert('Profile picture updated successfully!');
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert(error.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`sticky top-0 z-10 border-b transition-colors ${
      theme === 'dark' 
        ? 'bg-black border-zinc-800' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuToggle}
          className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 md:hidden transition-colors ${
            theme === 'dark'
              ? 'text-gray-400 hover:bg-zinc-800 hover:text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          aria-label="Toggle menu"
        >
          <BsList className="h-6 w-6" />
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-2xl mx-4 relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BsSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks, messages, or users..."
              className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors ${
                theme === 'dark'
                  ? 'border-zinc-700 bg-zinc-900 placeholder-gray-400 text-white'
                  : 'border-gray-300 bg-white placeholder-gray-500 text-gray-900'
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          {/* Search Results Dropdown */}
          {searchResults && (
            <div className={`absolute top-full mt-2 w-full rounded-lg shadow-lg border max-h-96 overflow-y-auto z-50 transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-700'
                : 'bg-white border-gray-200'
            }`}>
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              ) : (
                <>
                  {/* Tasks */}
                  {searchResults.tasks.length > 0 && (
                    <div className="p-2">
                      <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        📋 Tasks ({searchResults.tasks.length})
                      </h3>
                      {searchResults.tasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => {
                            navigate(`/tasks/${task.id}`);
                            setSearchResults(null);
                            setSearchQuery('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors border-l-2 border-transparent hover:border-blue-500"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {highlightMatch(task.task_title, searchQuery)}
                          </div>
                          {task.task_desc && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                              {highlightMatch(task.task_desc, searchQuery)}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {task.priority}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Messages */}
                  {searchResults.messages.length > 0 && (
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        💬 Messages ({searchResults.messages.length})
                      </h3>
                      {searchResults.messages.map(msg => (
                        <button
                          key={msg.id}
                          onClick={() => {
                            navigate('/messages');
                            setSearchResults(null);
                            setSearchQuery('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors border-l-2 border-transparent hover:border-purple-500"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                              {(msg.sender?.first_name?.[0] || 'U').toUpperCase()}
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {highlightMatch(msg.sender?.first_name || 'Unknown', searchQuery)} {highlightMatch(msg.sender?.last_name || '', searchQuery)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate ml-10">
                            {highlightMatch(msg.message_body, searchQuery)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Users */}
                  {searchResults.users.length > 0 && (
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        👥 Users ({searchResults.users.length})
                      </h3>
                      {searchResults.users.map(u => (
                        <div
                          key={u.id}
                          className="px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors border-l-2 border-transparent hover:border-green-500 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">
                              {(u.first_name?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {highlightMatch(u.first_name || '', searchQuery)} {highlightMatch(u.last_name || '', searchQuery)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {highlightMatch(u.email, searchQuery)}
                              </div>
                            </div>
                          </div>
                          {u.department && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 ml-10 mt-1">
                              {u.department.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* No Results */}
                  {searchResults.tasks.length === 0 && searchResults.messages.length === 0 && searchResults.users.length === 0 && (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-zinc-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
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
            onClick={() => navigate('/messages')}
            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 relative transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-zinc-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BsChatSquareText className="h-5 w-5" />
            <span className="sr-only">Messages</span>
          </button>
          
          {/* Notifications */}
          <button 
            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 relative transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-zinc-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => navigate('/messages')}
            title={`${notificationCount} unread message${notificationCount !== 1 ? 's' : ''}`}
          >
            <BsBell className="h-5 w-5" />
            <span className="sr-only">Notifications ({notificationCount})</span>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center text-xs font-medium text-white bg-red-500 rounded-full animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative ml-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                id="user-menu"
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
              >
                <div className="relative h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white font-medium overflow-hidden">
                  {user?.profile_picture ? (
                    <img 
                      src={`${API_BASE_URL}${user.profile_picture}`} 
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                      }}
                    />
                  ) : (
                    <span>{user?.first_name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <span className="hidden md:inline-block ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.name || 'User'}
                </span>
              </button>

              {isProfileOpen && (
                <div className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-colors ${
                  theme === 'dark'
                    ? 'bg-zinc-900'
                    : 'bg-white'
                }`}>
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                  {/* Profile Section */}
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  {/* Change Profile Picture */}
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <label 
                      className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded cursor-pointer"
                      role="menuitem"
                      tabIndex="0"
                    >
                      {user?.profile_picture ? 'Change Picture' : 'Add Profile Picture'}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                    {isUploading && (
                      <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                        Uploading...
                      </div>
                    )}
                  </div>

                  {/* Navigation Links */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <span className="flex items-center">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Profile
                      </span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <span className="flex items-center">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <span className="flex items-center">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
