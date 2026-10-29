import React from 'react';
import { ActiveView } from './Sidebar';
import { User } from '../types';
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-3 pb-4 pt-1 pointer-events-none">
      <nav className="pointer-events-auto bg-[#06241b]/95 backdrop-blur-xl border border-emerald-500/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.36)] rounded-2xl p-1.5 flex items-center justify-around">
        {/* Dashboard */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex-1 py-2 px-2 flex flex-col items-center gap-1 rounded-xl transition-all ${
            activeView === 'dashboard'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
              : 'text-emerald-100/70 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>

        {/* Policies */}
        <button
          onClick={() => setActiveView('policies')}
          className={`flex-1 py-2 px-2 flex flex-col items-center gap-1 rounded-xl transition-all relative ${
            activeView === 'policies'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
              : 'text-emerald-100/70 hover:text-white'
          }`}
        >
          <div className="relative">
            <FileText className="w-4 h-4" />
            {policiesCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full text-[9px] font-black flex items-center justify-center ${
                  activeView === 'policies'
                    ? 'bg-slate-950 text-emerald-300'
                    : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {policiesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Policies</span>
        </button>

        {/* Claims */}
        <button
          onClick={() => setActiveView('claims')}
          className={`flex-1 py-2 px-2 flex flex-col items-center gap-1 rounded-xl transition-all relative ${
            activeView === 'claims'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
              : 'text-emerald-100/70 hover:text-white'
          }`}
        >
          <div className="relative">
            <FileCheck2 className="w-4 h-4" />
            {pendingClaimsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center animate-pulse">
                {pendingClaimsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Claims</span>
        </button>

        {/* Profiles / Quick Switch */}
        <button
          onClick={onOpenProfileDrawer}
          className="flex-1 py-2 px-2 flex flex-col items-center gap-1 rounded-xl text-emerald-100/70 hover:text-white transition-all"
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Profiles</span>
        </button>
      </nav>
    </div>
  );
};
