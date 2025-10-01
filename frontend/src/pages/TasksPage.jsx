import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format, parseISO, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns';
import { 
  BsPlusLg, 
  BsFunnel, 
  BsSearch, 
  BsCalendarDate, 
  BsPerson, 
  BsTag, 
  BsThreeDotsVertical,
  BsCheckCircle,
  BsArrowRightCircle,
  BsXCircle,
  BsFilter,
  BsArrowClockwise,
  BsArrowUpCircle,
  BsArrowDownCircle,
  BsExclamationCircle,
  BsFileText
} from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const priorityIcons = {
  low: <BsArrowDownCircle className="text-green-500" />,
  medium: <BsArrowRightCircle className="text-yellow-500" />,
  high: <BsArrowUpCircle className="text-red-500" />,
};

const statusIcons = {
  pending: <BsExclamationCircle className="text-yellow-500" />,
  in_progress: <BsArrowRightCircle className="text-blue-500" />,
  completed: <BsCheckCircle className="text-green-500" />,
  cancelled: <BsXCircle className="text-red-500" />,
};

// Get status options for task status dropdown
const getStatusOptions = (currentStatus) => {
  const statuses = [
    { 
      value: 'pending', 
      label: 'Pending', 
      icon: <BsExclamationCircle className="mr-1.5 h-4 w-4" /> 
    },
    { 
      value: 'in_progress', 
      label: 'In Progress', 
      icon: <BsArrowRightCircle className="mr-1.5 h-4 w-4" /> 
    },
    { 
      value: 'completed', 
      label: 'Completed', 
      icon: <BsCheckCircle className="mr-1.5 h-4 w-4" /> 
    },
    { 
      value: 'cancelled', 
      label: 'Cancelled', 
      icon: <BsXCircle className="mr-1.5 h-4 w-4" /> 
    },
  ];
  
  return statuses.map(status => ({
    ...status,
    active: status.value === currentStatus,
  }));
};

export default function TasksPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // State
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    task_title: '',
    task_desc: '',
    assigned_to: '',
    department: user?.department_id || '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    assigned_to: '',
    priority: '',
    department: '',
    due: '',
    search: '',
  });
  
  // UI state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(null);
  
  // Load tasks, users, and departments
  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const [tasksRes, usersRes, deptRes] = await Promise.all([
        api.get('/tasks/'),
        api.get('/users/manage/').catch(() => ({ data: [] })),
        api.get('/departments/').catch(() => ({ data: [] })),
      ]);
      
      setTasks(tasksRes.data);
      setFilteredTasks(tasksRes.data);
      setUsers(usersRes.data);
      setDepartments(deptRes.data);
      
      // If there's a taskId in the URL, select that task
      if (taskId) {
        const task = tasksRes.data.find(t => t.id === parseInt(taskId));
        if (task) setSelectedTask(task);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [taskId]);
  
  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  // Apply filters when they change
  useEffect(() => {
    let result = [...tasks];
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }
    
    // Apply assigned_to filter
    if (filters.assigned_to) {
      result = result.filter(task => task.assigned_to?.id === parseInt(filters.assigned_to));
    }
    
    // Apply department filter
    if (filters.department) {
      result = result.filter(task => task.department?.id === parseInt(filters.department));
    }
    
    // Apply priority filter
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }
    
    // Apply due date filter
    if (filters.due) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (filters.due) {
        case 'today':
          result = result.filter(task => isToday(new Date(task.due_date)));
          break;
        case 'tomorrow':
          result = result.filter(task => isTomorrow(new Date(task.due_date)));
          break;
        case 'this_week':
          result = result.filter(task => isThisWeek(new Date(task.due_date), { weekStartsOn: 1 }));
          break;
        case 'overdue':
          result = result.filter(task => new Date(task.due_date) < today && task.status !== 'completed');
          break;
        default:
          break;
      }
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        task => 
          task.task_title.toLowerCase().includes(searchLower) ||
          task.task_desc?.toLowerCase().includes(searchLower) ||
          task.assigned_to?.name?.toLowerCase().includes(searchLower) ||
          task.assigned_by?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, filters]);
  
  // Handle task status update
  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/`, { status: newStatus });
      await loadData();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}/`);
        await loadData();
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task. Please try again.');
      }
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Update existing task
        await api.put(`/tasks/${formData.id}/`, formData);
      } else {
        // Create new task
        await api.post('/tasks/', {
          ...formData,
          assigned_by: user.id
        });
      }
      setIsCreateModalOpen(false);
      setFormData({
        task_title: '',
        task_desc: '',
        assigned_to: '',
        department: user?.department_id || '',
        due_date: '',
        priority: 'medium',
        status: 'pending',
      });
      await loadData();
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task. Please try again.');
    }
  };
  
  // Handle editing a task
  const handleEditTask = (task) => {
    setFormData({
      id: task.id,
      task_title: task.task_title,
      task_desc: task.task_desc || '',
      assigned_to: task.assigned_to?.id || '',
      department: task.department?.id || user?.department_id || '',
      due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
    });
    setIsCreateModalOpen(true);
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: '',
      assigned_to: '',
      priority: '',
      department: '',
      due: '',
      search: '',
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date, { weekStartsOn: 1 })) {
      return format(date, 'EEEE'); // Day of week
    }
    
    return format(date, 'MMM d, yyyy');
  };
  
  // View task details
  const viewTaskDetails = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };
  
  // Create a new task
  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks/', formData);
      // Refresh tasks
      const response = await api.get('/tasks/');
      setTasks(response.data);
      // Reset form and close modal
      setFormData({
        task_title: '',
        task_desc: '',
        assigned_to: '',
        due_date: '',
        priority: 'medium',
        status: 'pending',
      });
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    }
  };
  
  // Update task status
  const updateStatus = async (id, status) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      await api.put(`/tasks/${id}/`, { ...task, status });
      
      // Update local state
      setTasks(prev => 
        prev.map(t => (t.id === id ? { ...t, status } : t))
      );
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };
  
  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Render loading state
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <BsXCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <BsArrowClockwise className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <BsFileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new task.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <BsPlusLg className="-ml-1 mr-2 h-5 w-5" />
            New Task
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <BsFunnel className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
            Filters
          </button>
          
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <BsPlusLg className="-ml-1 mr-2 h-5 w-5" />
            New Task
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BsSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="Search tasks..."
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Assigned To Filter */}
            <div>
              <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assigned To
              </label>
              <select
                id="assigned_to"
                name="assigned_to"
                value={filters.assigned_to}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">Everyone</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Priority Filter */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            {/* Department Filter */}
            <div className="md:col-span-2 lg:col-span-1">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Due Date Filter */}
            <div>
              <label htmlFor="due" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <select
                id="due"
                name="due"
                value={filters.due}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">Anytime</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this_week">This Week</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
            >
              Reset filters
            </button>
          </div>
        </div>
      )}
      
      {/* Tasks Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map(task => {
          const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';
          
          return (
            <div 
              key={task.id} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                isOverdue ? 'border-red-200 dark:border-red-900' : 'border-gray-200 dark:border-gray-700'
              } overflow-hidden hover:shadow-md transition-shadow duration-200`}
              onClick={() => viewTaskDetails(task.id)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white truncate pr-2">
                        {task.task_title}
                      </h3>
                      <div className="flex-shrink-0">
                        {priorityIcons[task.priority] || <BsTag className="text-gray-400" />}
                      </div>
                    </div>
                    
                    {task.task_desc && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {task.task_desc}
                      </p>
                    )}
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {statusIcons[task.status]}
                        <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                      </span>
                      
                      {task.department && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {task.department.name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-2 flex-shrink-0">
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsTaskMenuOpen(isTaskMenuOpen === task.id ? null : task.id);
                        }}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                      >
                        <BsThreeDotsVertical className="h-5 w-5" />
                      </button>
                      
                      {isTaskMenuOpen === task.id && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task);
                                setIsTaskMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Edit Task
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                                setIsTaskMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              Delete Task
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <BsCalendarDate className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <span className={isOverdue && task.status !== 'completed' ? 'text-red-500' : ''}>
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                  
                  {task.assigned_to && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                        {task.assigned_to.name?.[0] || 'U'}
                      </div>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {task.assigned_to.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {task.status !== 'completed' && (
                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 flex justify-between items-center">
                  <div className="flex space-x-2 overflow-x-auto pb-1">
                    {getStatusOptions(task.status).map(option => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(task.id, option.value);
                        }}
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          option.active 
                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600/50'
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Create/Edit Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setFormData({
                      task_title: '',
                      task_desc: '',
                      assigned_to: '',
                      department: user?.department_id || '',
                      due_date: '',
                      priority: 'medium',
                      status: 'pending',
                    });
                  }}
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    {formData.id ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="task_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="task_title"
                          id="task_title"
                          required
                          value={formData.task_title}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="Enter task title"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="task_desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          name="task_desc"
                          id="task_desc"
                          rows={3}
                          value={formData.task_desc}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="Enter task description (optional)"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Assign To
                          </label>
                          <select
                            name="assigned_to"
                            id="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          >
                            <option value="">Select user</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.name || user.username}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Department
                          </label>
                          <select
                            name="department"
                            id="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          >
                            <option value="">Select department</option>
                            {departments.map(dept => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Due Date
                          </label>
                          <input
                            type="date"
                            name="due_date"
                            id="due_date"
                            value={formData.due_date}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Priority
                          </label>
                          <select
                            name="priority"
                            id="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                      </div>
                      
                      {formData.id && (
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                          </label>
                          <select
                            name="status"
                            id="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      )}
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                        >
                          {formData.id ? 'Update Task' : 'Create Task'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateModalOpen(false);
                            setFormData({
                              task_title: '',
                              task_desc: '',
                              assigned_to: '',
                              department: user?.department_id || '',
                              due_date: '',
                              priority: 'medium',
                              status: 'pending',
                            });
                          }}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Render task card
  const TaskCard = ({ task }) => (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => viewTaskDetails(task.id)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900">{task.task_title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.task_desc}</p>
        
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <BsPerson className="mr-1" size={14} />
          <span className="mr-3">{task.assigned_to?.username || 'Unassigned'}</span>
          
          {task.due_date && (
            <>
              <BsCalendarDate className="mr-1" size={14} />
              <span>{format(parseISO(task.due_date), 'MMM d, yyyy')}</span>
            </>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          
          <div className="flex space-x-1">
            {['pending', 'in_progress', 'completed'].map(status => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(task.id, status);
                }}
                className={`text-xs px-2 py-1 rounded ${
                  task.status === status 
                    ? 'bg-primary-100 text-primary-800 border border-primary-300' 
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading tasks</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3
          ">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <BsFunnel className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Filters
            </button>
            
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <BsPlusLg className="-ml-1 mr-2 h-5 w-5" />
              New Task
            </button>
          </div>
        </div>
        
        {/* Filters */}
        {isFilterOpen && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BsSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search tasks..."
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                  id="assigned_to"
                  name="assigned_to"
                  value={filters.assigned_to}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">Everyone</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-800 mr-4"
              >
                Reset filters
              </button>
            </div>
          </div>
        )}
        
        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <BsTag className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new task.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <BsPlusLg className="-ml-1 mr-2 h-5 w-5" />
                New Task
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
      
      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <BsPlusLg className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Task</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Fill in the details below to create a new task.
                    </p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={createTask} className="mt-5 sm:mt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="task_title" className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="task_title"
                      id="task_title"
                      required
                      value={formData.task_title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Task title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="task_desc" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="task_desc"
                      name="task_desc"
                      rows={3}
                      value={formData.task_desc}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Task description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                        Assign To
                      </label>
                      <select
                        id="assigned_to"
                        name="assigned_to"
                        value={formData.assigned_to}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select a user</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="due_date"
                        id="due_date"
                        value={formData.due_date}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                  >
                    Create Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
