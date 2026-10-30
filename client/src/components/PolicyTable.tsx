import React, { useState } from 'react';
import { Policy } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ShieldCheck,
  Calendar,
  User,
  FileText,
  Clock,
  ArrowRight,
  LayoutGrid,
  List,
} from 'lucide-react';

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
  // Default to Grid view so policies show as handsome cards on both mobile & desktop!
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
    <div className="space-y-3.5">
      {/* View Switcher Header Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          Showing {policies.length} policies
        </span>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-[#06241b] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Grid Cards View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-[#06241b] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Table List View"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Grid Mode: Individual Standalone Cards */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {policies.map((policy) => {
            const consumedPercentage = Math.min(
              100,
              Math.round(
                ((policy.sumInsured - policy.remainingClaimableSI) / policy.sumInsured) * 100
              )
            );
            const isAvailable = policy.remainingClaimableSI > 0;

            return (
              <div
                key={policy.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Card Top: Policy ID + Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm block">
                        {policy.id}
                      </span>
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-medium text-slate-700 truncate max-w-[150px]">
                            {policy.customerName || policy.customerUsername}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {getCoverageStatusBadge(policy.coverageStatus)}
                </div>

                {/* Coverage Dates */}
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{formatDate(policy.startDate)}</span>
                  </div>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="font-medium">{formatDate(policy.endDate)}</span>
                </div>

                {/* Balances Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Original Sum Insured</span>
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {formatCurrency(policy.sumInsured)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Remaining Coverage</span>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`text-sm sm:text-base font-black ${
                          isAvailable ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(policy.remainingClaimableSI)}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {isAvailable ? 'Avail' : 'Exh'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Utilization</span>
                    <span className="font-bold text-slate-700">
                      {consumedPercentage}% Reserved + Used
                    </span>
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

                {/* Footer Action for Customers (Small & Right-Aligned) */}
                {!isAdmin && onSelectForClaim && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {isAvailable ? 'Eligible for claim' : 'Coverage exhausted'}
                    </span>
                    <button
                      onClick={() => onSelectForClaim(policy)}
                      disabled={!isAvailable}
                      className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs ${
                        isAvailable
                          ? 'bg-[#06241b] hover:bg-[#083528] active:scale-[0.98] text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Submit Claim</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode: Full Width Responsive Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
      )}
    </div>
  );
};
