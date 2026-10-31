import React from 'react';
import { ActiveView } from './Sidebar';
import { User } from '../types';
import {
  Home,
  FileText,
  ShieldCheck,
  BarChart3,
  Users,
} from 'lucide-react';

interface MobileBottomNavProps {
  user: User;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  pendingClaimsCount?: number;
  policiesCount?: number;
  onOpenProfileDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  user,
  activeView,
  setActiveView,
  pendingClaimsCount = 0,
  policiesCount = 0,
  onOpenProfileDrawer,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-xl border-t border-slate-200/90 rounded-t-[28px] sm:rounded-t-[32px] px-2 pt-2 pb-[max(env(safe-area-inset-bottom),10px)]">
      <nav className="flex items-center justify-around">
        {/* 1. Dashboard */}
        <a
          href="/dashboard"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              setActiveView('dashboard');
            }
          }}
          className="flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 transition-all"
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              activeView === 'dashboard'
                ? 'bg-emerald-50 text-[#00ba63] ring-1 ring-[#00ba63]/25 scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 text-[#00ba63]" />
          </div>
          <span
            className={`text-[10px] tracking-tight transition-colors ${
              activeView === 'dashboard'
                ? 'font-bold text-[#00ba63]'
                : 'font-medium text-slate-500'
            }`}
          >
            Dashboard
          </span>
        </a>

        {/* 2. Policies */}
        <a
          href="/policies"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              setActiveView('policies');
            }
          }}
          className="flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 transition-all relative"
        >
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                activeView === 'policies'
                  ? 'bg-emerald-50 text-[#00ba63] ring-1 ring-[#00ba63]/25 scale-105'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileText className={`w-5 h-5 ${activeView === 'policies' ? 'text-[#00ba63]' : 'text-slate-400'}`} />
            </div>
            {policiesCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#00ba63] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {policiesCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight transition-colors ${
              activeView === 'policies'
                ? 'font-bold text-[#00ba63]'
                : 'font-medium text-slate-500'
            }`}
          >
            Policies
          </span>
        </a>

        {/* 3. Claims */}
        <a
          href="/claims"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              setActiveView('claims');
            }
          }}
          className="flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 transition-all relative"
        >
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                activeView === 'claims'
                  ? 'bg-emerald-50 text-[#00ba63] ring-1 ring-[#00ba63]/25 scale-105'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 ${activeView === 'claims' ? 'text-[#00ba63]' : 'text-slate-400'}`} />
            </div>
            {pendingClaimsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {pendingClaimsCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight transition-colors ${
              activeView === 'claims'
                ? 'font-bold text-[#00ba63]'
                : 'font-medium text-slate-500'
            }`}
          >
            Claims
          </span>
        </a>

        {/* 4. Customers (Admin Only) */}
        {user.role === 'Administrator' ? (
          <a
            href="/customers"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                setActiveView('customers');
              }
            }}
            className="flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 transition-all"
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                activeView === 'customers'
                  ? 'bg-emerald-50 text-[#00ba63] ring-1 ring-[#00ba63]/25 scale-105'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Users className={`w-5 h-5 ${activeView === 'customers' ? 'text-[#00ba63]' : 'text-slate-400'}`} />
            </div>
            <span
              className={`text-[10px] tracking-tight transition-colors ${
                activeView === 'customers'
                  ? 'font-bold text-[#00ba63]'
                  : 'font-medium text-slate-500'
              }`}
            >
              Customers
            </span>
          </a>
        ) : null}

        {/* 5. Analytics */}
        <a
          href="/analytics"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              setActiveView('analytics');
            }
          }}
          className="flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 transition-all"
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              activeView === 'analytics'
                ? 'bg-emerald-50 text-[#00ba63] ring-1 ring-[#00ba63]/25 scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeView === 'analytics' ? 'text-[#00ba63]' : 'text-slate-400'}`} />
          </div>
          <span
            className={`text-[10px] tracking-tight transition-colors ${
              activeView === 'analytics'
                ? 'font-bold text-[#00ba63]'
                : 'font-medium text-slate-500'
            }`}
          >
            Analytics
          </span>
        </a>

        {/* 6. Customer Role (Non-Admin): Menu drawer trigger */}
        {user.role !== 'Administrator' && (
          <button
            onClick={onOpenProfileDrawer}
            className="flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 transition-all"
          >
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-500 tracking-tight">
              Profiles
            </span>
          </button>
        )}
      </nav>
    </div>
  );
};
