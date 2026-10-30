import React from 'react';
import { User } from '../types';
import { ActiveView } from './Sidebar';
import { Button } from './ui/button';
import {
  Plus,
  RefreshCw,
  LayoutDashboard,
  FileText,
  FileCheck2,
  ChevronRight,
  Menu,
  Sparkles,
} from 'lucide-react';

interface TopBarProps {
  user: User;
  activeView: ActiveView;
  onOpenCreatePolicy?: () => void;
  onOpenSubmitClaim?: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  onOpenMobileMenu?: () => void;
  isAIOpen?: boolean;
  onToggleAI?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  activeView,
  onOpenCreatePolicy,
  onOpenSubmitClaim,
  onRefresh,
  isLoading = false,
  onOpenMobileMenu,
  isAIOpen = false,
  onToggleAI,
}) => {
  const isAdmin = user.role === 'Administrator';

  const viewConfig: Record<
    ActiveView,
    { title: string; subtitle: string; icon: React.ReactNode }
  > = {
    dashboard: {
      title: 'Dashboard',
      subtitle: isAdmin ? 'Overview & Portfolio Analytics' : 'Your policies and claims',
      icon: <LayoutDashboard className="w-4 h-4 text-emerald-700" />,
    },
    policies: {
      title: 'Policies',
      subtitle: isAdmin ? 'All Customer Policies' : 'Your insurance policies',
      icon: <FileText className="w-4 h-4 text-emerald-700" />,
    },
    claims: {
      title: 'Claims',
      subtitle: isAdmin ? 'Claims Review & Decisions' : 'Your claims and status history',
      icon: <FileCheck2 className="w-4 h-4 text-emerald-700" />,
    },
  };

  const currentView = viewConfig[activeView];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs backdrop-blur-md bg-white/95">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors shrink-0"
            title="Open Menu"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs min-w-0">
          <span className="text-slate-400 font-medium hidden md:inline">TailVaR</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden md:inline" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 rounded-lg bg-emerald-50 border border-emerald-200/60 shrink-0">
              {currentView.icon}
            </span>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-sm leading-tight block truncate">
                {currentView.title}
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden lg:block truncate">
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
        <span className="font-semibold text-slate-700">IST (Asia/Kolkata)</span>
      </div>

      {/* Right: User Role & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* User Pill (desktop/tablet) */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/70 shadow-2xs">
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
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/60 transition-colors shadow-2xs disabled:opacity-50 shrink-0"
          title="Refresh Data"
          aria-label="Refresh Data"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`}
          />
        </button>

        {/* Primary Action Button */}
        {isAdmin && (activeView === 'policies' || activeView === 'dashboard') && onOpenCreatePolicy && (
          <Button
            onClick={onOpenCreatePolicy}
            size="sm"
            className="bg-[#06241b] hover:bg-[#083528] text-white rounded-xl h-9 px-3 sm:px-4 text-xs font-bold shadow-md shadow-emerald-950/20 gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Create Policy</span>
            <span className="sm:hidden">Policy</span>
          </Button>
        )}

        {!isAdmin && (activeView === 'claims' || activeView === 'dashboard') && onOpenSubmitClaim && (
          <Button
            onClick={onOpenSubmitClaim}
            size="sm"
            className="bg-[#06241b] hover:bg-[#083528] text-white rounded-xl h-9 px-3 sm:px-4 text-xs font-bold shadow-md shadow-emerald-950/20 gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Submit Claim</span>
            <span className="sm:hidden">Claim</span>
          </Button>
        )}

        {/* AI Assistant Toggle Button in Header */}
        {onToggleAI && (
          <button
            type="button"
            onClick={onToggleAI}
            aria-label="Toggle AI Assistant"
            title={isAIOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
            className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer ${
              isAIOpen
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAIOpen ? 'text-emerald-700' : 'text-emerald-600'}`} />
            <span className="hidden xl:inline">AI Assistant</span>
          </button>
        )}
      </div>
    </header>
  );
};
