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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around safe-area-bottom">
      {/* Dashboard */}
      <button
        onClick={() => setActiveView('dashboard')}
        className={`flex-1 py-1.5 px-1 flex flex-col items-center gap-1 rounded-xl transition-all ${
          activeView === 'dashboard'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <div
          className={`p-1 rounded-lg ${
            activeView === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : ''
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <span className="text-[10px] leading-none">Dashboard</span>
      </button>

      {/* Policies */}
      <button
        onClick={() => setActiveView('policies')}
        className={`flex-1 py-1.5 px-1 flex flex-col items-center gap-1 rounded-xl transition-all relative ${
          activeView === 'policies'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <div
          className={`p-1 rounded-lg relative ${
            activeView === 'policies' ? 'bg-emerald-50 text-emerald-700' : ''
          }`}
        >
          <FileText className="w-5 h-5" />
          {policiesCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold flex items-center justify-center">
              {policiesCount}
            </span>
          )}
        </div>
        <span className="text-[10px] leading-none">Policies</span>
      </button>

      {/* Claims */}
      <button
        onClick={() => setActiveView('claims')}
        className={`flex-1 py-1.5 px-1 flex flex-col items-center gap-1 rounded-xl transition-all relative ${
          activeView === 'claims'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <div
          className={`p-1 rounded-lg relative ${
            activeView === 'claims' ? 'bg-emerald-50 text-emerald-700' : ''
          }`}
        >
          <FileCheck2 className="w-5 h-5" />
          {pendingClaimsCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-extrabold flex items-center justify-center animate-pulse">
              {pendingClaimsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] leading-none">Claims</span>
      </button>

      {/* Switch Demo Profile / Menu */}
      <button
        onClick={onOpenProfileDrawer}
        className="flex-1 py-1.5 px-1 flex flex-col items-center gap-1 rounded-xl text-slate-500 hover:text-slate-800 font-medium transition-all"
      >
        <div className="p-1 rounded-lg">
          <Users className="w-5 h-5" />
        </div>
        <span className="text-[10px] leading-none">Profiles</span>
      </button>
    </nav>
  );
};
