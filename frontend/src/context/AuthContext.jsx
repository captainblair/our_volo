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
  
  const userRoleLevel = roleHierarchy[user.role.toLowerCase()] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole.toLowerCase()] || 0;
  
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
    return user.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.some(role => user.role === role);
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

  // Fetch user data when token changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const [userResponse, rolesResponse, departmentsResponse] = await Promise.all([
            api.get('/users/me/'),
            api.get('/users/roles/'),
            api.get('/departments/')
          ]);
          
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
            canManageTasks: true, // All users can manage their own tasks
            canManageAllTasks: hasPermission(userData, ROLES.ADMIN) || hasPermission(userData, ROLES.MANAGER)
          });
          
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
