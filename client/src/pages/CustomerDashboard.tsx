import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Policy, Claim, User } from '../types';
import { formatCurrency } from '../utils/formatters';
import { StatsCard } from '../components/StatsCard';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { SubmitClaimModal } from '../components/SubmitClaimModal';
import {
  ShieldCheck,
  FilePlus,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface CustomerDashboardProps {
  user: User;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onNotify }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedPolicyForClaim, setSelectedPolicyForClaim] = useState<string | undefined>(undefined);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [policiesRes, claimsRes] = await Promise.all([
        api.getPolicies(),
        api.getClaims(),
      ]);
      setPolicies(policiesRes.policies);
      setClaims(claimsRes.claims);
    } catch (err: any) {
      onNotify('error', err.message || 'Failed to fetch customer data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleSubmitClaim = async (data: {
    policyId: string;
    incidentDate: string;
    amount: number;
    customId?: string;
  }) => {
    const res = await api.submitClaim(data);
    onNotify(
      'success',
      `Claim ${res.claim.id} submitted successfully! Remaining claimable SI updated to ${formatCurrency(
        res.remainingClaimableSI
      )}.`
    );
    await fetchData();
  };

  const handleOpenClaimForPolicy = (policy: Policy) => {
    setSelectedPolicyForClaim(policy.id);
    setIsClaimModalOpen(true);
  };

  // Metrics
  const totalPolicies = policies.length;
  const totalCoveredSI = policies.reduce((acc, p) => acc + p.sumInsured, 0);
  const availableSI = policies.reduce((acc, p) => acc + p.remainingClaimableSI, 0);
  const submittedClaims = claims.filter((c) => c.status === 'Submitted').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Customer Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-800/80 text-indigo-200 border border-indigo-700/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Customer Self-Service Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            View your active insurance coverage policies and file new claims with real-time SI verification.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setSelectedPolicyForClaim(undefined);
              setIsClaimModalOpen(true);
            }}
            disabled={policies.length === 0}
            className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FilePlus className="w-4 h-4" />
            Submit New Claim
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="My Policies"
          value={totalPolicies}
          subtitle="Registered active policies"
          icon={<Layers className="w-6 h-6 text-indigo-400" />}
          variant="indigo"
        />
        <StatsCard
          title="Total Covered SI"
          value={formatCurrency(totalCoveredSI)}
          subtitle="Original aggregate coverage"
          icon={<ShieldCheck className="w-6 h-6 text-slate-400" />}
          variant="slate"
        />
        <StatsCard
          title="Available Claimable SI"
          value={formatCurrency(availableSI)}
          subtitle="Remaining sum you can claim"
          icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
          variant="emerald"
        />
        <StatsCard
          title="Active Claims"
          value={submittedClaims}
          subtitle={`${approvedClaims} approved / ${claims.length} total`}
          icon={<Clock className="w-6 h-6 text-amber-400" />}
          variant="amber"
        />
      </div>

      {/* Policies Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Insurance Policies</h2>
            <p className="text-xs text-slate-500">
              Only policies belonging to your account are accessible here.
            </p>
          </div>
        </div>

        <PolicyTable
          policies={policies}
          isAdmin={false}
          onSelectForClaim={handleOpenClaimForPolicy}
        />
      </div>

      {/* Claims Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Claims & Status History</h2>
          <p className="text-xs text-slate-500">
            Track real-time decisions from the insurance administrator.
          </p>
        </div>

        <ClaimTable claims={claims} isAdmin={false} />
      </div>

      {/* Submit Claim Modal */}
      {policies.length > 0 && (
        <SubmitClaimModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          policies={policies}
          preselectedPolicyId={selectedPolicyForClaim}
          onSubmit={handleSubmitClaim}
        />
      )}
    </div>
  );
};
