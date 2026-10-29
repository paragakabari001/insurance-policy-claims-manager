import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Policy, Claim, CustomerUser } from '../types';
import { formatCurrency } from '../utils/formatters';
import { StatsCard } from '../components/StatsCard';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { CreatePolicyModal } from '../components/CreatePolicyModal';
import {
  ShieldCheck,
  FileCheck2,
  PlusCircle,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

interface AdminDashboardProps {
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNotify }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isLoadingDecision, setIsLoadingDecision] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [policiesRes, claimsRes, customersRes] = await Promise.all([
        api.getPolicies(),
        api.getClaims(),
        api.getCustomers(),
      ]);
      setPolicies(policiesRes.policies);
      setClaims(claimsRes.claims);
      setCustomers(customersRes.customers);
    } catch (err: any) {
      onNotify('error', err.message || 'Failed to fetch administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePolicy = async (data: {
    customerId: string;
    startDate: string;
    endDate: string;
    sumInsured: number;
    customId?: string;
  }) => {
    const res = await api.createPolicy(data);
    onNotify('success', `Policy ${res.policy.id} successfully created!`);
    await fetchData();
  };

  const handleDecideClaim = async (claimId: string, decision: 'Approved' | 'Rejected') => {
    try {
      setIsLoadingDecision(claimId);
      const res = await api.decideClaim(claimId, decision);
      onNotify(
        'success',
        `Claim ${claimId} marked as ${decision}. Available SI updated to ${formatCurrency(
          res.policyRemainingClaimableSI
        )}.`
      );
      await fetchData();
    } catch (err: any) {
      onNotify('error', err.message || `Failed to ${decision.toLowerCase()} claim.`);
    } finally {
      setIsLoadingDecision(null);
    }
  };

  // Aggregated Stats
  const totalPolicies = policies.length;
  const totalSI = policies.reduce((acc, p) => acc + p.sumInsured, 0);
  const remainingSI = policies.reduce((acc, p) => acc + p.remainingClaimableSI, 0);
  const pendingClaims = claims.filter((c) => c.status === 'Submitted').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Administrator Control Center
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage policies, inspect customer coverage, and review pending insurance claims.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsPolicyModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Create Policy
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Policies"
          value={totalPolicies}
          subtitle={`Across ${customers.length} registered customers`}
          icon={<Layers className="w-6 h-6 text-indigo-400" />}
          variant="indigo"
        />
        <StatsCard
          title="Total Sum Insured (SI)"
          value={formatCurrency(totalSI)}
          subtitle={`Remaining claimable: ${formatCurrency(remainingSI)}`}
          icon={<ShieldCheck className="w-6 h-6 text-purple-400" />}
          variant="purple"
        />
        <StatsCard
          title="Pending Claims"
          value={pendingClaims}
          subtitle="Awaiting admin approval/rejection"
          icon={<Clock className="w-6 h-6 text-amber-400" />}
          variant="amber"
        />
        <StatsCard
          title="Approved Claims"
          value={approvedClaims}
          subtitle={`${claims.length} total claims filed`}
          icon={<FileCheck2 className="w-6 h-6 text-emerald-400" />}
          variant="emerald"
        />
      </div>

      {/* Policies Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Customer Policies</h2>
            <p className="text-xs text-slate-500">
              Overview of all active coverage periods and remaining claimable limits.
            </p>
          </div>
        </div>

        <PolicyTable policies={policies} isAdmin={true} />
      </div>

      {/* Claims Management Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Claims Management</h2>
          <p className="text-xs text-slate-500">
            Review Submitted claims. Approved claims consume SI; Rejected claims immediately release blocked SI.
          </p>
        </div>

        <ClaimTable
          claims={claims}
          isAdmin={true}
          onDecideClaim={handleDecideClaim}
          isLoadingDecision={isLoadingDecision}
        />
      </div>

      {/* Create Policy Modal */}
      <CreatePolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        customers={customers}
        onSubmit={handleCreatePolicy}
      />
    </div>
  );
};
