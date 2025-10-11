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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel } from 'docx';
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
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  // Export functions
  const exportToCSV = () => {
    const headers = ['Task Title', 'Description', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Created At', 'Department'];
    const rows = filteredTasks.map(task => [
      task.task_title || '',
      task.task_desc || '',
      task.status || '',
      task.priority || '',
      task.assigned_to ? `${task.assigned_to.first_name} ${task.assigned_to.last_name}` : 'Unassigned',
      task.due_date || '',
      task.created_at ? format(new Date(task.created_at), 'yyyy-MM-dd HH:mm') : '',
      task.department?.name || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportToJSON = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      date_range: dateRange,
      department: selectedDepartment ? departments.find(d => d.id === parseInt(selectedDepartment))?.name : 'All',
      statistics: stats,
      completion_rate: completionRate,
      tasks: filteredTasks.map(task => ({
        id: task.id,
        title: task.task_title,
        description: task.task_desc,
        status: task.status,
        priority: task.priority,
        assigned_to: task.assigned_to ? {
          name: `${task.assigned_to.first_name} ${task.assigned_to.last_name}`,
          email: task.assigned_to.email
        } : null,
        due_date: task.due_date,
        created_at: task.created_at,
        department: task.department?.name
      }))
    };

    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_report_${format(new Date(), 'yyyy-MM-dd')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Tasks Report', pageWidth / 2, 20, { align: 'center' });
    
    // Report Info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 14, 30);
    doc.text(`Date Range: ${dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'Last 30 Days' : 'All Time'}`, 14, 36);
    doc.text(`Department: ${selectedDepartment ? departments.find(d => d.id === parseInt(selectedDepartment))?.name : 'All Departments'}`, 14, 42);
    
    // Statistics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Statistics', 14, 52);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const statsData = [
      ['Total Tasks', stats.total],
      ['Completed', stats.completed],
      ['In Progress', stats.inProgress],
      ['Pending', stats.pending],
      ['Overdue', stats.overdue],
      ['Completion Rate', `${completionRate}%`]
    ];
    
    doc.autoTable({
      startY: 56,
      head: [['Metric', 'Value']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
      margin: { left: 14, right: 14 }
    });
    
    // Task Details
    const finalY = doc.lastAutoTable.finalY || 56;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Task Details', 14, finalY + 10);
    
    const taskData = filteredTasks.map(task => [
      task.task_title || '',
      task.status?.replace('_', ' ') || '',
      task.priority || '',
      task.assigned_to ? `${task.assigned_to.first_name} ${task.assigned_to.last_name}` : 'Unassigned',
      task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date'
    ]);
    
    doc.autoTable({
      startY: finalY + 14,
      head: [['Title', 'Status', 'Priority', 'Assigned To', 'Due Date']],
      body: taskData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 35 }
      },
      margin: { left: 14, right: 14 }
    });
    
    // Save PDF
    doc.save(`tasks_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    setShowExportMenu(false);
  };

  const exportToWord = async () => {
    // Create statistics table
    const statsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Metric', bold: true })],
              shading: { fill: '2563EB' }
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Value', bold: true })],
              shading: { fill: '2563EB' }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Total Tasks')] }),
            new TableCell({ children: [new Paragraph(stats.total.toString())] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Completed')] }),
            new TableCell({ children: [new Paragraph(stats.completed.toString())] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('In Progress')] }),
            new TableCell({ children: [new Paragraph(stats.inProgress.toString())] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Pending')] }),
            new TableCell({ children: [new Paragraph(stats.pending.toString())] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Overdue')] }),
            new TableCell({ children: [new Paragraph(stats.overdue.toString())] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Completion Rate')] }),
            new TableCell({ children: [new Paragraph(`${completionRate}%`)] })
          ]
        })
      ]
    });

    // Create tasks table
    const tasksTableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Title', bold: true })], shading: { fill: '2563EB' } }),
          new TableCell({ children: [new Paragraph({ text: 'Status', bold: true })], shading: { fill: '2563EB' } }),
          new TableCell({ children: [new Paragraph({ text: 'Priority', bold: true })], shading: { fill: '2563EB' } }),
          new TableCell({ children: [new Paragraph({ text: 'Assigned To', bold: true })], shading: { fill: '2563EB' } }),
          new TableCell({ children: [new Paragraph({ text: 'Due Date', bold: true })], shading: { fill: '2563EB' } })
        ]
      }),
      ...filteredTasks.map(task => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(task.task_title || '')] }),
          new TableCell({ children: [new Paragraph(task.status?.replace('_', ' ') || '')] }),
          new TableCell({ children: [new Paragraph(task.priority || '')] }),
          new TableCell({ children: [new Paragraph(task.assigned_to ? `${task.assigned_to.first_name} ${task.assigned_to.last_name}` : 'Unassigned')] }),
          new TableCell({ children: [new Paragraph(task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date')] })
        ]
      }))
    ];

    const tasksTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tasksTableRows
    });

    // Create document
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: 'Tasks Report',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: `Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `Date Range: ${dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'Last 30 Days' : 'All Time'}`
          }),
          new Paragraph({
            text: `Department: ${selectedDepartment ? departments.find(d => d.id === parseInt(selectedDepartment))?.name : 'All Departments'}`,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: 'Statistics',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          statsTable,
          new Paragraph({
            text: 'Task Details',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 100 }
          }),
          tasksTable
        ]
      }]
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks_report_${format(new Date(), 'yyyy-MM-dd')}.docx`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

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
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <BsDownload className="mr-2 h-4 w-4" />
              Export
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu">
                  <button
                    onClick={exportToCSV}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <BsDownload className="inline mr-2 h-4 w-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <BsDownload className="inline mr-2 h-4 w-4" />
                    Export as PDF
                  </button>
                  <button
                    onClick={exportToWord}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <BsDownload className="inline mr-2 h-4 w-4" />
                    Export as Word
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <BsDownload className="inline mr-2 h-4 w-4" />
                    Export as JSON
                  </button>
                </div>
              </div>
            )}
          </div>
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
