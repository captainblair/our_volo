import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';

// Role-based access control constants
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  STAFF: 'staff',
  USER: 'user'
};

// Department structure
export const DEPARTMENTS = {
  ADMINISTRATION: 'Administration',
  HR: 'Human Resources',
  FINANCE: 'Finance',
  IT: 'Information Technology',
  OPERATIONS: 'Operations',
  SALES: 'Sales',
  MARKETING: 'Marketing'
};

// Helper function to check user permissions
const hasPermission = (user, requiredRole) => {
  if (!user || !user.role) return false;
  
  const roleHierarchy = {
    [ROLES.ADMIN]: 4,
    [ROLES.MANAGER]: 3,
    [ROLES.SUPERVISOR]: 2,
    [ROLES.STAFF]: 1,
    [ROLES.USER]: 0
  };
  
  // Handle both object (user.role.name) and string (user.role) formats
  const userRoleName = typeof user.role === 'object' ? user.role.name : user.role;
  const userRoleLevel = roleHierarchy[(userRoleName || '').toLowerCase()] || 0;
  const requiredRoleLevel = roleHierarchy[(requiredRole || '').toLowerCase()] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
};

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
  const [userRoles, setUserRoles] = useState([]);
  const [userDepartments, setUserDepartments] = useState([]);
  const [permissions, setPermissions] = useState({});

  // Role checking functions
  const hasRole = (role) => {
    if (!user) return false;
    // Handle both object and string role formats, case-insensitive
    const userRole = (user.role?.name || user.role || '').toLowerCase();
    const checkRole = (role || '').toLowerCase();
    return userRole === checkRole;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    const userRole = (user.role?.name || user.role || '').toLowerCase();
    return roles.some(role => userRole === (role || '').toLowerCase());
  };

  const isInDepartment = (departmentId) => {
    if (!user || !user.departments) return false;
    return user.departments.some(dept => dept.id === departmentId);
  };

  const canManageDepartment = (departmentId) => {
    if (!user) return false;
    if (hasRole(ROLES.ADMIN)) return true;
    if (!user.managedDepartments) return false;
    return user.managedDepartments.some(dept => dept.id === departmentId);
  };

  // Function to validate and refresh token
  const validateToken = useCallback(async (tokenToValidate) => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/me/', {
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`,
          'Accept': 'application/json',
        },
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }, []);

  // Function to refresh token
  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(
        'http://localhost:8000/api/auth/token/refresh/',
        { refresh: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data?.access) {
        const newToken = response.data.access;
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return newToken;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  }, []);

  // Fetch user data when token changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserData = async () => {
      if (!token) {
        // Check for token in localStorage if not in state
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const isValid = await validateToken(storedToken);
          if (isValid) {
            setToken(storedToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            return; // Will trigger the effect again with the new token
          } else {
            // Try to refresh the token
            const newToken = await refreshToken();
            if (newToken) {
              setToken(newToken);
              return; // Will trigger the effect again with the new token
            }
          }
        }
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // Fetch user data
        const [userResponse, rolesResponse, departmentsResponse] = await Promise.all([
          api.get('/users/me/'),
          api.get('/users/roles/'),
          api.get('/departments/')
        ]);
        
        if (!isMounted) return;
        
        const userData = userResponse.data;
        setUser(userData);
        setUserRoles(rolesResponse.data || []);
        
        // Filter departments based on user's access
        const userDepts = departmentsResponse.data.filter(dept => 
          dept.members?.some(member => member.id === userData.id) ||
          dept.managers?.some(manager => manager.id === userData.id)
        );
        setUserDepartments(userDepts);
        
        // Set permissions based on role
        setPermissions({
          canManageUsers: hasPermission(userData, ROLES.ADMIN) || hasPermission(userData, ROLES.MANAGER),
          canManageDepartments: hasPermission(userData, ROLES.ADMIN) || hasPermission(userData, ROLES.HR),
          canViewReports: hasPermission(userData, ROLES.ADMIN) || 
                         hasPermission(userData, ROLES.MANAGER) || 
                         hasPermission(userData, ROLES.SUPERVISOR),
          canManageTasks: true,
          canManageAllTasks: hasPermission(userData, ROLES.ADMIN) || hasPermission(userData, ROLES.MANAGER)
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (isMounted) {
          if (err.response?.status === 401) {
            // Try to refresh token on 401
            const newToken = await refreshToken();
            if (newToken) {
              setToken(newToken);
              return;
            }
          }
          setError('Failed to load user data. Please log in again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();
    
    return () => {
      isMounted = false;
    };
  }, [token, validateToken, refreshToken]);

  /**
   * Login user with email and password
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Clear any existing tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];

      const formData = new URLSearchParams();
      formData.append('email', email); // Changed from 'username' to 'email' to match backend expectation
      formData.append('password', password);

      console.log('Attempting login with:', { email });
      
      const response = await axios({
        method: 'post',
        url: 'http://localhost:8000/api/auth/token/',
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        timeout: 15000, // Increased timeout
      });

      console.log('Login response:', response.data);

      if (!response.data?.access) {
        throw new Error('Authentication failed: No access token received');
      }

      const { access: newToken, refresh: refreshToken } = response.data;
      
      // Store tokens
      localStorage.setItem('token', newToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Set the token in the API client
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);

      // Fetch and set user data
      console.log('Fetching user data...');
      const userResponse = await api.get('/users/me/');
      setUser(userResponse.data);
      
      console.log('Login successful for user:', userResponse.data.email);
      return userResponse.data;
      
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data
        }
      });

      let errorMessage = 'Failed to log in. Please try again.';

      if (err.response) {
        if (err.response.status === 400 || err.response.status === 401) {
          errorMessage = 'Invalid email or password';
          // Clear any invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setToken(null);
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data?.non_field_errors) {
          errorMessage = Array.isArray(err.response.data.non_field_errors)
            ? err.response.data.non_field_errors.join(' ')
            : err.response.data.non_field_errors;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Cannot connect to the server. Please check your internet connection.';
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
    roles: userRoles,
    departments: userDepartments,
    permissions,
    hasRole,
    hasAnyRole,
    isInDepartment,
    canManageDepartment,
    ROLES,
    DEPARTMENTS
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
