import React, { useState } from 'react';
import { Policy, Claim, User } from '../types';
import { filterByPeriod } from '../utils/period';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { ActiveView } from '../components/Sidebar';
import { AnalyticsView, ReportsView } from './InsightsViews';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  FileText,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Calendar,
  ChevronDown,
  Check,
} from 'lucide-react';

interface CustomerDashboardProps {
  user: User;
  policies: Policy[];
  claims: Claim[];
  activeView: ActiveView;
  onOpenSubmitClaim: (policyId?: string) => void;
  isAIOpen?: boolean;
  onToggleAI?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  policies: allPolicies,
  claims: allClaims,
  activeView,
  onOpenSubmitClaim,
  isAIOpen = false,
  onToggleAI,
}) => {
  const [dateRange, setDateRange] = useState('Jan 1, 2026 – Dec 31, 2026');
  // The period selector scopes the dashboard overview; other pages always use the full dataset
  const { policies, claims } = React.useMemo(
    () => filterByPeriod(allPolicies, allClaims, dateRange),
    [allPolicies, allClaims, dateRange]
  );
  const totalPolicies = policies.length;
  const activePolicies = policies.filter((p) => p.coverageStatus === 'Active').length;
  const expiredPolicies = policies.filter((p) => p.coverageStatus === 'Expired').length;
  const totalCoveredSI = policies.reduce((acc, p) => acc + p.sumInsured, 0);
  const remainingSI = policies.reduce((acc, p) => acc + p.remainingClaimableSI, 0);
  const submittedClaims = claims.filter((c) => c.status === 'Submitted').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;

  const datePresets = [
    'Jan 1, 2026 – Dec 31, 2026',
    'Q1 2026 (Jan – Mar)',
    'Q2 2026 (Apr – Jun)',
    'Q3 2026 (Jul – Sep)',
    'Q4 2026 (Oct – Dec)',
    'H2 2026 (Jul – Dec)',
    'All Time',
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 w-full">
      {/* View: DASHBOARD (Overview) */}
      {activeView === 'dashboard' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Page Title & Action Bar (Mobile Responsive Greeting & Controls) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>{getGreeting()}, {user?.name || 'Customer'}</span>
                <span className="inline-block origin-bottom-right hover:rotate-12 transition-transform">👋</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Here's your overview for policies, claims and coverage.
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-2.5 flex-nowrap">
              {/* Date Range Filter Button (Interactive Dropdown) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-700 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63]"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dateRange}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-1.5">
                  <DropdownMenuLabel>Coverage Period Preset</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {datePresets.map((preset) => (
                    <DropdownMenuItem
                      key={preset}
                      onSelect={() => setDateRange(preset)}
                      className="flex items-center justify-between"
                    >
                      <span>{preset}</span>
                      {dateRange === preset && <Check className="w-3.5 h-3.5 text-[#00ba63]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Action Buttons (single line on mobile, right aligned) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onOpenSubmitClaim()}
                  className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl bg-[#031d16] hover:bg-[#072d22] text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#031d16]/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00c569]" />
                  <span>Submit Claim</span>
                </button>

                {onToggleAI && (
                  <button
                    onClick={onToggleAI}
                    className={`hidden sm:flex h-9 px-3.5 rounded-xl border text-xs font-bold items-center gap-2 shadow-2xs transition-all cursor-pointer ${
                      isAIOpen
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00c569]" />
                    <span>AI Assistant</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Top 4 KPI Cards: 2x2 Grid on Mobile, 4-Cols on Desktop (Clean Flat Executive Style without bottom wave) */}
          <div className={`grid grid-cols-2 gap-2.5 sm:gap-3.5 ${isAIOpen ? 'lg:grid-cols-2 2xl:grid-cols-4' : 'lg:grid-cols-4'}`}>
            {/* Card 1: Total Policies */}
            <div className="kpi-card relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-emerald-300 p-3.5 sm:p-4 flex flex-col justify-between transition-all">
              <div className="flex items-center justify-between gap-1">
                <div className="w-8 h-8 rounded-xl bg-[#e6f9f0] text-[#00ba63] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#00ba63]" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#eafaf1] text-[#00ba63] font-bold px-2 py-0.5 text-[10px] sm:text-xs">
                  <TrendingUp className="w-2.5 h-2.5 text-[#00ba63]" /> +12%
                </span>
              </div>

              <div className="mt-2.5">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight">
                  Total Policies
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                  {totalPolicies}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">
                  {activePolicies} active &bull; {expiredPolicies} expired
                </p>
              </div>
            </div>

            {/* Card 2: Total Sum Insured */}
            <div className="kpi-card relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-blue-300 p-3.5 sm:p-4 flex flex-col justify-between transition-all">
              <div className="flex items-center justify-between gap-1">
                <div className="w-8 h-8 rounded-xl bg-[#eef4ff] text-[#2563eb] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-[#2563eb]" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] font-bold px-2 py-0.5 text-[10px] sm:text-xs">
                  <TrendingUp className="w-2.5 h-2.5 text-[#2563eb]" /> +8%
                </span>
              </div>

              <div className="mt-2.5">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight">
                  Total Sum Insured
                </p>
                <p
                  title={formatCurrency(totalCoveredSI)}
                  className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5 cursor-help truncate"
                >
                  {formatCompactCurrency(totalCoveredSI)}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">
                  Across your policies
                </p>
              </div>
            </div>

            {/* Card 3: Remaining Coverage */}
            <div className="kpi-card relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-emerald-300 p-3.5 sm:p-4 flex flex-col justify-between transition-all">
              <div className="flex items-center justify-between gap-1">
                <div className="w-8 h-8 rounded-xl bg-[#eafaf1] text-[#00ba63] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#00ba63]" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#eafaf1] text-[#00ba63] font-bold px-2 py-0.5 text-[10px] sm:text-xs">
                  <TrendingUp className="w-2.5 h-2.5 text-[#00ba63]" /> +15%
                </span>
              </div>

              <div className="mt-2.5">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight">
                  Remaining Coverage
                </p>
                <p
                  title={formatCurrency(remainingSI)}
                  className="text-xl sm:text-2xl font-black text-[#008f4c] tracking-tight leading-tight mt-0.5 cursor-help truncate"
                >
                  {formatCompactCurrency(remainingSI)}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">
                  Available to use
                </p>
              </div>
            </div>

            {/* Card 4: Claims Filed */}
            <div className="kpi-card relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-amber-300 p-3.5 sm:p-4 flex flex-col justify-between transition-all">
              <div className="flex items-center justify-between gap-1">
                <div className="w-8 h-8 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#ea580c]" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#fff7ed] text-[#ea580c] font-bold px-2 py-0.5 text-[10px] sm:text-xs">
                  <TrendingDown className="w-2.5 h-2.5 text-[#ea580c]" /> -100%
                </span>
              </div>

              <div className="mt-2.5">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight">
                  Claims Filed
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                  {claims.length}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">
                  {submittedClaims} pending &bull; {approvedClaims} approved
                </p>
              </div>
            </div>
          </div>

          {/* My Policies Section */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              My Policies
            </h2>
            <PolicyTable
              policies={policies}
              isAdmin={false}
              onSelectForClaim={(p) => onOpenSubmitClaim(p.id)}
            />
          </div>

          {/* Claims History Section */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              My Claims History
            </h2>
            <ClaimTable claims={claims} isAdmin={false} />
          </div>
        </div>
      )}

      {/* View: POLICIES */}
      {activeView === 'policies' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">My Insurance Policies</h2>
            <span className="text-xs text-slate-500 font-medium">
              {allPolicies.length} policies &middot; {allPolicies.filter((p) => p.coverageStatus === 'Active').length} active
            </span>
          </div>
          <PolicyTable
            policies={allPolicies}
            isAdmin={false}
            onSelectForClaim={(p) => onOpenSubmitClaim(p.id)}
          />
        </div>
      )}

      {/* View: CLAIMS */}
      {activeView === 'claims' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">My Claims & Status History</h2>
            <span className="text-xs text-slate-500 font-medium">
              Total {allClaims.length} claims ({allClaims.filter((c) => c.status === 'Submitted').length} pending review, {allClaims.filter((c) => c.status === 'Approved').length} approved)
            </span>
          </div>
          <ClaimTable claims={allClaims} isAdmin={false} />
        </div>
      )}

      {/* View: ANALYTICS */}
      {activeView === 'analytics' && (
        <AnalyticsView user={user} policies={allPolicies} claims={allClaims} />
      )}

      {/* View: REPORTS */}
      {activeView === 'reports' && (
        <ReportsView user={user} policies={allPolicies} claims={allClaims} />
      )}
    </div>
  );
};
