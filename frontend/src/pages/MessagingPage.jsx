import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useNotifications from '../hooks/useNotifications';
import { BsSend, BsPeople, BsChatDots, BsFilter } from 'react-icons/bs';

export default function MessagingPage(){
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Check if user is admin
    const roleCheck = user?.role?.name?.toLowerCase() === 'admin';
    setIsAdmin(roleCheck);
    
    // Load departments if admin
    if (roleCheck) {
      api.get('/departments/').then(res => {
        setDepartments(res.data || []);
      }).catch(err => console.error('Error loading departments:', err));
    }
  }, [user]);

  const load = async (deptId = selectedDept) => {
    try {
      setLoading(true);
      const config = {};
      if (isAdmin && deptId && deptId !== 'all') {
        config.params = { dept_id: deptId };
      }
      const response = await api.get('/messaging/department/', config);
      // Sort messages by timestamp (oldest first for chat)
      const sortedMessages = (response.data || []).sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      setMessages(sortedMessages);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (isAdmin !== null) {
      load(); 
    }
  }, [isAdmin]);
  
  useEffect(() => {
    if (isAdmin && selectedDept !== '') {
      load(selectedDept);
    }
  }, [selectedDept]);
  
  useNotifications(useCallback(() => { load(); }, [selectedDept]));

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    try {
      await api.post('/messaging/department/', { message_body: text });
      setText(''); 
      await load();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  const isMyMessage = (message) => {
    return message.sender?.id === user?.id || message.sender?.email === user?.email;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <BsPeople className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                {isAdmin && selectedDept && selectedDept !== 'all' 
                  ? departments.find(d => String(d.id) === selectedDept)?.name || 'Department'
                  : isAdmin && selectedDept === 'all'
                  ? 'All Departments'
                  : user?.department?.name || 'Department'} Chat
              </h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {messages.length} messages
              </p>
            </div>
          </div>
          
          {/* Admin Department Filter */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <BsFilter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <BsChatDots className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation with your team!</p>
          </div>
        ) : (
          messages.map((m, index) => {
            const isMine = isMyMessage(m);
            const showDate = index === 0 || 
              new Date(messages[index - 1].timestamp).toDateString() !== new Date(m.timestamp).toDateString();
            
            return (
              <React.Fragment key={m.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                      {new Date(m.timestamp).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isMine && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {(m.sender?.first_name?.[0] || m.sender?.email?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                    <div>
                      {!isMine && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-1">
                          {m.sender?.first_name || m.sender?.email || 'Unknown'}
                        </p>
                      )}
                      <div className={`rounded-2xl px-4 py-2 ${
                        isMine 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none'
                      }`}>
                        <p className="text-sm md:text-base break-words">{m.message_body}</p>
                      </div>
                      <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 px-1 ${isMine ? 'text-right' : 'text-left'}`}>
                        {formatTime(m.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4">
        <form onSubmit={send} className="flex items-center space-x-2 md:space-x-4">
          <input 
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 md:px-6 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm md:text-base" 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Type your message..." 
          />
          <button 
            type="submit"
            className="h-10 w-10 md:h-12 md:w-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            disabled={!text.trim()}
          >
            <BsSend className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
