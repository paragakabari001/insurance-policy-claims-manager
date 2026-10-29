import React from 'react';
import { Policy } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ShieldCheck, Calendar, User, FileText, Clock, ArrowRight } from 'lucide-react';

interface PolicyTableProps {
  policies: Policy[];
  isAdmin?: boolean;
  onSelectForClaim?: (policy: Policy) => void;
}

export const PolicyTable: React.FC<PolicyTableProps> = ({
  policies,
  isAdmin = false,
  onSelectForClaim,
}) => {
  if (policies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-800">No Policies Found</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          {isAdmin
            ? 'Get started by creating a coverage policy for Customer 1 or Customer 2.'
            : 'You currently have no active policies registered.'}
        </p>
      </div>
    );
  }

  const getCoverageStatusBadge = (status?: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      case 'Upcoming':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            Upcoming
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Mobile Feed View (Native App Feel on Screens < 768px) */}
      <div className="md:hidden divide-y divide-slate-100">
        {policies.map((policy) => {
          const consumedPercentage = Math.min(
            100,
            Math.round(
              ((policy.sumInsured - policy.remainingClaimableSI) / policy.sumInsured) * 100
            )
          );
          const isAvailable = policy.remainingClaimableSI > 0;

          return (
            <div key={policy.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
              {/* Card Header: ID + Coverage Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {policy.id}
                  </span>
                </div>
                {getCoverageStatusBadge(policy.coverageStatus)}
              </div>

              {/* Customer Info (Admin only) */}
              {isAdmin && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">
                    {policy.customerName || policy.customerUsername}
                  </span>
                  <span className="text-slate-400">@{policy.customerUsername}</span>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{formatDate(policy.startDate)}</span>
                <span className="text-slate-400">&rarr;</span>
                <span>{formatDate(policy.endDate)}</span>
              </div>

              {/* Balances Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Sum Insured</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {formatCurrency(policy.sumInsured)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Remaining Coverage</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-black ${
                        isAvailable ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(policy.remainingClaimableSI)}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {isAvailable ? 'Avail' : 'Exh'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Utilization</span>
                  <span className="font-bold">{consumedPercentage}% Reserved + Used</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      consumedPercentage > 80
                        ? 'bg-rose-500'
                        : consumedPercentage > 40
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${consumedPercentage}%` }}
                  />
                </div>
              </div>

              {/* Action Button for Customers */}
              {!isAdmin && onSelectForClaim && (
                <button
                  onClick={() => onSelectForClaim(policy)}
                  disabled={!isAvailable}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                    isAvailable
                      ? 'bg-[#06241b] hover:bg-[#083528] text-white active:scale-[0.98]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Submit Claim Against This Policy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
              <th scope="col" className="px-6 py-4">Policy ID</th>
              {isAdmin && <th scope="col" className="px-6 py-4">Customer</th>}
              <th scope="col" className="px-6 py-4">Coverage Period</th>
              <th scope="col" className="px-6 py-4">Coverage Status</th>
              <th scope="col" className="px-6 py-4">Original Sum Insured (SI)</th>
              <th scope="col" className="px-6 py-4">Remaining Coverage</th>
              <th scope="col" className="px-6 py-4">Reserved + Used</th>
              {!isAdmin && onSelectForClaim && (
                <th scope="col" className="px-6 py-4 text-right">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {policies.map((policy) => {
              const consumedPercentage = Math.min(
                100,
                Math.round(
                  ((policy.sumInsured - policy.remainingClaimableSI) / policy.sumInsured) * 100
                )
              );
              const isAvailable = policy.remainingClaimableSI > 0;

              return (
                <tr key={policy.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      {policy.id}
                    </div>
                  </td>

                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <span className="font-semibold text-slate-800">
                            {policy.customerName || policy.customerUsername}
                          </span>
                          <span className="text-xs text-slate-500 block">
                            @{policy.customerUsername}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(policy.startDate)}</span>
                      <span className="text-slate-400">&rarr;</span>
                      <span>{formatDate(policy.endDate)}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCoverageStatusBadge(policy.coverageStatus)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                    {formatCurrency(policy.sumInsured)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-base font-black ${
                          isAvailable ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(policy.remainingClaimableSI)}
                      </span>
                      {isAvailable ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Exhausted
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap w-44">
                    <div className="w-full">
                      <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                        <span>{consumedPercentage}% Reserved + Used</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            consumedPercentage > 80
                              ? 'bg-rose-500'
                              : consumedPercentage > 40
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${consumedPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {!isAdmin && onSelectForClaim && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => onSelectForClaim(policy)}
                        disabled={!isAvailable}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                          isAvailable
                            ? 'bg-[#06241b] hover:bg-[#083528] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        Submit Claim
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
