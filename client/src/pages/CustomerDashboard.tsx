import React from 'react';
import { Policy, Claim, User } from '../types';
import { formatCurrency } from '../utils/formatters';
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
  onOpenSubmitClaim: (policyId?: string) => void;
  isAIOpen?: boolean;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  policies,
  claims,
  activeView,
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

  return (
    <div className="space-y-6 w-full">
      {/* View: DASHBOARD (Overview) */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Compact Metric Cards with Wave Graphs (Figma Match) */}
          <div className={`grid gap-3.5 ${isAIOpen ? 'grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'}`}>
            {/* Card 1: Total Policies */}
            <div className="relative bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between h-[150px]">
              <div className="flex items-start justify-between gap-2 z-10 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e6f9f0] text-[#00ba63] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#00ba63]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-500 leading-tight">Total Policies</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight mt-1 leading-tight">{totalPolicies}</p>
                    <p className="text-xs text-slate-400 font-medium mt-1 leading-tight">{activePolicies} Active</p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full shrink-0">
                  <div className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-100/80 flex items-center justify-center text-orange-400">
                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#eafaf1] text-[#00ba63] text-xs font-bold">
                      <TrendingUp className="w-3 h-3 text-[#00ba63]" /> +12%
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-1 left-0 right-0 h-11 pointer-events-none overflow-hidden">
                <svg viewBox="0 0 300 50" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cust-wave-green-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ba63" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00ba63" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 38 C 70 42, 130 28, 190 28 C 240 28, 270 14, 300 8 L 300 50 L 0 50 Z" fill="url(#cust-wave-green-1)" />
                  <path d="M0 38 C 70 42, 130 28, 190 28 C 240 28, 270 14, 300 8" fill="none" stroke="#00ba63" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Total Sum Insured */}
            <div className="relative bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between h-[150px]">
              <div className="flex items-start justify-between gap-2 z-10 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#eef4ff] text-[#2563eb] flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5 text-[#2563eb]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-500 leading-tight">Total Sum Insured</p>
                    <p className="text-base sm:text-lg xl:text-xl 2xl:text-2xl font-black text-slate-900 tracking-tight mt-1 leading-tight truncate">
                      {formatCurrency(totalCoveredSI)}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-1 leading-tight truncate">Across your policies</p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full shrink-0">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-500">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] text-xs font-bold">
                      <TrendingUp className="w-3 h-3 text-[#2563eb]" /> +8%
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-1 left-0 right-0 h-11 pointer-events-none overflow-hidden">
                <svg viewBox="0 0 300 50" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cust-wave-blue-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 42 C 60 44, 110 32, 170 34 C 220 36, 250 16, 300 10 L 300 50 L 0 50 Z" fill="url(#cust-wave-blue-1)" />
                  <path d="M0 42 C 60 44, 110 32, 170 34 C 220 36, 250 16, 300 10" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Remaining Coverage */}
            <div className="relative bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between h-[150px]">
              <div className="flex items-start justify-between gap-2 z-10 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#eafaf1] text-[#00ba63] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#00ba63]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-500 leading-tight">Remaining Coverage</p>
                    <p className="text-base sm:text-lg xl:text-xl 2xl:text-2xl font-black text-[#008f4c] tracking-tight mt-1 leading-tight truncate">
                      {formatCurrency(remainingSI)}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-1 leading-tight truncate">Available to use</p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full shrink-0">
                  <div className="h-6" />
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#eafaf1] text-[#00ba63] text-xs font-bold">
                      <TrendingUp className="w-3 h-3 text-[#00ba63]" /> +18%
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-1 left-0 right-0 h-11 pointer-events-none overflow-hidden">
                <svg viewBox="0 0 300 50" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cust-wave-green-rem-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ba63" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00ba63" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 38 C 70 42, 130 28, 190 28 C 240 28, 270 12, 300 8 L 300 50 L 0 50 Z" fill="url(#cust-wave-green-rem-1)" />
                  <path d="M0 38 C 70 42, 130 28, 190 28 C 240 28, 270 12, 300 8" fill="none" stroke="#00ba63" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 4: Claims Filed */}
            <div className="relative bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between h-[150px]">
              <div className="flex items-start justify-between gap-2 z-10 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#ea580c]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-500 leading-tight">Claims Filed</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight mt-1 leading-tight">{claims.length}</p>
                    <p className="text-xs text-slate-400 font-medium mt-1 leading-tight">
                      {submittedClaims} pending &bull; {approvedClaims} approved
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full shrink-0">
                  <div className="h-6" />
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#fff7ed] text-[#ea580c] text-xs font-bold">
                      <TrendingDown className="w-3 h-3 text-[#ea580c]" /> -100%
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-1 left-0 right-0 h-11 pointer-events-none overflow-hidden">
                <svg viewBox="0 0 300 50" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cust-wave-orange-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 44 C 60 46, 120 38, 180 36 C 230 34, 260 20, 300 12 L 300 50 L 0 50 Z" fill="url(#cust-wave-orange-1)" />
                  <path d="M0 44 C 60 46, 120 38, 180 36 C 230 34, 260 20, 300 12" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
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
