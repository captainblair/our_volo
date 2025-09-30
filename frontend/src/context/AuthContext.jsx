import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const Ctx = createContext(null);

export function AuthProvider({children}) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // Add a loading state for async operations

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/users/me/')
        .then(res => {
          setUser(res.data);
          setLoading(false);  // Stop loading when user data is fetched
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
          logout(); // Log out the user if there's an error
        });
    } else {
      setLoading(false);  // Stop loading if there's no token
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/token/', { email, password });
      const tk = res.data.access;
      setToken(tk);
      localStorage.setItem('token', tk);
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.non_field_errors?.[0] || 
                          err.response?.data?.detail || 
                          'Invalid email or password';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <Ctx.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
