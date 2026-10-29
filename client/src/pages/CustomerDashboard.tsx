import React from 'react';
import { Policy, Claim, User } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { ActiveView } from '../components/Sidebar';
import {
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CustomerDashboardProps {
  user: User;
  policies: Policy[];
  claims: Claim[];
  activeView: ActiveView;
  onOpenSubmitClaim: (policyId?: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  policies,
  claims,
  activeView,
  onOpenSubmitClaim,
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
                <ShieldCheck className="w-4 h-4 text-slate-500" />
              </div>
              <div className="mt-1.5">
                <span className="text-2xl font-bold text-slate-900">
                  {formatCurrency(totalCoveredSI)}
                </span>
              </div>
            </Card>

            <Card className="p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Remaining Coverage
                </span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-1.5">
                <span className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(remainingSI)}
                </span>
              </div>
            </Card>

            <Card className="p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Claims Filed
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{claims.length}</span>
                <span className="text-xs text-amber-700 font-medium">
                  ({submittedClaims} pending review)
                </span>
              </div>
            </Card>
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
              Total {policies.length} active policies
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
    </div>
  );
};
