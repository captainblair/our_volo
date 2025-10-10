import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { BsClipboardCheck, BsClockHistory, BsChatDots } from 'react-icons/bs';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState({ tasks: 0, pending: 0, messages: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [tasksRes, messagesRes] = await Promise.all([
          api.get('/tasks/'),
          api.get('/messaging/department/')
        ]);

        const tasks = tasksRes.data || [];
        const messages = messagesRes.data || [];

        setStats({
          tasks: tasks.length,
          pending: tasks.filter(x => x.status === 'pending').length,
          messages: messages.length
        });

        // Get recent tasks (last 5)
        setRecentTasks(tasks.slice(0, 5).map(task => ({
          ...task,
          dueDate: task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date'
        })));

        // Get recent messages (last 5) - filter out read messages
        const readMessages = JSON.parse(localStorage.getItem('readMessages') || '[]');
        const unreadMessages = messages.filter(msg => !readMessages.includes(msg.id));
        setRecentMessages(unreadMessages.slice(0, 5).map(msg => ({
          ...msg,
          timestamp: format(new Date(msg.timestamp), 'MMM dd, yyyy HH:mm')
        })));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleMessageClick = (messageId) => {
    // Mark message as read
    const readMessages = JSON.parse(localStorage.getItem('readMessages') || '[]');
    if (!readMessages.includes(messageId)) {
      readMessages.push(messageId);
      localStorage.setItem('readMessages', JSON.stringify(readMessages));
    }
    // Remove from dashboard
    setRecentMessages(prev => prev.filter(msg => msg.id !== messageId));
    navigate(`/messages/${messageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Dashboard Overview</h1>
        <span className="text-sm text-gray-600">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard 
          title="Department Tasks" 
          value={stats.tasks}
          icon={<BsClipboardCheck className="text-2xl" />}
          color="bg-blue-100 text-blue-800"
        />
        <StatCard 
          title="Pending Tasks" 
          value={stats.pending}
          icon={<BsClockHistory className="text-2xl" />}
          color="bg-yellow-100 text-yellow-800"
        />
        <StatCard 
          title="Department Messages" 
          value={stats.messages}
          icon={<BsChatDots className="text-2xl" />}
          color="bg-green-100 text-green-800"
        />
      </div>

      {/* Recent Tasks and Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Tasks */}
        <div className="bg-card rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Tasks</h2>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-sm text-accent hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className="p-3 rounded-lg hover:bg-card-hover cursor-pointer transition-colors border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.description?.substring(0, 60)}...</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                    <span className="text-xs text-gray-500">Priority: {task.priority || 'Normal'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tasks found</p>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-card rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Messages</h2>
            <button 
              onClick={() => navigate('/messages')}
              className="text-sm text-accent hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <div 
                  key={message.id}
                  onClick={() => handleMessageClick(message.id)}
                  className="p-3 rounded-lg hover:bg-card-hover cursor-pointer transition-colors border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">
                      {message.sender?.first_name || 'Unknown User'}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {message.message_body?.substring(0, 80)}...
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {message.dept?.name || 'Department'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No messages found</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl shadow-card p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/tasks/new')}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl mb-1">➕</span>
            <span className="text-sm">New Task</span>
          </button>
          <button 
            onClick={() => navigate('/messages/new')}
            className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl mb-1">📩</span>
            <span className="text-sm">New Message</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="text-2xl mb-1">👤</span>
            <span className="text-sm">My Profile</span>
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <span className="text-2xl mb-1">⚙️</span>
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
