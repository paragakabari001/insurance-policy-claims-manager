import React, { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'slate';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'indigo',
}) => {
  const variantStyles = {
    indigo: {
      bg: 'bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100',
      iconBg: 'bg-indigo-600 text-white shadow-indigo-600/20',
      text: 'text-indigo-900',
    },
    emerald: {
      bg: 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-600/20',
      text: 'text-emerald-900',
    },
    amber: {
      bg: 'bg-amber-50/50 hover:bg-amber-50 border-amber-100',
      iconBg: 'bg-amber-600 text-white shadow-amber-600/20',
      text: 'text-amber-900',
    },
    purple: {
      bg: 'bg-purple-50/50 hover:bg-purple-50 border-purple-100',
      iconBg: 'bg-purple-600 text-white shadow-purple-600/20',
      text: 'text-purple-900',
    },
    slate: {
      bg: 'bg-slate-50 hover:bg-slate-100/60 border-slate-200',
      iconBg: 'bg-slate-700 text-white shadow-slate-700/20',
      text: 'text-slate-900',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`p-5 rounded-2xl bg-white border ${style.bg} shadow-sm transition-all duration-200 flex items-center justify-between`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          {title}
        </p>
        <p className={`text-2xl font-black ${style.text} tracking-tight`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${style.iconBg}`}>
        {icon}
      </div>
    </div>
  );
};
