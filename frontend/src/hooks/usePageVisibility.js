import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const usePageVisibility = () => {
  const { token, validateToken, refreshToken, logout } = useAuth();

  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Only check when page becomes visible and user is logged in
      if (!document.hidden && token) {
        try {
          // Check if current token is still valid
          const isValid = await validateToken(token);
          
          if (!isValid) {
            // Try to refresh the token
            const newToken = await refreshToken();
            
            if (!newToken) {
              // Both access and refresh tokens are invalid
              logout();
              
              // Show a user-friendly message
              const message = 'Your session has expired due to inactivity. Please log in again.';
              window.dispatchEvent(new CustomEvent('sessionExpired', { 
                detail: { message } 
              }));
            }
          }
        } catch (error) {
          console.error('Error validating token on page visibility:', error);
          // Don't logout on network errors, let the user try again
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, validateToken, refreshToken, logout]);
};

export default usePageVisibility;