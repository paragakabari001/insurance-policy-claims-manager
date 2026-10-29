import React from 'react';
import { User } from '../types';
import {
  Shield,
  LayoutDashboard,
  FileText,
  FileCheck2,
  PieChart,
  LogOut,
  Users,
  Search,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from './ui/badge';

interface SidebarProps {
  user: User;
  activeTab: 'overview' | 'policies' | 'claims' | 'accounting';
  setActiveTab: (tab: 'overview' | 'policies' | 'claims' | 'accounting') => void;
  onLogout: () => void;
  onQuickSwitch: (username: string) => void;
  pendingClaimsCount?: number;
  policiesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onQuickSwitch,
  pendingClaimsCount = 0,
  policiesCount = 0,
}) => {
  const isAdmin = user.role === 'Administrator';

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm shadow-slate-900/10">
            <Shield className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">TailVaR</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Claims & Policy Manager</p>
          </div>
        </div>
      </div>

      {/* Search Input Box (Visual style like Flowly / Optima) */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            readOnly
            placeholder="Quick search..."
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-500 cursor-pointer focus:outline-none"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 px-1 py-0.2 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {/* Main Section */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            General
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'policies'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Policies</span>
              </div>
              {policiesCount > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'policies'
                      ? 'bg-slate-800 text-teal-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {policiesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('claims')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'claims'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4" />
                <span>Claims</span>
              </div>
              {pendingClaimsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 animate-pulse">
                  {pendingClaimsCount} new
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('accounting')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'accounting'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PieChart className="w-4 h-4" />
                <span>SI Ledger / Rules</span>
              </div>
              <Badge variant="teal" className="text-[9px] px-1.5 py-0">
                Live
              </Badge>
            </button>
          </nav>
        </div>

        {/* 1-Click Evaluation Switcher */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Evaluator Quick Login
            </p>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onQuickSwitch('customer1')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                user.username === 'customer1'
                  ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <span>Customer 1</span>
              {user.username === 'customer1' && <CheckCircle className="w-3 h-3 text-teal-600" />}
            </button>

            <button
              onClick={() => onQuickSwitch('customer2')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                user.username === 'customer2'
                  ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200/80'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <span>Customer 2</span>
              {user.username === 'customer2' && <CheckCircle className="w-3 h-3 text-sky-600" />}
            </button>

            <button
              onClick={() => onQuickSwitch('admin')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                user.username === 'admin'
                  ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200/80'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <span>Administrator</span>
              {user.username === 'admin' && <CheckCircle className="w-3 h-3 text-purple-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* User Card at Bottom (Matching Image 1 "Mario Angelo - Finance Staff") */}
      <div className="p-3 border-t border-slate-100">
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate leading-tight">{user.name}</p>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-sky-100 text-sky-700'
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
