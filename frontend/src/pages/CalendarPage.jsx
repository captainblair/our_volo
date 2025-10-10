import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { BsChevronLeft, BsChevronRight, BsCalendarPlus, BsCircleFill } from 'react-icons/bs';
import api from '../services/api';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks/');
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <BsChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <BsChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
        {days.map((day) => (
          <div
            key={day}
            className="bg-gray-50 dark:bg-gray-800 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      return isSameDay(parseISO(task.due_date), date);
    });
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayTasks = getTasksForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = isSameDay(day, selectedDate);
        const isTodayDate = isToday(day);

        days.push(
          <div
            key={day}
            onClick={() => setSelectedDate(cloneDay)}
            className={`min-h-[100px] bg-white dark:bg-gray-800 p-2 cursor-pointer transition-colors ${
              !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900 text-gray-400' : ''
            } ${isSelected ? 'ring-2 ring-primary-500' : ''} hover:bg-gray-50 dark:hover:bg-gray-700`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-sm font-medium ${
                  isTodayDate
                    ? 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                    : isCurrentMonth
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400'
                }`}
              >
                {format(day, 'd')}
              </span>
            </div>
            <div className="space-y-1">
              {dayTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className={`text-xs p-1 rounded truncate ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : task.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                  title={task.task_title}
                >
                  <BsCircleFill className="inline h-2 w-2 mr-1" />
                  {task.task_title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                  +{dayTasks.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-px">{rows}</div>;
  };

  const renderSelectedDateTasks = () => {
    const dayTasks = getTasksForDate(selectedDate);
    
    return (
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tasks for {format(selectedDate, 'MMMM d, yyyy')}
        </h2>
        {dayTasks.length === 0 ? (
          <div className="text-center py-8">
            <BsCalendarPlus className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No tasks scheduled for this day
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => window.location.href = `/tasks/${task.id}`}
              >
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.task_title}
                  </h3>
                  {task.task_desc && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {task.task_desc}
                    </p>
                  )}
                  <div className="mt-2 flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : task.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.priority && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                    {task.assigned_to && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Assigned to: {task.assigned_to.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {renderHeader()}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {renderDays()}
        {renderCells()}
      </div>
      {renderSelectedDateTasks()}
    </div>
  );
}
