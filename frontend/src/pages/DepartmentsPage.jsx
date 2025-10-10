import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BsBuilding, BsPeople, BsClipboardCheck, BsChatDots } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptMembers, setDeptMembers] = useState([]);
  const [deptTasks, setDeptTasks] = useState([]);
  
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';

  useEffect(() => {
    loadDepartments();
  }, [user]);

  const loadDepartments = async () => {
    try {
      const response = await api.get('/departments/');
      const allDepts = response.data;
      
      if (isAdmin) {
        // Admin sees all departments
        setDepartments(allDepts);
      } else {
        // Regular user sees only their department
        const userDept = allDepts.find(d => d.id === user?.department?.id);
        setDepartments(userDept ? [userDept] : []);
        if (userDept) {
          setSelectedDept(userDept);
          loadDepartmentDetails(userDept.id);
        }
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentDetails = async (deptId) => {
    try {
      setLoading(true);
      // Load members - try multiple endpoints
      let members = [];
      try {
        const usersRes = await api.get('/users/manage/');
        members = usersRes.data.filter(u => u.department?.id === deptId);
      } catch (err) {
        console.log('Trying alternative user endpoint...');
        // Try alternative endpoint if manage fails
        const usersRes = await api.get('/users/');
        members = usersRes.data.filter(u => u.department?.id === deptId);
      }
      setDeptMembers(members);
      console.log(`Loaded ${members.length} members for department ${deptId}`);
      
      // Load tasks
      const tasksRes = await api.get('/tasks/').catch(() => ({ data: [] }));
      const tasks = tasksRes.data.filter(t => t.department?.id === deptId || t.assigned_department?.id === deptId);
      setDeptTasks(tasks);
    } catch (error) {
      console.error('Error loading department details:', error);
      setDeptMembers([]);
      setDeptTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptClick = (dept) => {
    setSelectedDept(dept);
    loadDepartmentDetails(dept.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Departments</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-700 dark:text-gray-300">
            You are not assigned to any department. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isAdmin ? 'All Departments' : 'My Department'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin ? `Managing ${departments.length} departments` : 'View your department information'}
          </p>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            onClick={() => handleDeptClick(dept)}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedDept?.id === dept.id ? 'ring-2 ring-primary-600' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <BsBuilding className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dept.name}
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <BsPeople className="mr-2" />
                <span>Click to view members</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Department Details */}
      {selectedDept && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {selectedDept.name} - Details
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <BsPeople className="mr-2" />
                  Members ({deptMembers.length})
                </h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {deptMembers.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No members in this department</p>
                ) : (
                  deptMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                        {member.first_name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase()}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {member.role?.name || 'User'} • {member.email}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/messages?dept=${selectedDept.id}`)}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="flex items-center">
                    <BsChatDots className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Department Chat</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Message your team</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate(`/tasks?dept=${selectedDept.id}`)}
                  className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <div className="flex items-center">
                    <BsClipboardCheck className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Department Tasks</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{deptTasks.length} active tasks</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
