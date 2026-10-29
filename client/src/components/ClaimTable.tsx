import React, { useState } from 'react';
import { Claim, ClaimStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertCircle,
  Check,
  X,
  User,
  Calendar,
  Filter,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface ClaimTableProps {
  claims: Claim[];
  isAdmin?: boolean;
  onDecideClaim?: (claimId: string, decision: 'Approved' | 'Rejected') => Promise<void>;
  isLoadingDecision?: string | null;
}

export const ClaimTable: React.FC<ClaimTableProps> = ({
  claims,
  isAdmin = false,
  onDecideClaim,
  isLoadingDecision = null,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClaimStatus>('ALL');
  const [pendingDecision, setPendingDecision] = useState<{
    claim: Claim;
    decision: 'Approved' | 'Rejected';
  } | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const filteredClaims = claims.filter((claim) => {
    if (statusFilter === 'ALL') return true;
    return claim.status === statusFilter;
  });

  const handleConfirmDecision = async () => {
    if (!pendingDecision || !onDecideClaim) return;
    setDecisionError(null);
    try {
      await onDecideClaim(pendingDecision.claim.id, pendingDecision.decision);
      setPendingDecision(null);
    } catch (err: any) {
      setDecisionError(
        err?.response?.data?.error ||
        err?.message ||
        'Failed to process decision. The claim may have already been reviewed.'
      );
    }
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Submitted
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Accounting Rules Banner */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-600">
        <span className="font-semibold text-slate-800">Rules:</span>
        <span>Submitted <strong className="text-amber-700">reserves</strong> coverage.</span>
        <span>Approved <strong className="text-emerald-700">uses</strong> coverage.</span>
        <span>Rejected <strong className="text-slate-700">restores</strong> coverage.</span>
      </div>

      {/* Header filter toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            {isAdmin ? 'Claims Review' : 'My Claims History'}
          </h3>
          <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
            {filteredClaims.length}
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs overflow-x-auto">
          <span className="text-slate-400 px-1 sm:px-2 flex items-center gap-1 font-semibold shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(['ALL', 'Submitted', 'Approved', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                statusFilter === status
                  ? 'bg-[#06241b] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {status === 'ALL' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="p-8 sm:p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No claims match the filter.</p>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'When customers file claims against policies, they will appear here.'
              : 'Submit a new claim against an active policy above.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Feed View (Native App Feel on Screens < 768px) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredClaims.map((claim) => {
              const isDeciding = isLoadingDecision === claim.id;
              const canDecide = isAdmin && claim.status === 'Submitted';

              return (
                <div key={claim.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  {/* Top: ID + Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {claim.id}
                    </span>
                    {getStatusBadge(claim.status)}
                  </div>

                  {/* Customer Info (Admin) */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {claim.customer?.name || claim.customer?.username || 'Customer'}
                      </span>
                      <span className="text-slate-400">@{claim.customer?.username}</span>
                    </div>
                  )}

                  {/* Amount & Policy Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-medium">Claim Amount</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {formatCurrency(claim.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Linked Policy</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {claim.policyId}
                      </span>
                    </div>
                  </div>

                  {/* Incident Date */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Incident Date: {formatDate(claim.incidentDate)}</span>
                  </div>

                  {/* Review Actions for Admin on Mobile */}
                  {isAdmin && onDecideClaim && (
                    <div className="pt-2 border-t border-slate-100">
                      {canDecide ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setDecisionError(null);
                              setPendingDecision({ claim, decision: 'Approved' });
                            }}
                            disabled={isDeciding}
                            className="py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setDecisionError(null);
                              setPendingDecision({ claim, decision: 'Rejected' });
                            }}
                            disabled={isDeciding}
                            className="py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-1 text-xs text-slate-400 italic font-medium">
                          Decided ({claim.status})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (Screens >= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th scope="col" className="px-6 py-4">Claim ID</th>
                  {isAdmin && <th scope="col" className="px-6 py-4">Customer</th>}
                  <th scope="col" className="px-6 py-4">Policy ID</th>
                  <th scope="col" className="px-6 py-4">Incident Date</th>
                  <th scope="col" className="px-6 py-4">Claim Amount</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  {isAdmin && onDecideClaim && (
                    <th scope="col" className="px-6 py-4 text-right">Review Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredClaims.map((claim) => {
                  const isDeciding = isLoadingDecision === claim.id;
                  const canDecide = isAdmin && claim.status === 'Submitted';

                  return (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {claim.id}
                      </td>

                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <span className="font-semibold text-slate-800">
                                {claim.customer?.name || claim.customer?.username || 'Customer'}
                              </span>
                              <span className="text-xs text-slate-500 block">
                                @{claim.customer?.username}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600 font-medium">
                        {claim.policyId}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(claim.incidentDate)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900">
                        {formatCurrency(claim.amount)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(claim.status)}
                      </td>

                      {isAdmin && onDecideClaim && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {canDecide ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setDecisionError(null);
                                  setPendingDecision({ claim, decision: 'Approved' });
                                }}
                                disabled={isDeciding}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                                title="Review and approve claim"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setDecisionError(null);
                                  setPendingDecision({ claim, decision: 'Rejected' });
                                }}
                                disabled={isDeciding}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                                title="Review and reject claim"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">
                              Decided ({claim.status})
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Admin Decision Confirmation Dialog */}
      {pendingDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`p-2 rounded-xl ${
                    pendingDecision.decision === 'Approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {pendingDecision.decision === 'Approved' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Confirm Claim {pendingDecision.decision === 'Approved' ? 'Approval' : 'Rejection'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Administrator Decision Review
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPendingDecision(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              {decisionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{decisionError}</span>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Claim ID:</span>
                  <span className="font-mono font-bold text-slate-900">{pendingDecision.claim.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Policy ID:</span>
                  <span className="font-mono font-bold text-slate-900">{pendingDecision.claim.policyId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-medium text-slate-800">
                    {pendingDecision.claim.customer?.name || pendingDecision.claim.customer?.username || 'Customer'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200/80 pt-2 font-semibold">
                  <span className="text-slate-700">Claim Amount:</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatCurrency(pendingDecision.claim.amount)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                {pendingDecision.decision === 'Approved' ? (
                  <span>
                    Approving this claim will permanently finalize this amount as consumed against Policy{' '}
                    <strong className="font-mono">{pendingDecision.claim.policyId}</strong>. This action cannot be reversed.
                  </span>
                ) : (
                  <span>
                    Rejecting this claim will immediately release the reserved amount of{' '}
                    <strong>{formatCurrency(pendingDecision.claim.amount)}</strong> back to the remaining claimable coverage of Policy{' '}
                    <strong className="font-mono">{pendingDecision.claim.policyId}</strong>.
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingDecision(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                disabled={isLoadingDecision === pendingDecision.claim.id}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors inline-flex items-center gap-1.5 ${
                  pendingDecision.decision === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                } disabled:opacity-50`}
              >
                {isLoadingDecision === pendingDecision.claim.id ? (
                  'Processing...'
                ) : (
                  `Confirm ${pendingDecision.decision === 'Approved' ? 'Approval' : 'Rejection'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
