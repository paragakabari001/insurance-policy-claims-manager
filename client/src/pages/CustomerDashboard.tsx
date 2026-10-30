import React from 'react';
import { Policy, Claim, User } from '../types';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { ActiveView } from '../components/Sidebar';
import { AnalyticsView, ReportsView } from './InsightsViews';
import {
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface CustomerDashboardProps {
  user: User;
  policies: Policy[];
  claims: Claim[];
  activeView: ActiveView;
  setActiveView?: (view: ActiveView) => void;
  onOpenSubmitClaim: (policyId?: string) => void;
  isAIOpen?: boolean;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  policies,
  claims,
  activeView,
  setActiveView,
  onOpenSubmitClaim,
  isAIOpen = false,
}) => {
  const totalPolicies = policies.length;
  const activePolicies = policies.filter((p) => p.coverageStatus === 'Active').length;
  const expiredPolicies = policies.filter((p) => p.coverageStatus === 'Expired').length;
  const totalCoveredSI = policies.reduce((acc, p) => acc + p.sumInsured, 0);
  const remainingSI = policies.reduce((acc, p) => acc + p.remainingClaimableSI, 0);
  const submittedClaims = claims.filter((c) => c.status === 'Submitted').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;
  const rejectedClaims = claims.filter((c) => c.status === 'Rejected').length;

  return (
    <div className="space-y-6 w-full">
      {/* Sub-Navigation Tabs (Shadcnblocks Match) */}
      <div className="flex items-center gap-1 border-b border-slate-200/80 -mb-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'dashboard', label: 'Overview' },
          { id: 'policies', label: 'Policies' },
          { id: 'claims', label: 'Claims' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'reports', label: 'Reports' },
        ].map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView && setActiveView(tab.id as ActiveView)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* View: DASHBOARD (Overview) */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Section Heading */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Overview</h2>
          </div>

          {/* Top 4 KPI Cards with mini wave graphs & trend tags (Responsive 3-Grid Mobile + Compact Chat Mode) */}
          <div className={`grid gap-2 sm:gap-3.5 ${isAIOpen ? 'grid-cols-3 sm:grid-cols-2 2xl:grid-cols-4' : 'grid-cols-3 sm:grid-cols-2 lg:grid-cols-4'}`}>
            {/* Card 1: Total Policies */}
            <div className={`col-span-1 relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between transition-all ${
              isAIOpen ? 'p-2 sm:p-2.5 h-[108px] sm:h-[114px]' : 'p-2.5 sm:p-3.5 h-[120px] sm:h-[138px]'
            }`}>
              <div className="flex items-start justify-between gap-1 z-10 min-w-0">
                <div className="flex items-start gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                  <div className={`rounded-xl bg-[#e6f9f0] text-[#00ba63] flex items-center justify-center shrink-0 ${
                    isAIOpen ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-7 h-7 sm:w-9 sm:h-9'
                  }`}>
                    <FileText className={isAIOpen ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00ba63]' : 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[#00ba63]'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-slate-500 leading-tight truncate ${isAIOpen ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'}`}>
                      Total Policies
                    </p>
                    <p className={`font-black text-slate-900 tracking-tight leading-tight truncate mt-0.5 ${
                      isAIOpen ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl'
                    }`}>
                      {totalPolicies}
                    </p>
                    <p className={`text-slate-400 font-medium leading-tight truncate mt-0.5 ${isAIOpen ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}`}>
                      {activePolicies} active
                    </p>
                  </div>
                </div>

                <div className="hidden xs:flex flex-col items-end justify-between h-full shrink-0">
                  <div className="w-5 h-5 rounded-md bg-orange-50 border border-orange-100/80 flex items-center justify-center text-orange-400">
                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className={isAIOpen ? 'mt-0.5' : 'mt-1.5'}>
                    <span className={`inline-flex items-center gap-0.5 rounded-full bg-[#eafaf1] text-[#00ba63] font-bold ${
                      isAIOpen ? 'px-1.5 py-0.2 text-[9px]' : 'px-2 py-0.5 text-xs'
                    }`}>
                      <TrendingUp className="w-2.5 h-2.5 text-[#00ba63]" /> +12%
                    </span>
                  </div>
                </div>
              </div>

              {/* Glowing Wave SVG */}
              <div className={`absolute -bottom-1 left-0 right-0 pointer-events-none overflow-hidden ${isAIOpen ? 'h-6 sm:h-7' : 'h-8 sm:h-10'}`}>
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
            <div className={`col-span-1 relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between transition-all ${
              isAIOpen ? 'p-2 sm:p-2.5 h-[108px] sm:h-[114px]' : 'p-2.5 sm:p-3.5 h-[120px] sm:h-[138px]'
            }`}>
              <div className="flex items-start justify-between gap-1 z-10 min-w-0">
                <div className="flex items-start gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                  <div className={`rounded-xl bg-[#eef4ff] text-[#2563eb] flex items-center justify-center shrink-0 ${
                    isAIOpen ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-7 h-7 sm:w-9 sm:h-9'
                  }`}>
                    <Layers className={isAIOpen ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2563eb]' : 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[#2563eb]'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-slate-500 leading-tight truncate ${isAIOpen ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'}`}>
                      Total Sum Insured
                    </p>
                    <p
                      title={formatCurrency(totalCoveredSI)}
                      className={`font-black text-slate-900 tracking-tight leading-tight truncate mt-0.5 cursor-help ${
                        isAIOpen ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl'
                      }`}
                    >
                      {formatCompactCurrency(totalCoveredSI)}
                    </p>
                    <p className={`text-slate-400 font-medium leading-tight truncate mt-0.5 ${isAIOpen ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}`}>
                      Across your policies
                    </p>
                  </div>
                </div>

                <div className="hidden xs:flex flex-col items-end justify-between h-full shrink-0">
                  <div className="w-5 h-5 rounded-md bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-500">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className={isAIOpen ? 'mt-0.5' : 'mt-1.5'}>
                    <span className={`inline-flex items-center gap-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] font-bold ${
                      isAIOpen ? 'px-1.5 py-0.2 text-[9px]' : 'px-2 py-0.5 text-xs'
                    }`}>
                      <TrendingUp className="w-2.5 h-2.5 text-[#2563eb]" /> +8%
                    </span>
                  </div>
                </div>
              </div>

              {/* Glowing Wave SVG */}
              <div className={`absolute -bottom-1 left-0 right-0 pointer-events-none overflow-hidden ${isAIOpen ? 'h-6 sm:h-7' : 'h-8 sm:h-10'}`}>
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
            <div className={`col-span-1 relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between transition-all ${
              isAIOpen ? 'p-2 sm:p-2.5 h-[108px] sm:h-[114px]' : 'p-2.5 sm:p-3.5 h-[120px] sm:h-[138px]'
            }`}>
              <div className="flex items-start justify-between gap-1 z-10 min-w-0">
                <div className="flex items-start gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                  <div className={`rounded-xl bg-[#eafaf1] text-[#00ba63] flex items-center justify-center shrink-0 ${
                    isAIOpen ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-7 h-7 sm:w-9 sm:h-9'
                  }`}>
                    <ShieldCheck className={isAIOpen ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00ba63]' : 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[#00ba63]'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-slate-500 leading-tight truncate ${isAIOpen ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'}`}>
                      Remaining Coverage
                    </p>
                    <p
                      title={formatCurrency(remainingSI)}
                      className={`font-black text-[#008f4c] tracking-tight leading-tight truncate mt-0.5 cursor-help ${
                        isAIOpen ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl'
                      }`}
                    >
                      {formatCompactCurrency(remainingSI)}
                    </p>
                    <p className={`text-slate-400 font-medium leading-tight truncate mt-0.5 ${isAIOpen ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}`}>
                      Available to use
                    </p>
                  </div>
                </div>

                <div className="hidden xs:flex flex-col items-end justify-between h-full shrink-0">
                  <div className="w-5 h-5" />
                  <div className={isAIOpen ? 'mt-0.5' : 'mt-1.5'}>
                    <span className={`inline-flex items-center gap-0.5 rounded-full bg-[#eafaf1] text-[#00ba63] font-bold ${
                      isAIOpen ? 'px-1.5 py-0.2 text-[9px]' : 'px-2 py-0.5 text-xs'
                    }`}>
                      <TrendingUp className="w-2.5 h-2.5 text-[#00ba63]" /> +18%
                    </span>
                  </div>
                </div>
              </div>

              {/* Glowing Wave SVG */}
              <div className={`absolute -bottom-1 left-0 right-0 pointer-events-none overflow-hidden ${isAIOpen ? 'h-6 sm:h-7' : 'h-8 sm:h-10'}`}>
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

            {/* Card 4: Claims Filed (Spans across all 3 columns on mobile for a balanced grid) */}
            <div className={`col-span-3 sm:col-span-1 relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between transition-all ${
              isAIOpen ? 'p-2 sm:p-2.5 h-[108px] sm:h-[114px]' : 'p-2.5 sm:p-3.5 h-[120px] sm:h-[138px]'
            }`}>
              <div className="flex items-start justify-between gap-1 z-10 min-w-0">
                <div className="flex items-start gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                  <div className={`rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center shrink-0 ${
                    isAIOpen ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-7 h-7 sm:w-9 sm:h-9'
                  }`}>
                    <Clock className={isAIOpen ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ea580c]' : 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[#ea580c]'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-slate-500 leading-tight truncate ${isAIOpen ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'}`}>
                      Claims Filed
                    </p>
                    <p className={`font-black text-slate-900 tracking-tight leading-tight truncate mt-0.5 ${
                      isAIOpen ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl'
                    }`}>
                      {claims.length}
                    </p>
                    <p className={`text-slate-400 font-medium leading-tight truncate mt-0.5 ${isAIOpen ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}`}>
                      {submittedClaims} pending &bull; {approvedClaims} approved
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full shrink-0">
                  <div className="hidden xs:flex w-5 h-5" />
                  <div className={isAIOpen ? 'mt-0.5' : 'mt-1.5'}>
                    <span className={`inline-flex items-center gap-0.5 rounded-full bg-[#fff7ed] text-[#ea580c] font-bold ${
                      isAIOpen ? 'px-1.5 py-0.2 text-[9px]' : 'px-2 py-0.5 text-xs'
                    }`}>
                      <TrendingDown className="w-2.5 h-2.5 text-[#ea580c]" /> -100%
                    </span>
                  </div>
                </div>
              </div>

              {/* Glowing Wave SVG */}
              <div className={`absolute -bottom-1 left-0 right-0 pointer-events-none overflow-hidden ${isAIOpen ? 'h-6 sm:h-7' : 'h-8 sm:h-10'}`}>
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

          {/* Section: Status Distribution Summary (Matching Shadcnblocks Admin) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-700 tracking-tight">Portfolio Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {/* Active Policies */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-[#00ba63]" />
                    <span className="text-[11px] font-semibold text-slate-600">Active</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{activePolicies}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Covered
                </span>
              </div>

              {/* Expired Policies */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-600">Expired</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{expiredPolicies}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Matured
                </span>
              </div>

              {/* Submitted Claims */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-amber-500" />
                    <span className="text-[11px] font-semibold text-slate-600">Submitted</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{submittedClaims}</p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              </div>

              {/* Approved Claims */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-[#00ba63]" />
                    <span className="text-[11px] font-semibold text-slate-600">Approved</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{approvedClaims}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Settled
                </span>
              </div>

              {/* Rejected Claims */}
              <div className="col-span-2 sm:col-span-1 bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-rose-500" />
                    <span className="text-[11px] font-semibold text-slate-600">Rejected</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{rejectedClaims}</p>
                </div>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  Declined
                </span>
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
              {totalPolicies} policies &middot; {activePolicies} active
            </span>
          </div>
          <PolicyTable
            policies={policies}
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
              Total {claims.length} claims ({submittedClaims} pending review, {approvedClaims} approved)
            </span>
          </div>
          <ClaimTable claims={claims} isAdmin={false} />
        </div>
      )}

      {/* View: ANALYTICS */}
      {activeView === 'analytics' && (
        <AnalyticsView user={user} policies={policies} claims={claims} />
      )}

      {/* View: REPORTS */}
      {activeView === 'reports' && (
        <ReportsView user={user} policies={policies} claims={claims} />
      )}

      {/* View: CUSTOMERS (Profile view for Customer) */}
      {activeView === 'customers' && (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Customer Profile</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Account details & policy entitlements</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs max-w-lg space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-base flex items-center justify-center">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{user.name}</h3>
                <p className="text-xs text-slate-400 font-medium">@{user.username} &bull; Verified Customer</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Policies</dt>
                <dd className="mt-1 font-extrabold text-slate-900 text-sm">{totalPolicies}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Policies</dt>
                <dd className="mt-1 font-extrabold text-slate-900 text-sm">{activePolicies}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sum Insured</dt>
                <dd className="mt-1 font-extrabold text-slate-900 text-sm">{formatCurrency(totalCoveredSI)}</dd>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Remaining Balance</dt>
                <dd className="mt-1 font-extrabold text-[#008f4c] text-sm">{formatCurrency(remainingSI)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};
