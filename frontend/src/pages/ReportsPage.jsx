import React, { useState, useEffect } from 'react';
import { 
  BsCheckCircle, 
  BsArrowRightCircle, 
  BsExclamationCircle, 
  BsXCircle,
  BsArrowUpCircle,
  BsArrowDownCircle,
  BsPeople,
  BsFileText,
  BsCalendarCheck,
  BsClockHistory,
  BsDownload,
  BsFilter
} from 'react-icons/bs';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, usersRes, deptRes] = await Promise.all([
        api.get('/tasks/'),
        api.get('/users/manage/').catch(() => ({ data: [] })),
        api.get('/departments/').catch(() => ({ data: [] })),
      ]);
      
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(task => task.department?.id === parseInt(selectedDepartment));
    }
    
    // Filter by date range
    const now = new Date();
    if (dateRange === 'week') {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      filtered = filtered.filter(task => {
        if (!task.created_at) return false;
        const taskDate = new Date(task.created_at);
        return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
      });
    } else if (dateRange === 'month') {
      const monthAgo = subDays(now, 30);
      filtered = filtered.filter(task => {
        if (!task.created_at) return false;
        return new Date(task.created_at) >= monthAgo;
      });
    }
    
    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Calculate statistics
  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
    cancelled: filteredTasks.filter(t => t.status === 'cancelled').length,
    overdue: filteredTasks.filter(t => {
      if (t.status === 'completed') return false;
      return t.due_date && new Date(t.due_date) < new Date();
    }).length,
    highPriority: filteredTasks.filter(t => t.priority === 'high').length,
  };

  const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;

  // User performance
  const userPerformance = users.map(u => {
    const userTasks = filteredTasks.filter(t => t.assigned_to?.id === u.id);
    const completed = userTasks.filter(t => t.status === 'completed').length;
    return {
      user: u,
      total: userTasks.length,
      completed,
      rate: userTasks.length > 0 ? ((completed / userTasks.length) * 100).toFixed(1) : 0,
    };
  }).filter(u => u.total > 0).sort((a, b) => b.rate - a.rate);

  // Department performance
  const deptPerformance = departments.map(d => {
    const deptTasks = filteredTasks.filter(t => t.department?.id === d.id);
    const completed = deptTasks.filter(t => t.status === 'completed').length;
    return {
      dept: d,
      total: deptTasks.length,
      completed,
      rate: deptTasks.length > 0 ? ((completed / deptTasks.length) * 100).toFixed(1) : 0,
    };
  }).filter(d => d.total > 0).sort((a, b) => b.rate - a.rate);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track team performance and task metrics
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            <option value="week">This Week</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <BsDownload className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <BsFileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{completionRate}% completion rate</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <BsCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <BsArrowRightCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <BsClockHistory className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Status Breakdown</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.completed} / {stats.total}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">In Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.inProgress} / {stats.total}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Pending</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.pending} / {stats.total}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${stats.total > 0 ? (stats.pending / stats.total * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BsPeople className="mr-2 h-5 w-5" />
            User Performance
          </h2>
          {userPerformance.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No user data available</p>
          ) : (
            <div className="space-y-3">
              {userPerformance.slice(0, 5).map((item, idx) => (
                <div key={item.user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                      {item.user.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.completed} / {item.total} tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.rate}%</span>
                    {idx === 0 && <BsArrowUpCircle className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BsCalendarCheck className="mr-2 h-5 w-5" />
            Department Performance
          </h2>
          {deptPerformance.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No department data available</p>
          ) : (
            <div className="space-y-3">
              {deptPerformance.map((item, idx) => (
                <div key={item.dept.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.dept.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.completed} / {item.total} tasks</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.rate}%</span>
                    {idx === 0 && <BsArrowUpCircle className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.highPriority}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">High Priority</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {filteredTasks.filter(t => t.priority === 'medium').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Medium Priority</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {filteredTasks.filter(t => t.priority === 'low').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Low Priority</p>
          </div>
        </div>
      </div>
    </div>
  );
}
