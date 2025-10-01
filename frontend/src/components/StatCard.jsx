import React from 'react';

export default function StatCard({ title, value, icon, color = 'bg-gray-100 text-gray-800' }) {
  return (
    <div className="p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow bg-card">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${color}`}>
            {React.isValidElement(icon) ? icon : <span className="text-2xl">{icon}</span>}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-blue-500" 
            style={{ width: `${Math.min(100, (value / 20) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
