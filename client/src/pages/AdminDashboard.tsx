import React, { useState } from 'react';
import { Policy, Claim, CustomerUser, User } from '../types';
import { filterByPeriod } from '../utils/period';
import { formatCurrency, formatCompactCurrency, formatDate } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { ActiveView } from '../components/Sidebar';
import { AnalyticsView, ReportsView, CustomersView } from './InsightsViews';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  FileText,
  Layers,
  ShieldCheck,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  BarChart3,
  ChevronDown,
  Check,
  ArrowRight,
} from 'lucide-react';

interface AdminDashboardProps {
  user?: User;
  policies: Policy[];
  claims: Claim[];
  customers: CustomerUser[];
  activeView: ActiveView;
  setActiveView?: (view: ActiveView) => void;
  onDecideClaim: (claimId: string, decision: 'Approved' | 'Rejected') => Promise<void>;
  isLoadingDecision: string | null;
  onOpenCreatePolicy?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  policies: allPolicies,
  claims: allClaims,
  customers,
  activeView,
  setActiveView,
  onDecideClaim,
  isLoadingDecision,
  onOpenCreatePolicy,
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
  const totalSI = policies.reduce((acc, p) => acc + p.sumInsured, 0);
  const remainingSI = policies.reduce((acc, p) => acc + p.remainingClaimableSI, 0);
  const reservedAndUsedSI = totalSI - remainingSI;
  const pendingClaims = claims.filter((c) => c.status === 'Submitted').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;

  const remainingPercent = totalSI > 0 ? Math.round((remainingSI / totalSI) * 100) : 0;
  const usedPercent = 100 - remainingPercent;

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

  const adminUser = user || {
    id: 'admin',
    username: 'admin',
    name: 'Administrator',
    role: 'Administrator',
  };

  return (
    <div className="space-y-6 w-full">
      {/* View: DASHBOARD (Overview - Header only shown when on dashboard view to prevent double headers) */}
      {activeView === 'dashboard' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Page Title & Action Bar (Mobile Responsive Greeting & Controls) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>{getGreeting()}, Administrator</span>
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
                {onOpenCreatePolicy && (
                  <button
                    onClick={onOpenCreatePolicy}
                    className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl bg-[#031d16] hover:bg-[#072d22] text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#031d16]/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00c569]" />
                    <span>Create Policy</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Top 4 KPI Cards: 2x2 Grid on Mobile, 4-Cols on Desktop (Clean Flat Executive Style without bottom wave) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
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
                  title={formatCurrency(totalSI)}
                  className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5 cursor-help truncate"
                >
                  {formatCompactCurrency(totalSI)}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">
                  Across all policies
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

            {/* Card 4: Pending Claims */}
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
                  Pending Claims
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                  {pendingClaims}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">
                  {approvedClaims} approved
                </p>
              </div>
            </div>
          </div>

          {/* Section: Policies Overview */}
          <div className="space-y-3">
            <PolicyTable policies={policies} isAdmin={true} />
          </div>

          {/* Section: Claims Review */}
          <div className="space-y-3">
            <ClaimTable
              claims={claims}
              isAdmin={true}
              onDecideClaim={onDecideClaim}
              isLoadingDecision={isLoadingDecision}
            />
          </div>

          {/* Bottom Visual Graphs: Coverage Distribution & Policy Status (Figma Match) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            {/* Chart 1: Coverage Distribution (Donut Chart) */}
            <Card className="p-5 rounded-2xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Coverage Distribution</h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Donut Graphic */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#00c569"
                      strokeWidth="3.5"
                      strokeDasharray={`${remainingPercent * 0.88} 100`}
                      strokeLinecap="round"
                      className="anim-donut"
                      style={{ ['--dash' as any]: `${remainingPercent * 0.88} 100`, ['--circ' as any]: 100 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900">
                      ₹{Math.round(totalSI / 100000)}L
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Total Sum Insured</span>
                  </div>
                </div>

                {/* Legend Values */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-[#00c569]" />
                      <span className="text-slate-600 font-medium">Remaining Coverage</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{formatCurrency(remainingSI)}</span>
                      <span className="text-slate-400 font-semibold">{remainingPercent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-emerald-200" />
                      <span className="text-slate-600 font-medium">Reserved + Used</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{formatCurrency(reservedAndUsedSI)}</span>
                      <span className="text-slate-400 font-semibold">{usedPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Chart 2: Policy Status (Bar Graph) */}
            <Card className="p-5 rounded-2xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Policy Status</h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#00c569]" /> Active
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-300" /> Expired
                  </span>
                </div>
              </div>

              {/* Simple Clean Bar Chart Representation */}
              <div className="h-36 flex items-end justify-around pt-6 px-4 border-b border-slate-100">
                {/* Active Bar */}
                <div className="flex flex-col items-center gap-2 w-20">
                  <span className="text-xs font-bold text-slate-700">{activePolicies}</span>
                  <div
                    className="w-full bg-[#00c569] rounded-t-lg transition-all"
                    style={{ height: `${Math.max(20, (activePolicies / Math.max(1, totalPolicies)) * 100)}px` }}
                  />
                  <span className="text-[11px] font-semibold text-slate-600 mt-1">Active</span>
                </div>

                {/* Expired Bar */}
                <div className="flex flex-col items-center gap-2 w-20">
                  <span className="text-xs font-bold text-slate-700">{expiredPolicies}</span>
                  <div
                    className="w-full bg-slate-300 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(20, (expiredPolicies / Math.max(1, totalPolicies)) * 100)}px` }}
                  />
                  <span className="text-[11px] font-semibold text-slate-600 mt-1">Expired</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* View: POLICIES */}
      {activeView === 'policies' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">All Customer Policies</h2>
            <span className="text-xs text-slate-500 font-medium">
              {allPolicies.length} policies &middot; {allPolicies.filter((p) => p.coverageStatus === 'Active').length} active
            </span>
          </div>
          <PolicyTable policies={allPolicies} isAdmin={true} />
        </div>
      )}

      {/* View: CLAIMS */}
      {activeView === 'claims' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">All Submitted Claims</h2>
            <span className="text-xs text-slate-500 font-medium">
              Total {allClaims.length} claims ({allClaims.filter((c) => c.status === 'Submitted').length} pending review, {allClaims.filter((c) => c.status === 'Approved').length} approved)
            </span>
          </div>
          <ClaimTable
            claims={allClaims}
            isAdmin={true}
            onDecideClaim={onDecideClaim}
            isLoadingDecision={isLoadingDecision}
          />
        </div>
      )}

      {/* View: CUSTOMERS */}
      {activeView === 'customers' && (
        <CustomersView
          user={adminUser}
          policies={allPolicies}
          claims={allClaims}
          customers={customers}
          onOpenPolicies={() => {
            if (setActiveView) setActiveView('policies');
          }}
        />
      )}

      {/* View: ANALYTICS (Matches exact UI design with charts, KPIs & customer summary) */}
      {activeView === 'analytics' && (
        <AnalyticsView
          user={adminUser}
          policies={allPolicies}
          claims={allClaims}
          customers={customers}
          onOpenPolicies={(q) => {
            if (setActiveView) setActiveView('policies');
          }}
          onOpenClaims={(q) => {
            if (setActiveView) setActiveView('claims');
          }}
        />
      )}

      {/* View: REPORTS */}
      {activeView === 'reports' && (
        <ReportsView
          user={adminUser}
          policies={allPolicies}
          claims={allClaims}
        />
      )}
    </div>
  );
};
