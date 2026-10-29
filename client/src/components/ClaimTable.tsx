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

  const filteredClaims = claims.filter((claim) => {
    if (statusFilter === 'ALL') return true;
    return claim.status === statusFilter;
  });

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Submitted (Pending)
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
      {/* Header filter toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            {isAdmin ? 'All Submitted & Processed Claims' : 'My Claims History'}
          </h3>
          <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
            {filteredClaims.length}
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <span className="text-slate-400 px-2 flex items-center gap-1 font-semibold">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(['ALL', 'Submitted', 'Approved', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
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
        <div className="p-12 text-center">
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th scope="col" className="px-6 py-4">Claim ID</th>
                {isAdmin && <th scope="col" className="px-6 py-4">Customer</th>}
                <th scope="col" className="px-6 py-4">Policy ID</th>
                <th scope="col" className="px-6 py-4">Incident Date</th>
                <th scope="col" className="px-6 py-4">Claim Amount</th>
                <th scope="col" className="px-6 py-4">Live Status</th>
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
                              onClick={() => onDecideClaim(claim.id, 'Approved')}
                              disabled={isDeciding}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                              title="Approve claim (keeps sum insured consumed)"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => onDecideClaim(claim.id, 'Rejected')}
                              disabled={isDeciding}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                              title="Reject claim (releases blocked sum insured)"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
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
      )}
    </div>
  );
};
