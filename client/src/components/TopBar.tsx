import React from 'react';
import { User } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Bell, RefreshCw, ChevronRight } from 'lucide-react';

interface TopBarProps {
  user: User;
  activeTab: string;
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  activeTab,
  onOpenCreateModal,
  onRefresh,
  isLoading = false,
}) => {
  const isAdmin = user.role === 'Administrator';

  const tabLabels: Record<string, string> = {
    overview: 'Overview Dashboard',
    policies: 'Insurance Policies',
    claims: 'Claims Management',
    accounting: 'Accounting & Rules Ledger',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-slate-400">TailVaR</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-bold text-slate-900 capitalize">{tabLabels[activeTab] || activeTab}</span>
        {isAdmin ? (
          <Badge variant="secondary" className="ml-2 font-mono text-[10px]">
            Admin Mode
          </Badge>
        ) : (
          <Badge variant="teal" className="ml-2 font-mono text-[10px]">
            Customer Portal
          </Badge>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
        </button>

        <div className="h-4 w-px bg-slate-200" />

        <Button
          onClick={onOpenCreateModal}
          variant="default"
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdmin ? 'Create Policy' : 'File New Claim'}</span>
        </Button>
      </div>
    </header>
  );
};
