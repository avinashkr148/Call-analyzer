
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, accentColor }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-slate-700 transition-all group">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${accentColor} bg-opacity-10 text-opacity-100 transition-transform group-hover:scale-110 duration-300`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  </div>
);
