import React from 'react';
import { User } from '../types';
import { ActiveView } from './Sidebar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, RefreshCw } from 'lucide-react';

interface TopBarProps {
  user: User;
  activeView: ActiveView;
  onOpenCreatePolicy?: () => void;
  onOpenSubmitClaim?: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  activeView,
  onOpenCreatePolicy,
  onOpenSubmitClaim,
  onRefresh,
  isLoading = false,
}) => {
  const isAdmin = user.role === 'Administrator';

  const viewTitles: Record<ActiveView, string> = {
    dashboard: 'Dashboard',
    policies: 'Policies',
    claims: 'Claims',
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <h1 className="font-bold text-slate-900 text-sm">{viewTitles[activeView]}</h1>
        <Badge
          variant={isAdmin ? 'secondary' : 'teal'}
          className="text-[10px] font-medium"
        >
          {user.role}
        </Badge>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Refresh Data"
          aria-label="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* ONE single primary action button per view */}
        {isAdmin && (activeView === 'policies' || activeView === 'dashboard') && onOpenCreatePolicy && (
          <Button
            onClick={onOpenCreatePolicy}
            size="sm"
            className="bg-[#06241b] hover:bg-[#083528] text-white rounded-lg h-8 px-3 text-xs font-semibold shadow-xs gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Policy</span>
          </Button>
        )}

        {!isAdmin && (activeView === 'claims' || activeView === 'dashboard') && onOpenSubmitClaim && (
          <Button
            onClick={onOpenSubmitClaim}
            size="sm"
            className="bg-[#06241b] hover:bg-[#083528] text-white rounded-lg h-8 px-3 text-xs font-semibold shadow-xs gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Claim</span>
          </Button>
        )}
      </div>
    </header>
  );
};
