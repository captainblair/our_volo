import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadDepartmentData();
    }
  }, [selectedDepartment]);

  const loadDepartments = async () => {
    try {
      const response = await api.get('/departments/');
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    }
  };

  const loadDepartmentData = async () => {
    setLoading(true);
    try {
      const [usersRes, tasksRes, messagesRes] = await Promise.all([
        selectedDepartment === 'all' 
          ? api.get('/users/').catch(() => ({ data: [] }))
          : api.get(`/users/?department=${selectedDepartment}`).catch(() => ({ data: [] })),
        selectedDepartment === 'all'
          ? api.get('/tasks/').catch(() => ({ data: [] }))
          : api.get(`/tasks/?department=${selectedDepartment}`).catch(() => ({ data: [] })),
        selectedDepartment === 'all'
          ? api.get('/messaging/department/').catch(() => ({ data: [] }))
          : api.get(`/messaging/department/?department=${selectedDepartment}`).catch(() => ({ data: [] }))
      ]);
      
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
    } catch (error) {
      console.error('Error loading department data:', error);
      setUsers([]);
      setTasks([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Unknown';
  };

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' ? 'bg-black' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Admin Dashboard</h1>
          <p className={`text-sm sm:text-base ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>Manage all departments and users</p>
        </div>

        {/* Department Selector */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>Select Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Users Section */}
            <div className={`rounded-lg shadow-md p-4 sm:p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Users ({users.length})</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.length > 0 ? users.map(user => (
                  <div key={user.id} className={`p-3 rounded border ${
                    theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user.first_name} {user.last_name}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {user.email}
                    </div>
                    <div className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {getDepartmentName(user.department_id)} • {user.role?.name || 'User'}
                    </div>
                  </div>
                )) : (
                  <p className={`text-center py-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>No users found</p>
                )}
              </div>
            </div>

            {/* Tasks Section */}
            <div className={`rounded-lg shadow-md p-4 sm:p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Tasks ({tasks.length})</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.length > 0 ? tasks.map(task => (
                  <div key={task.id} className={`p-3 rounded border ${
                    theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {getDepartmentName(task.department_id)}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className={`text-center py-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>No tasks found</p>
                )}
              </div>
            </div>

            {/* Messages Section */}
            <div className={`rounded-lg shadow-md p-4 sm:p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Messages ({messages.length})</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.length > 0 ? messages.map(message => (
                  <div key={message.id} className={`p-3 rounded border ${
                    theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {message.content}
                    </div>
                    <div className={`text-xs mt-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {message.sender?.first_name} {message.sender?.last_name} • {getDepartmentName(message.department_id)}
                    </div>
                  </div>
                )) : (
                  <p className={`text-center py-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>No messages found</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}