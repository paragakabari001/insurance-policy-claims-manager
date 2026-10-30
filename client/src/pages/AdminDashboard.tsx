import React from 'react';
import { Policy, Claim, CustomerUser } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { ActiveView } from '../components/Sidebar';
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
  PieChart as PieChartIcon,
  BarChart3,
  Bot,
} from 'lucide-react';

interface AdminDashboardProps {
  policies: Policy[];
  claims: Claim[];
  customers: CustomerUser[];
  activeView: ActiveView;
  onDecideClaim: (claimId: string, decision: 'Approved' | 'Rejected') => Promise<void>;
  isLoadingDecision: string | null;
  onOpenCreatePolicy?: () => void;
  isAIOpen?: boolean;
  onToggleAI?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  policies,
  claims,
  customers,
  activeView,
  onDecideClaim,
  isLoadingDecision,
  onOpenCreatePolicy,
  isAIOpen = false,
  onToggleAI,
}) => {
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

  return (
    <div className="space-y-6 w-full">
      {/* Page Title & Action Bar (Figma Match) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Overview & Portfolio Analytics
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Range Filter Button */}
          <div className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Jan 1, 2026 – Dec 31, 2026</span>
          </div>

          {/* Primary Action Button: Create Policy */}
          {onOpenCreatePolicy && (
            <button
              onClick={onOpenCreatePolicy}
              className="h-9 px-4 rounded-xl bg-[#031d16] hover:bg-[#072d22] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#031d16]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#00c569]" />
              <span>Create Policy</span>
            </button>
          )}

          {/* AI Assistant Toggle Button (Figma Match) */}
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

      {/* View: DASHBOARD (Overview) */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards with mini wave graphs & trend tags (Figma Match) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Total Policies */}
            <Card className="p-4 rounded-2xl bg-white border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2.5">
                  Total Policies
                </p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-slate-900">{totalPolicies}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-400 font-medium">{activePolicies} Active</span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    <TrendingUp className="w-3 h-3" /> +12%
                  </span>
                </div>
              </div>
              {/* Wave SVG */}
              <div className="mt-3 pt-2 border-t border-slate-100">
                <svg className="w-full h-6 text-emerald-500" viewBox="0 0 100 20" fill="none">
                  <path d="M0 15 Q25 5 50 12 T100 8" stroke="currentColor" strokeWidth="2.5" fill="none" />
                </svg>
              </div>
            </Card>

            {/* Card 2: Total Sum Insured */}
            <Card className="p-4 rounded-2xl bg-white border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2.5">
                  Total Sum Insured
                </p>
                <div className="mt-1">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">
                    {formatCurrency(totalSI)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-400 font-medium">Across all policies</span>
                  <span className="inline-flex items-center gap-0.5 text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md">
                    <TrendingUp className="w-3 h-3" /> +8%
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <svg className="w-full h-6 text-blue-500" viewBox="0 0 100 20" fill="none">
                  <path d="M0 16 Q30 18 55 10 T100 6" stroke="currentColor" strokeWidth="2.5" fill="none" />
                </svg>
              </div>
            </Card>

            {/* Card 3: Remaining Coverage */}
            <Card className="p-4 rounded-2xl bg-white border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#00c569]/10 text-[#00c569] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2.5">
                  Remaining Coverage
                </p>
                <div className="mt-1">
                  <span className="text-xl sm:text-2xl font-black text-[#00c569]">
                    {formatCurrency(remainingSI)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-400 font-medium">Available to use</span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    <TrendingUp className="w-3 h-3" /> +18%
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <svg className="w-full h-6 text-[#00c569]" viewBox="0 0 100 20" fill="none">
                  <path d="M0 14 Q20 6 50 10 T100 4" stroke="currentColor" strokeWidth="2.5" fill="none" />
                </svg>
              </div>
            </Card>

            {/* Card 4: Pending Claims */}
            <Card className="p-4 rounded-2xl bg-white border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2.5">
                  Pending Claims
                </p>
                <div className="mt-1">
                  <span className="text-2xl font-black text-amber-600">{pendingClaims}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-400 font-medium">{approvedClaims} approved</span>
                  <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md">
                    <TrendingDown className="w-3 h-3" /> -100%
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <svg className="w-full h-6 text-amber-500" viewBox="0 0 100 20" fill="none">
                  <path d="M0 16 Q35 12 65 17 T100 11" stroke="currentColor" strokeWidth="2.5" fill="none" />
                </svg>
              </div>
            </Card>
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
    </div>
  );
};
