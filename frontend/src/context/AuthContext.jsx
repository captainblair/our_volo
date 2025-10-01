import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ Added error state

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api
        .get('/users/me/')
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
          logout();
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });

      const formData = new URLSearchParams();
      formData.append('email', email); // Using 'email' to match the backend's EmailTokenObtainPairSerializer
      formData.append('password', password);

      console.log('Sending login request to /auth/token/');

      const response = await axios({
        method: 'post',
        url: 'http://localhost:8000/api/auth/token/',
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        withCredentials: true,
        timeout: 10000,
      });

      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);

      if (!response.data || !response.data.access) {
        throw new Error('Authentication failed: No access token received');
      }

      const { access: token, refresh: refreshToken } = response.data;

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setToken(token);
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      try {
        console.log('Fetching user data...');
        const userRes = await api.get('/users/me/');
        setUser(userRes.data);
        setError(null); // ✅ clear error if login succeeds
        return userRes.data;
      } catch (userErr) {
        console.error('Error fetching user data:', userErr);
        return { email };
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'An error occurred during login';

      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = 'Invalid email or password';
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication failed. Please check your credentials.';
        } else if (err.response.data && err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please try again later.';
      } else {
        errorMessage = `Request error: ${err.message}`;
      }

      setError(errorMessage); // ✅ Now works
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  return (
    <Ctx.Provider value={{ token, user, login, logout, loading, error }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
