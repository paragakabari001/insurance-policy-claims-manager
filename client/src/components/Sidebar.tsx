import React from 'react';
import { User } from '../types';
import {
  Shield,
  LayoutDashboard,
  FileText,
  FileCheck2,
  LogOut,
  CheckCircle,
} from 'lucide-react';

export type ActiveView = 'dashboard' | 'policies' | 'claims';

interface SidebarProps {
  user: User;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout: () => void;
  onQuickSwitch: (username: string) => void;
  pendingClaimsCount?: number;
  policiesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  setActiveView,
  onLogout,
  onQuickSwitch,
  pendingClaimsCount = 0,
  policiesCount = 0,
}) => {
  const isAdmin = user.role === 'Administrator';

  return (
    <aside className="w-56 bg-[#06241b] text-white border-r border-[#0d3b2e] flex flex-col shrink-0 h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-2.5 border-b border-[#0d3b2e]">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
          <Shield className="w-4 h-4 text-slate-950" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-white block">TailVaR</span>
          <span className="text-[11px] text-emerald-300/80 font-normal">Insurance Manager</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400/60 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#093327]'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveView('policies')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'policies'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#093327]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Policies</span>
              </div>
              {policiesCount > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeView === 'policies'
                      ? 'bg-slate-950 text-emerald-300'
                      : 'bg-[#093327] text-emerald-300'
                  }`}
                >
                  {policiesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('claims')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'claims'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#093327]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4" />
                <span>Claims</span>
              </div>
              {pendingClaimsCount > 0 && (
                <span
                  title={`${pendingClaimsCount} pending claims requiring review`}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono"
                >
                  {pendingClaimsCount} pending
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Demo Account Switcher */}
        <div>
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400/60 mb-2">
            Switch Demo User
          </p>
          <div className="space-y-1">
            <button
              onClick={() => onQuickSwitch('customer1')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                user.username === 'customer1'
                  ? 'bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/40'
                  : 'text-emerald-200/70 hover:bg-[#093327] hover:text-white'
              }`}
            >
              <span>Customer 1</span>
              {user.username === 'customer1' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={() => onQuickSwitch('customer2')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                user.username === 'customer2'
                  ? 'bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/40'
                  : 'text-emerald-200/70 hover:bg-[#093327] hover:text-white'
              }`}
            >
              <span>Customer 2</span>
              {user.username === 'customer2' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={() => onQuickSwitch('admin')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                user.username === 'admin'
                  ? 'bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/40'
                  : 'text-emerald-200/70 hover:bg-[#093327] hover:text-white'
              }`}
            >
              <span>Administrator</span>
              {user.username === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* User Card at Bottom */}
      <div className="p-3 border-t border-[#0d3b2e]">
        <div className="p-2 rounded-xl bg-[#093327] border border-[#0f4435] flex items-center justify-between">
          <div className="truncate pr-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-emerald-300/80">{user.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-1 rounded-lg text-emerald-300/70 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
