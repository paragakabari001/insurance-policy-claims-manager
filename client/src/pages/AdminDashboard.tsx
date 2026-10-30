import React, { useState } from 'react';
import { Policy, Claim, CustomerUser, User } from '../types';
import { formatCurrency, formatCompactCurrency, formatDate } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { ActiveView } from '../components/Sidebar';
import { CustomersView, AnalyticsView, ReportsView } from './InsightsViews';
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
  isAIOpen?: boolean;
  onToggleAI?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  policies,
  claims,
  customers,
  activeView,
  setActiveView,
  onDecideClaim,
  isLoadingDecision,
  onOpenCreatePolicy,
  isAIOpen = false,
  onToggleAI,
}) => {
  const [dateRange, setDateRange] = useState('Jan 1, 2026 – Dec 31, 2026');
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
    'H2 2026 (Jul – Dec)',
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

            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              {/* Date Range Filter Button (Interactive Dropdown) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63]"
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

              {/* Desktop-only Action Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                {onOpenCreatePolicy && (
                  <button
                    onClick={onOpenCreatePolicy}
                    className="h-9 px-4 rounded-xl bg-[#031d16] hover:bg-[#072d22] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#031d16]/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#00c569]" />
                    <span>Create Policy</span>
                  </button>
                )}

                {onToggleAI && (
                  <button
                    onClick={onToggleAI}
                    className={`h-9 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer ${
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

          {/* Mobile Action Buttons: 2 Equal Columns Matching Mobile Design Reference */}
          <div className="grid grid-cols-2 gap-2.5 sm:hidden">
            {onOpenCreatePolicy && (
              <button
                onClick={onOpenCreatePolicy}
                className="h-11 px-3 rounded-2xl bg-[#031d16] active:bg-[#072d22] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#031d16]/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#00c569]" />
                <span>Create Policy</span>
              </button>
            )}

            {onToggleAI && (
              <button
                onClick={onToggleAI}
                className="h-11 px-3.5 rounded-2xl bg-[#eaf8f1] border border-emerald-200/80 active:bg-[#d8f3e5] text-[#022c21] text-xs font-bold flex items-center justify-between shadow-2xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#00ba63]" />
                  <span>AI Assistant</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#00ba63]" />
              </button>
            )}
          </div>

          {/* Top 4 KPI Cards: 2x2 Grid on Mobile, 4-Cols on Desktop Matching Mobile Reference */}
          <div className={`grid grid-cols-2 gap-2.5 sm:gap-3.5 ${isAIOpen ? 'lg:grid-cols-2 2xl:grid-cols-4' : 'lg:grid-cols-4'}`}>
            {/* Card 1: Total Policies */}
            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between p-3 sm:p-3.5 h-[126px] sm:h-[138px] transition-all">
              <div className="flex items-center justify-between gap-1 z-10">
                <div className="w-8 h-8 rounded-xl bg-[#e6f9f0] text-[#00ba63] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#00ba63]" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#eafaf1] text-[#00ba63] font-bold px-2 py-0.5 text-[10px] sm:text-xs">
                  <TrendingUp className="w-2.5 h-2.5 text-[#00ba63]" /> +12%
                </span>
              </div>

              <div className="z-10 mt-1">
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

              {/* Glowing Wave SVG */}
              <div className="absolute -bottom-1 left-0 right-0 pointer-events-none overflow-hidden h-8 sm:h-10">
                <svg viewBox="0 0 300 50" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="wave-green-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ba63" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00ba63" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 38 C 70 42, 130 28, 190 28 C 240 28, 270 14, 300 8 L 300 50 L 0 50 Z" fill="url(#wave-green-1)" />
                  <path d="M0 38 C 70 42, 130 28, 190 28 C 240 28, 270 14, 300 8" fill="none" stroke="#00ba63" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Total Sum Insured */}
            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between p-3 sm:p-3.5 h-[126px] sm:h-[138px] transition-all">
              <div className="flex items-center justify-between gap-1 z-10">
                <div className="w-8 h-8 rounded-xl bg-[#eef4ff] text-[#2563eb] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-[#2563eb]" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] font-bold px-2 py-0.5 text-[10px] sm:text-xs">
                  <TrendingUp className="w-2.5 h-2.5 text-[#2563eb]" /> +8%
                </span>
              </div>

              <div className="z-10 mt-1">
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

              {/* Glowing Wave SVG */}
              <div className="absolute -bottom-1 left-0 right-0 pointer-events-none overflow-hidden h-8 sm:h-10">
                <svg viewBox="0 0 300 50" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="wave-blue-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 42 C 60 44, 110 32, 170 34 C 220 36, 250 16, 300 10 L 300 50 L 0 50 Z" fill="url(#wave-blue-1)" />
                  <path d="M0 42 C 60 44, 110 32, 170 34 C 220 36, 250 16, 300 10" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Remaining Coverage */}
            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between p-3 sm:p-3.5 h-[126px] sm:h-[138px] transition-all">
              <div className="flex items-center justify-between gap-1 z-10">
                <div className="w-8 h-8 rounded-xl bg-[#eafaf1] text-[#00ba63] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#00ba63]" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#eafaf1] text-[#00ba63] font-bold px-2 py-0.5 text-[10px] sm:text-xs">
                  <TrendingUp className="w-2.5 h-2.5 text-[#00ba63]" /> +15%
                </span>
              </div>

              <div className="z-10 mt-1">
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

              {/* Glowing Wave SVG */}
              <div className="absolute -bottom-1 left-0 right-0 pointer-events-none overflow-hidden h-8 sm:h-10">
                <svg viewBox="0 0 300 50" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="wave-green-rem-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ba63" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00ba63" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 38 C 70 42, 130 28, 190 28 C 240 28, 270 12, 300 8 L 300 50 L 0 50 Z" fill="url(#wave-green-rem-1)" />
                  <path d="M0 38 C 70 42, 130 28, 190 28 C 240 28, 270 12, 300 8" fill="none" stroke="#00ba63" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 4: Pending Claims */}
            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between p-3 sm:p-3.5 h-[126px] sm:h-[138px] transition-all">
              <div className="flex items-center justify-between gap-1 z-10">
                <div className="w-8 h-8 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#ea580c]" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#fff7ed] text-[#ea580c] font-bold px-2 py-0.5 text-[10px] sm:text-xs">
                  <TrendingDown className="w-2.5 h-2.5 text-[#ea580c]" /> -100%
                </span>
              </div>

              <div className="z-10 mt-1">
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

              {/* Glowing Wave SVG */}
              <div className="absolute -bottom-1 left-0 right-0 pointer-events-none overflow-hidden h-8 sm:h-10">
                <svg viewBox="0 0 300 50" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="wave-orange-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 44 C 60 46, 120 40, 180 42 C 230 44, 260 30, 300 24 L 300 50 L 0 50 Z" fill="url(#wave-orange-1)" />
                  <path d="M0 44 C 60 46, 120 40, 180 42 C 230 44, 260 30, 300 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
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
              {policies.length} policies &middot; {activePolicies} active
            </span>
          </div>
          <PolicyTable policies={policies} isAdmin={true} />
        </div>
      )}

      {/* View: CLAIMS */}
      {activeView === 'claims' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">All Submitted Claims</h2>
            <span className="text-xs text-slate-500 font-medium">
              Total {claims.length} filed ({pendingClaims} pending review)
            </span>
          </div>
          <ClaimTable
            claims={claims}
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
          policies={policies}
          claims={claims}
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
          policies={policies}
          claims={claims}
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
          policies={policies}
          claims={claims}
        />
      )}
    </div>
  );
};
