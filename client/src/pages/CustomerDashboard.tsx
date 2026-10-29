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
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
              </div>
              <div className="mt-1.5">
                <span className="text-lg sm:text-2xl font-bold text-slate-900 truncate block">
                  {formatCurrency(totalCoveredSI)}
                </span>
              </div>
            </Card>

            <Card className="p-3.5 sm:p-4 rounded-xl bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  Remaining Coverage
                </span>
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
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
                  Claims Filed
                </span>
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
              </div>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold text-slate-900">{claims.length}</span>
                <span className="text-[10px] sm:text-xs text-amber-700 font-medium">
                  ({submittedClaims} pending)
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
