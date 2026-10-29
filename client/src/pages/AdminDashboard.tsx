import React from 'react';
import { Policy, Claim, CustomerUser } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { ActiveView } from '../components/Sidebar';
import {
  ShieldCheck,
  FileCheck2,
  Clock,
  Layers,
} from 'lucide-react';

interface AdminDashboardProps {
  policies: Policy[];
  claims: Claim[];
  customers: CustomerUser[];
  activeView: ActiveView;
  onDecideClaim: (claimId: string, decision: 'Approved' | 'Rejected') => Promise<void>;
  isLoadingDecision: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  policies,
  claims,
  customers,
  activeView,
  onDecideClaim,
  isLoadingDecision,
}) => {
  const totalPolicies = policies.length;
  const activePolicies = policies.filter((p) => p.coverageStatus === 'Active').length;
  const expiredPolicies = policies.filter((p) => p.coverageStatus === 'Expired').length;
  const totalSI = policies.reduce((acc, p) => acc + p.sumInsured, 0);
  const remainingSI = policies.reduce((acc, p) => acc + p.remainingClaimableSI, 0);
  const pendingClaims = claims.filter((c) => c.status === 'Submitted').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;

  return (
    <div className="space-y-6 w-full">
      {/* View: DASHBOARD (Overview) */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Compact Metric Cards (2x2 on Mobile, 4-col on Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            <Card className="p-3.5 sm:p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  Total Policies
                </span>
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
              </div>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold text-slate-900">{totalPolicies}</span>
                <span className="text-[10px] sm:text-xs text-slate-500">
                  ({activePolicies} Active)
                </span>
              </div>
            </Card>

            <Card className="p-3.5 sm:p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  Total Sum Insured
                </span>
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              </div>
              <div className="mt-1.5">
                <span className="text-lg sm:text-2xl font-bold text-slate-900 truncate block">
                  {formatCurrency(totalSI)}
                </span>
              </div>
            </Card>

            <Card className="p-3.5 sm:p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  Remaining Coverage
                </span>
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              </div>
              <div className="mt-1.5">
                <span className="text-lg sm:text-2xl font-bold text-emerald-700 truncate block">
                  {formatCurrency(remainingSI)}
                </span>
              </div>
            </Card>

            <Card className="p-3.5 sm:p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  Pending Claims
                </span>
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
              </div>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold text-amber-600">{pendingClaims}</span>
                <span className="text-[10px] sm:text-xs text-slate-400">({approvedClaims} apprv)</span>
              </div>
            </Card>
          </div>

          {/* Recent Policies Section */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Policies Overview
            </h2>
            <PolicyTable policies={policies} isAdmin={true} />
          </div>

          {/* Recent Claims Section */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Claims Review
            </h2>
            <ClaimTable
              claims={claims}
              isAdmin={true}
              onDecideClaim={onDecideClaim}
              isLoadingDecision={isLoadingDecision}
            />
          </div>
        </div>
      )}

      {/* View: POLICIES */}
      {activeView === 'policies' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">All Customer Policies</h2>
            <span className="text-xs text-slate-500 font-medium">
              Total {policies.length} registered
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
