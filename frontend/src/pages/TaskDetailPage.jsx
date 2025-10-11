import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { BsArrowLeft, BsPencil, BsSave, BsTrash, BsPerson, BsCalendarDate, BsTag, 
  BsChatSquareText, BsCheckCircle, BsXCircle, BsClock } from 'react-icons/bs';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
];

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    task_title: '',
    task_desc: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
  });
  
  // Load task and users
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [taskRes, usersRes] = await Promise.all([
          api.get(`/tasks/${taskId}/`),
          api.get('/users/manage/').catch(() => ({ data: [] })),
        ]);
        
        setTask(taskRes.data);
        setEditData({
          task_title: taskRes.data.task_title,
          task_desc: taskRes.data.task_desc || '',
          assigned_to: taskRes.data.assigned_to?.id || '',
          due_date: taskRes.data.due_date ? format(parseISO(taskRes.data.due_date), 'yyyy-MM-dd') : '',
          priority: taskRes.data.priority || 'medium',
          status: taskRes.data.status || 'pending',
        });
        setUsers(usersRes.data);
        
        // Load comments if needed
        if (taskRes.data.comments) {
          setComments(taskRes.data.comments);
        } else {
          const commentsRes = await api.get(`/tasks/${taskId}/comments/`).catch(() => ({}));
          if (commentsRes.data) {
            setComments(commentsRes.data);
          }
        }
      } catch (err) {
        console.error('Error loading task:', err);
        console.error('Error details:', err.response?.data);
        // Don't logout on error - just show error message
        if (err.response?.status === 404) {
          setError('Task not found. It may have been deleted.');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view this task.');
        } else {
          setError('Failed to load task. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [taskId]);
  
  // Handle input changes for edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save task changes
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/tasks/${taskId}/`, editData);
      setTask(response.data);
      setIsEditing(false);
      // Show success message or notification
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };
  
  // Delete task
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await api.delete(`/tasks/${taskId}/`);
        navigate('/tasks');
        // Show success message or notification
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task. Please try again.');
      }
    }
  };
  
  // Add a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const response = await api.post(`/tasks/${taskId}/comments/`, {
        content: newComment
      });
      
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };
  
  // Toggle task completion
  const toggleComplete = async () => {
    if (!task) return;
    
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const response = await api.put(`/tasks/${taskId}/`, {
        ...task,
        status: newStatus
      });
      setTask(response.data);
      setEditData(prev => ({
        ...prev,
        status: newStatus
      }));
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return format(parseISO(dateString), 'MMM d, yyyy');
  };
  
  // Get status/priority display info
  const getStatusInfo = (status) => 
    statusOptions.find(s => s.value === status) || { label: status, color: 'bg-gray-100 text-gray-800' };
    
  const getPriorityInfo = (priority) => 
    priorityOptions.find(p => p.value === priority) || { label: priority, color: 'bg-gray-100 text-gray-800' };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {error || 'Task not found'}
        </h3>
        <div className="mt-6">
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <BsArrowLeft className="-ml-1 mr-2 h-5 w-5" />
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }
  
  const statusInfo = getStatusInfo(task.status);
  const priorityInfo = getPriorityInfo(task.priority);
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link 
          to="/tasks" 
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <BsArrowLeft className="mr-2 h-4 w-4" />
          Back to tasks
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {isEditing ? (
                <input
                  type="text"
                  name="task_title"
                  value={editData.task_title}
                  onChange={handleInputChange}
                  className="block w-full border-0 p-0 text-lg font-medium text-gray-900 dark:text-white dark:bg-gray-800 focus:ring-0 focus:outline-none"
                />
              ) : (
                task.task_title
              )}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Task details and information
            </p>
          </div>
          
          <div className="flex space-x-3">
            {!isEditing && (
              <button
                type="button"
                onClick={toggleComplete}
                className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                {task.status === 'completed' ? (
                  <>
                    <BsCheckCircle className="-ml-0.5 mr-1.5 h-4 w-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <BsCheckCircle className="-ml-0.5 mr-1.5 h-4 w-4" />
                    Mark Complete
                  </>
                )}
              </button>
            )}
            
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <BsSave className="-ml-0.5 mr-1.5 h-4 w-4" />
                Save Changes
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <BsPencil className="-ml-0.5 mr-1.5 h-4 w-4" />
                Edit
              </button>
            )}
            
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <BsTrash className="-ml-0.5 mr-1.5 h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <textarea
                    name="task_desc"
                    rows={3}
                    value={editData.task_desc}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add a description..."
                  />
                ) : (
                  <p className="whitespace-pre-line">{task.task_desc || 'No description provided.'}</p>
                )}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select
                    name="assigned_to"
                    value={editData.assigned_to}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                ) : task.assigned_to ? (
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 mr-2">
                      <BsPerson className="h-4 w-4" />
                    </div>
                    <span>{task.assigned_to.username}</span>
                  </div>
                ) : (
                  'Unassigned'
                )}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select
                    name="status"
                    value={editData.status}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                )}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select
                    name="priority"
                    value={editData.priority}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                    {priorityInfo.label}
                  </span>
                )}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="date"
                    name="due_date"
                    value={editData.due_date}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : task.due_date ? (
                  <div className="flex items-center">
                    <BsCalendarDate className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    {formatDate(task.due_date)}
                    {new Date(task.due_date) < new Date() && task.status !== 'completed' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Overdue
                      </span>
                    )}
                  </div>
                ) : (
                  'No due date'
                )}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <BsClock className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {formatDate(task.created_at)}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Comments</h3>
        </div>
        
        {/* Add Comment Form */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
          <form onSubmit={handleAddComment}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <BsPerson className="h-5 w-5" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="border-b border-gray-200 dark:border-gray-700 focus-within:border-primary-500">
                    <label htmlFor="comment" className="sr-only">
                      Add your comment
                    </label>
                    <textarea
                      rows={3}
                      name="comment"
                      id="comment"
                      className="block w-full border-0 border-b border-transparent p-0 pb-2 resize-none focus:ring-0 focus:border-primary-500 sm:text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Add your comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between pt-2">
                    <div className="flex items-center space-x-5">
                      {/* Add attachment buttons here if needed */}
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        disabled={!newComment.trim()}
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        <BsPerson className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.user?.username || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
              <BsChatSquareText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No comments</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get the discussion started by adding a comment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
