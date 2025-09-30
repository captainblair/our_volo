import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, deptsRes] = await Promise.all([
        api.get('/users/manage/'),
        api.get('/users/roles/'),
        api.get('/users/departments/')
      ]);
      
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId, roleId, departmentId) => {
    try {
      await api.post(`/users/manage/${userId}/assign_role/`, {
        role_id: roleId,
        department_id: departmentId
      });
      
      // Refresh users list
      fetchData();
      alert('Role assigned successfully!');
    } catch (err) {
      alert('Failed to assign role');
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <UserRow 
                key={user.id} 
                user={user} 
                roles={roles} 
                departments={departments}
                onAssignRole={assignRole}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserRow({ user, roles, departments, onAssignRole }) {
  const [selectedRole, setSelectedRole] = useState(user.role?.id || '');
  const [selectedDepartment, setSelectedDepartment] = useState(user.department?.id || '');

  const handleAssign = () => {
    if (selectedRole && selectedDepartment) {
      onAssignRole(user.id, selectedRole, selectedDepartment);
    } else {
      alert('Please select both role and department');
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {user.first_name} {user.last_name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.phone_number || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select 
          value={selectedRole} 
          onChange={(e) => setSelectedRole(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="">Select Role</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select 
          value={selectedDepartment} 
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="">Select Department</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={handleAssign}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Assign
        </button>
      </td>
    </tr>
  );
}