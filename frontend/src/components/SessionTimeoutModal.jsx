import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SessionTimeoutModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { token, refreshToken, logout } = useAuth();

  useEffect(() => {
    if (!token) return;

    // Check token expiry every minute
    const checkTokenExpiry = () => {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = tokenData.exp - currentTime;

        // Show warning 2 minutes before expiry
        if (timeUntilExpiry <= 120 && timeUntilExpiry > 0) {
          setShowModal(true);
          setCountdown(Math.floor(timeUntilExpiry));
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    checkTokenExpiry(); // Check immediately

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!showModal) return;

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showModal, logout]);

  const handleExtendSession = async () => {
    try {
      await refreshToken();
      setShowModal(false);
      setCountdown(60);
    } catch (error) {
      console.error('Failed to extend session:', error);
      logout();
    }
  };

  const handleLogout = () => {
    logout();
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Session Expiring Soon
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Your session will expire in <span className="font-bold text-red-600">{countdown}</span> seconds.
            Would you like to extend your session?
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={handleExtendSession}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Extend Session
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;