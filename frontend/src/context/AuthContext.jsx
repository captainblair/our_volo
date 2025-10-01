import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';

// Create the auth context
const AuthContext = createContext(null);

/**
 * AuthProvider component that provides authentication context to the app
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data when token changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/users/me/');
          setUser(response.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching user data:', err);
          if (err.response?.status === 401) {
            // Token is invalid or expired
            logout();
          }
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  /**
   * Login user with email and password
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('password', password);

      const response = await axios({
        method: 'post',
        url: 'http://localhost:8000/api/auth/token/',
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        withCredentials: true,
        timeout: 10000,
      });

      if (!response.data?.access) {
        throw new Error('Authentication failed: No access token received');
      }

      const { access: newToken, refresh: refreshToken } = response.data;
      
      // Set the token in localStorage and state
      localStorage.setItem('token', newToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Set the token in the API client
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);

      // Fetch and set user data
      const userResponse = await api.get('/users/me/');
      setUser(userResponse.data);
      
      return userResponse.data;
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'An error occurred during login';

      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = 'Invalid email or password';
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication failed. Please check your credentials.';
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please try again later.';
      } else {
        errorMessage = `Request error: ${err.message}`;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout the current user
   */
  const logout = useCallback(() => {
    // Clear tokens from storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Clear auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  /**
   * Update user data in the context
   */
  const updateUser = useCallback((userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  }, []);

  // Context value
  const contextValue = {
    token,
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
