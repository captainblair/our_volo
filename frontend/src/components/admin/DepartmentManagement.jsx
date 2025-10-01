import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  BsBuilding, BsPencil, BsTrash, BsPlus, BsCheckLg, BsXLg, 
  BsShieldLock, BsPeople, BsPersonPlus, BsPersonX 
} from 'react-icons/bs';

export default function DepartmentManagement() {
  const { user, hasRole, ROLES, permissions } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [showUserManagement, setShowUserManagement] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_id: ''
  });

  // Fetch departments and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptsRes, usersRes] = await Promise.all([
          api.get('/departments/'),
          api.get('/users/')
        ]);
        
        setDepartments(deptsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (dept) => {
    setEditingDept(dept.id);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      manager_id: dept.manager?.id || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingDept(null);
    setShowUserManagement(null);
    setFormData({ name: '', description: '', manager_id: '' });
  };

  const handleSaveDepartment = async (deptId = null) => {
    try {
      setLoading(true);
      let response;
      
      if (deptId) {
        // Update existing department
        response = await api.put(`/departments/${deptId}/`, formData);
        setDepartments(departments.map(d => 
          d.id === deptId ? { ...d, ...response.data } : d
        ));
      } else {
        // Create new department
        response = await api.post('/departments/', formData);
        setDepartments([...departments, response.data]);
      }
      
      handleCancelEdit();
    } catch (err) {
      console.error('Error saving department:', err);
      setError('Failed to save department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/departments/${deptId}/`);
      setDepartments(departments.filter(d => d.id !== deptId));
    } catch (err) {
      console.error('Error deleting department:', err);
      setError('Failed to delete department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserManagement = (deptId) => {
    setShowUserManagement(showUserManagement === deptId ? null : deptId);
  };

  // Only allow admins and HR to manage departments
  if (!hasRole(ROLES.ADMIN) && !permissions.canManageDepartments) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg inline-flex items-center">
          <BsShieldLock className="mr-2" />
          You don't have permission to access this page.
        </div>
      </div>
    );
  }

  if (loading && departments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Department Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage departments and their members
          </p>
        </div>
        <button
          onClick={() => setEditingDept('new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={editingDept !== null}
        >
          <BsPlus className="mr-2 h-5 w-5" />
          Add Department
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Add/Edit Department Form */}
      {editingDept && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingDept === 'new' ? 'Add New Department' : 'Edit Department'}
          </h3>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department Manager
              </label>
              <select
                id="manager_id"
                name="manager_id"
                value={formData.manager_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:text-white"
              >
                <option value="">Select a manager</option>
                {users
                  .filter(u => hasRole(u.role, [ROLES.ADMIN, ROLES.MANAGER]))
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="sm:col-span-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveDepartment(editingDept === 'new' ? null : editingDept)}
                disabled={!formData.name.trim() || loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Department'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Departments List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {departments.map((dept) => (
                <React.Fragment key={dept.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-200">
                          <BsBuilding className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {dept.name}
                          </div>
                          {dept.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {dept.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {dept.manager ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-200 font-medium">
                            {dept.manager.first_name?.[0]?.toUpperCase()}
                            {dept.manager.last_name?.[0]?.toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {dept.manager.first_name} {dept.manager.last_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {dept.manager.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No manager assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex -space-x-2 overflow-hidden">
                        {dept.members?.slice(0, 5).map((member) => (
                          <div 
                            key={member.id}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-600 text-center leading-8 text-gray-600 dark:text-gray-200 font-medium"
                            title={`${member.first_name} ${member.last_name}`}
                          >
                            {member.first_name?.[0]?.toUpperCase()}
                          </div>
                        ))}
                        {dept.members?.length > 5 && (
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800">
                            +{dept.members.length - 5}
                          </div>
                        )}
                        {(!dept.members || dept.members.length === 0) && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">No members</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleUserManagement(dept.id)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Manage Members"
                        >
                          <BsPeople className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditClick(dept)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          disabled={editingDept !== null}
                          title="Edit Department"
                        >
                          <BsPencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          disabled={editingDept !== null}
                          title="Delete Department"
                        >
                          <BsTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* User Management Panel */}
                  {showUserManagement === dept.id && (
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td colSpan="4" className="px-6 py-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Manage Department Members
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Members</h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {dept.members?.length || 0} members in this department
                                </p>
                              </div>
                              <button
                                onClick={() => {}}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                <BsPersonPlus className="mr-1.5 h-3.5 w-3.5" />
                                Add Members
                              </button>
                            </div>
                            
                            {dept.members?.length > 0 ? (
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                                {dept.members.map((member) => (
                                  <div key={member.id} className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                    <div className="flex items-center">
                                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-200 font-medium text-sm">
                                        {member.first_name?.[0]?.toUpperCase()}
                                        {member.last_name?.[0]?.toUpperCase()}
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {member.first_name} {member.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {member.email}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {}}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                      title="Remove from department"
                                    >
                                      <BsPersonX className="h-5 w-5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                                No members in this department yet.
                              </div>
                            )}
                            
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => setShowUserManagement(null)}
                                className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
