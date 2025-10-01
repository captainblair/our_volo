import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { BsPencil, BsCheck2, BsX, BsEnvelope, BsTelephone, BsBuilding } from 'react-icons/bs';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
  });
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // Load user data
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        department_id: user.department?.id || '',
      });
    }

    // Load departments
    const loadDepartments = async () => {
      try {
        const response = await api.get('/departments/');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };

    loadDepartments();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put(`/users/${user.id}/`, formData);
      updateUser(response.data);
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         'Failed to update profile. Please try again.';
      setMessage({ 
        type: 'error', 
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    // Reset form to original user data
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      department_id: user.department?.id || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className={`rounded-xl shadow-card p-6 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              My Profile
            </h1>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage your personal information and preferences
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
            >
              <BsPencil className="text-sm" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <BsX className="text-lg" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-70"
              >
                <BsCheck2 className="text-lg" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {message.text && (
          <div 
            className={`mb-6 p-4 rounded-md ${
              message.type === 'error' 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-6">
            <div>
              <h2 className={`text-lg font-medium mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Personal Information
              </h2>
              
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.first_name 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.first_name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.last_name 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.last_name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                  </div>
                )}
                
                <div>
                  <label 
                    htmlFor="email" 
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Email Address {isEditing && '*'}
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.email 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center">
                      <BsEnvelope className="text-gray-400 mr-2" />
                      <p className="text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label 
                    htmlFor="phone" 
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      disabled={isSubmitting}
                    />
                  ) : (
                    <div className="flex items-center">
                      <BsTelephone className="text-gray-400 mr-2" />
                      <p className="text-gray-900 dark:text-white">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Department Information */}
          <div>
            <h2 className={`text-lg font-medium mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Department
            </h2>
            
            <div className="space-y-4">
              {isEditing ? (
                <div>
                  <label 
                    htmlFor="department_id" 
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Department
                  </label>
                  <select
                    id="department_id"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    disabled={isLoading || isSubmitting}
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center">
                  <BsBuilding className="text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                    <p className="text-gray-900 dark:text-white">
                      {user.department?.name || 'Not assigned'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Role Information (Read-only) */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role?.toLowerCase() === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {user.role || 'User'}
                  </span>
                </div>
              </div>
              
              {/* Account Status */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    department_id: user.department?.id || '',
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-800">
                {user.first_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-gray-600">{user.role?.name || 'User'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {user.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Department</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {user.department?.name || 'Not assigned'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(user.date_joined).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
