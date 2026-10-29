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
          {/* Compact Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Card className="p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Policies
                </span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{totalPolicies}</span>
                <span className="text-xs text-slate-500">
                  ({activePolicies} Active, {expiredPolicies} Expired)
                </span>
              </div>
            </Card>

            <Card className="p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Sum Insured
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-1.5">
                <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalSI)}</span>
              </div>
            </Card>

            <Card className="p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Remaining Coverage
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-1.5">
                <span className="text-2xl font-bold text-emerald-700">{formatCurrency(remainingSI)}</span>
              </div>
            </Card>

            <Card className="p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Pending Claims
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-600">{pendingClaims}</span>
                <span className="text-xs text-slate-400">({approvedClaims} approved)</span>
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
