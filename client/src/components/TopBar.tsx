import React from 'react';
import { User } from '../types';
import { ActiveView } from './Sidebar';
import { Button } from './ui/button';
import {
  Plus,
  RefreshCw,
  Search,
  Bell,
  Sparkles,
  Menu,
  ChevronDown,
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

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs shrink-0">
      {/* Left: Mobile Menu & Search Bar (Figma Match) */}
      <div className="flex items-center gap-3 flex-1 max-w-md min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shrink-0 cursor-pointer"
            title="Open Menu"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search policies, claims, customers..."
            className="w-full pl-9 pr-12 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none cursor-default"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* Right Controls: IST Badge, Notification Bell, User Avatar Pill */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* IST Location Pill (Figma Match) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs text-slate-700 shadow-2xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>IST (Asia/Kolkata)</span>
        </div>

        {/* Notification Bell with Badge (Figma Match) */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>

        {/* User Pill (Figma Match) */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-default">
          <div className="w-8 h-8 rounded-full bg-[#011f17] text-[#00ba63] font-bold text-xs flex items-center justify-center shrink-0">
            {user.role === 'Administrator' ? 'AD' : user.username === 'customer1' ? 'C1' : 'C2'}
          </div>
          <div className="hidden sm:block text-left leading-tight pr-1">
            <p className="text-xs font-bold text-slate-900">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{user.role}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/80 transition-colors shadow-2xs disabled:opacity-50 shrink-0 cursor-pointer"
          title="Refresh Data"
          aria-label="Refresh Data"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`}
          />
        </button>
      </div>
    </header>
  );
};
