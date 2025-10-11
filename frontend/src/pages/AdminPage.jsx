import React, { useEffect, useState } from 'react';
import { BsPeople, BsBuilding, BsShieldCheck, BsClipboardData, BsPencil, BsTrash, BsChatDots } from 'react-icons/bs';
import api from '../services/api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  // Messaging state (admin)
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [adminMessages, setAdminMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [msgSearch, setMsgSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, deptsRes, rolesRes, logsRes] = await Promise.all([
        api.get('/users/manage/').catch(() => ({ data: [] })),
        api.get('/departments/').catch(() => ({ data: [] })),
        api.get('/users/roles/').catch(() => ({ data: [] })),
        api.get('/adminpanel/logs/').catch(() => ({ data: [] }))
      ]);
      
      setUsers(usersRes.data);
      setDepartments(deptsRes.data);
      setRoles(rolesRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for admin with optional department filter
  const loadAdminMessages = async (deptId) => {
    setLoadingMessages(true);
    try {
      const config = {};
      if (deptId && deptId !== 'all') {
        config.params = { dept_id: deptId };
      }
      const res = await api.get('/messaging/department/', config);
      // Sort by newest first for overview
      const data = Array.isArray(res.data) ? res.data.slice().sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp)) : [];
      setAdminMessages(data);
    } catch (e) {
      console.error('Error loading admin messages', e);
      setAdminMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // When switching to messages tab or department changes, load
  useEffect(() => {
    if (activeTab === 'messages') {
      loadAdminMessages(selectedDeptId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDeptId]);

  const handleUpdateUser = async (userId, data) => {
    try {
      await api.post(`/users/manage/${userId}/assign_role/`, data);
      await loadData();
      setEditingUser(null);
      alert('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: <BsPeople /> },
    { id: 'departments', label: 'Departments', icon: <BsBuilding /> },
    { id: 'roles', label: 'Roles', icon: <BsShieldCheck /> },
    { id: 'messages', label: 'Messages', icon: <BsChatDots /> },
    { id: 'logs', label: 'Audit Logs', icon: <BsClipboardData /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage users, departments, roles, and system settings
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total users: {users.length}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                          {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <select
                          defaultValue={user.role?.id}
                          onChange={(e) => handleUpdateUser(user.id, { role_id: e.target.value })}
                          className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role?.name === 'Admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                            : user.role?.name === 'Manager'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {user.role?.name || 'No Role'}
                        </span>
                      )}

      {/* Messages Tab (Admin) */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar: Departments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-max">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Departments</h2>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedDeptId('all')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedDeptId === 'all' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                All Departments
              </button>
              {departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeptId(String(d.id))}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedDeptId === String(d.id) ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content: Messages */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDeptId==='all' ? 'All Departments' : (departments.find(x=> String(x.id)===String(selectedDeptId))?.name || 'Department')} Messages</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{adminMessages.length} messages</p>
              </div>
              <div className="relative w-full md:w-72">
                <input
                  value={msgSearch}
                  onChange={(e)=>setMsgSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {loadingMessages ? (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400">Loading messages...</div>
            ) : adminMessages.length === 0 ? (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400">No messages found</div>
            ) : (
              <div className="space-y-6">
                {/* If All selected, group by department */}
                {selectedDeptId === 'all' ? (
                  Object.entries(
                    adminMessages.reduce((acc, m)=>{
                      const key = m.dept?.name || 'Unknown Department';
                      (acc[key] = acc[key] || []).push(m);
                      return acc;
                    }, {})
                  ).map(([deptName, msgs]) => (
                    <div key={deptName} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <BsBuilding /> {deptName} <span className="text-xs text-gray-400">({msgs.length})</span>
                      </div>
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {msgs
                          .filter(m => !msgSearch || m.message_body?.toLowerCase().includes(msgSearch.toLowerCase()) || m.sender?.first_name?.toLowerCase().includes(msgSearch.toLowerCase()))
                          .map(m => (
                          <div key={m.id} className="p-4 flex justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.sender?.first_name || m.sender?.email || 'Unknown'}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 break-words">{m.message_body}</div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(m.timestamp).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  // Single department list
                  <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                    {adminMessages
                      .filter(m => !msgSearch || m.message_body?.toLowerCase().includes(msgSearch.toLowerCase()) || m.sender?.first_name?.toLowerCase().includes(msgSearch.toLowerCase()))
                      .map(m => (
                      <div key={m.id} className="p-4 flex justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.sender?.first_name || m.sender?.email || 'Unknown'}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 break-words">{m.message_body}</div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(m.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.department?.name || 'No Department'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 mr-3"
                      >
                        <BsPencil className="inline" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => (
              <div key={dept.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BsBuilding className="text-primary-600 text-xl mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{dept.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {users.filter(u => u.department?.id === dept.id).length} members
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Roles</h2>
          <div className="space-y-4">
            {roles.map(role => (
              <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BsShieldCheck className="text-primary-600 text-xl mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{role.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {users.filter(u => u.role?.id === role.id).length} users
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">System activity logs</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No audit logs available
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {log.user_email || 'System'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
