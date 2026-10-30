import React from 'react';
import { ActiveView } from './Sidebar';
import { User } from '../types';
import {
  Home,
  FileText,
  ShieldCheck,
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#031d16]/98 backdrop-blur-2xl border-t border-emerald-500/25 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] rounded-t-[28px] sm:rounded-t-[32px] px-3 pt-2 pb-[max(env(safe-area-inset-bottom),14px)]">
      <nav className="flex items-center justify-around gap-1">
        {/* Dashboard */}
        <a
          href="/dashboard"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              setActiveView('dashboard');
            }
          }}
          className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all ${
            activeView === 'dashboard'
              ? 'bg-[#062c21] border border-emerald-500/50 text-[#00c569] font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeView === 'dashboard' ? 'text-[#00c569]' : 'text-slate-400'}`} />
          <span className="text-[11px] font-medium tracking-tight">Dashboard</span>
        </a>

        {/* Policies */}
        <a
          href="/policies"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              setActiveView('policies');
            }
          }}
          className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all relative ${
            activeView === 'policies'
              ? 'bg-[#062c21] border border-emerald-500/50 text-[#00c569] font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <FileText className={`w-5 h-5 ${activeView === 'policies' ? 'text-[#00c569]' : 'text-slate-400'}`} />
            {policiesCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#00c569] text-slate-950 text-[9px] font-black flex items-center justify-center shadow-xs">
                {policiesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight">Policies</span>
        </a>

        {/* Claims */}
        <a
          href="/claims"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              setActiveView('claims');
            }
          }}
          className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all relative ${
            activeView === 'claims'
              ? 'bg-[#062c21] border border-emerald-500/50 text-[#00c569] font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShieldCheck className={`w-5 h-5 ${activeView === 'claims' ? 'text-[#00c569]' : 'text-slate-400'}`} />
            {pendingClaimsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {pendingClaimsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight">Claims</span>
        </a>

        {/* Profiles / Quick Switch */}
        <button
          onClick={onOpenProfileDrawer}
          className="flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-2xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <Users className="w-5 h-5 text-slate-400" />
          <span className="text-[11px] font-medium tracking-tight">Profiles</span>
        </button>
      </nav>
    </div>
  );
};
