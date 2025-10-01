import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserManagement from './UserManagement';
import DepartmentManagement from './DepartmentManagement';
import { 
  BsPeople, BsBuilding, BsGraphUp, BsShieldLock, 
  BsGear, BsPersonCheck, BsClipboardData 
} from 'react-icons/bs';

const AdminPanel = () => {
  const { hasRole, ROLES } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // Navigation items
  const navItems = [
    {
      id: 'users',
      name: 'User Management',
      icon: <BsPeople className="h-5 w-5" />,
      roles: [ROLES.ADMIN, ROLES.HR],
      component: <UserManagement />
    },
    {
      id: 'departments',
      name: 'Departments',
      icon: <BsBuilding className="h-5 w-5" />,
      roles: [ROLES.ADMIN, ROLES.HR],
      component: <DepartmentManagement />
    },
    {
      id: 'roles',
      name: 'Role Management',
      icon: <BsShieldLock className="h-5 w-5" />,
      roles: [ROLES.ADMIN],
      component: <div className="p-6">Role Management (Coming Soon)</div>
    },
    {
      id: 'permissions',
      name: 'Permissions',
      icon: <BsPersonCheck className="h-5 w-5" />,
      roles: [ROLES.ADMIN],
      component: <div className="p-6">Permissions Management (Coming Soon)</div>
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: <BsClipboardData className="h-5 w-5" />,
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      component: <div className="p-6">Reports Dashboard (Coming Soon)</div>
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: <BsGear className="h-5 w-5" />,
      roles: [ROLES.ADMIN],
      component: <div className="p-6">System Settings (Coming Soon)</div>
    }
  ];

  // Filter navigation items based on user's role
  const filteredNavItems = navItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  // If no tabs are available (no permissions)
  if (filteredNavItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center
         bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
            <BsShieldLock className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p>You don't have permission to access the admin panel.</p>
          </div>
          <div className="mt-6">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go back home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Set default tab if current active tab is not in filtered items
  const activeComponent = filteredNavItems.find(item => item.id === activeTab)?.component || 
                         filteredNavItems[0]?.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Sidebar Navigation */}
            <div className="md:w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Admin Panel</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage your organization
                </p>
              </div>
              <nav className="mt-1">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNavItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                          activeTab === item.id
                            ? 'bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-white border-l-4 border-primary-500'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border-l-4 border-transparent'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {activeComponent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
