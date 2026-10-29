import React from 'react';
import { User } from '../types';
import { ActiveView } from './Sidebar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Plus,
  RefreshCw,
  PanelLeft,
  LayoutDashboard,
  FileText,
  FileCheck2,
  ChevronRight,
  Activity,
} from 'lucide-react';

interface TopBarProps {
  user: User;
  activeView: ActiveView;
  onOpenCreatePolicy?: () => void;
  onOpenSubmitClaim?: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  activeView,
  onOpenCreatePolicy,
  onOpenSubmitClaim,
  onRefresh,
  isLoading = false,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const isAdmin = user.role === 'Administrator';

  const viewConfig: Record<
    ActiveView,
    { title: string; subtitle: string; icon: React.ReactNode }
  > = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview & Portfolio Analytics',
      icon: <LayoutDashboard className="w-4 h-4 text-emerald-700" />,
    },
    policies: {
      title: 'Policies',
      subtitle: 'Underwriting & Coverage Ledger',
      icon: <FileText className="w-4 h-4 text-emerald-700" />,
    },
    claims: {
      title: 'Claims',
      subtitle: 'Adjudication & Claims Review',
      icon: <FileCheck2 className="w-4 h-4 text-emerald-700" />,
    },
  };

  const currentView = viewConfig[activeView];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs backdrop-blur-md bg-white/95">
      {/* Left: Breadcrumbs & Collapse Toggle */}
      <div className="flex items-center gap-3">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/60 shadow-2xs"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="hidden sm:block h-5 w-px bg-slate-200" />

        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium hidden md:inline">TailVaR</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden md:inline" />
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-50 border border-emerald-200/60">
              {currentView.icon}
            </span>
            <div>
              <span className="font-bold text-slate-900 text-sm leading-tight block">
                {currentView.title}
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden lg:block">
                {currentView.subtitle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: System Status Badge (Large screens) */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 shadow-2xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-semibold text-slate-700">ACID Ledger Active</span>
        <span className="text-slate-300">&bull;</span>
        <span>IST (Asia/Kolkata)</span>
      </div>

      {/* Right: User Role & Actions */}
      <div className="flex items-center gap-3">
        {/* User Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/70 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-bold text-slate-800">{user.name}</p>
            <p className="text-[10px] text-emerald-700 font-semibold">{user.role}</p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/60 transition-colors shadow-2xs disabled:opacity-50"
          title="Refresh Data"
          aria-label="Refresh Data"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`}
          />
        </button>

        {/* Primary Action Button (Single clear action per view) */}
        {isAdmin && (activeView === 'policies' || activeView === 'dashboard') && onOpenCreatePolicy && (
          <Button
            onClick={onOpenCreatePolicy}
            size="sm"
            className="bg-[#06241b] hover:bg-[#083528] text-white rounded-xl h-9 px-4 text-xs font-bold shadow-md shadow-emerald-950/20 gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Create Policy</span>
          </Button>
        )}

        {!isAdmin && (activeView === 'claims' || activeView === 'dashboard') && onOpenSubmitClaim && (
          <Button
            onClick={onOpenSubmitClaim}
            size="sm"
            className="bg-[#06241b] hover:bg-[#083528] text-white rounded-xl h-9 px-4 text-xs font-bold shadow-md shadow-emerald-950/20 gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Submit Claim</span>
          </Button>
        )}
      </div>
    </header>
  );
};
