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
  Search,
  Filter,
  MoreHorizontal,
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState<Record<string, boolean>>({});

  const filteredPolicies = policies.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      (p.customerName && p.customerName.toLowerCase().includes(q)) ||
      (p.customerUsername && p.customerUsername.toLowerCase().includes(q))
    );
  });

  const activeCount = policies.filter((p) => p.coverageStatus === 'Active').length;

  const toggleSelectAll = () => {
    if (Object.keys(selectedPolicies).length === filteredPolicies.length) {
      setSelectedPolicies({});
    } else {
      const all: Record<string, boolean> = {};
      filteredPolicies.forEach((p) => {
        all[p.id] = true;
      });
      setSelectedPolicies(all);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedPolicies((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getCoverageStatusBadge = (status?: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6fbf1] text-[#00c569] border border-[#a2f4cc]">
            Active
          </span>
        );
      case 'Upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Upcoming
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6fbf1] text-[#00c569] border border-[#a2f4cc]">
            Active
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Header Bar (Figma Match: Policies Overview, Search, Filter, Cards/Table toggle) */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#00c569]" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
              Policies Overview
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {policies.length} policies &bull; {activeCount} active
            </p>
          </div>
        </div>

        {/* Right Search, Filter & View Controls (Figma Match) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search policies..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00c569] w-40 sm:w-48 transition-all"
            />
          </div>

          <button
            type="button"
            className="h-8 px-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filter</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#031d16] text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[11px]">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === 'grid' ? (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPolicies.map((policy) => {
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
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <ShieldCheck className="w-5 h-5 text-[#00c569]" />
                    </span>
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm block">
                        {policy.id}
                      </span>
                      {policy.customerName && (
                        <span className="text-xs text-slate-500 font-medium">
                          {policy.customerName} (@{policy.customerUsername})
                        </span>
                      )}
                    </div>
                  </div>
                  {getCoverageStatusBadge(policy.coverageStatus)}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {formatDate(policy.startDate)} &rarr; {formatDate(policy.endDate)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Sum Insured
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(policy.sumInsured)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Remaining
                    </span>
                    <span className="font-extrabold text-[#00c569] text-sm">
                      {formatCurrency(policy.remainingClaimableSI)}
                    </span>
                  </div>
                </div>

                {!isAdmin && onSelectForClaim && (
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => onSelectForClaim(policy)}
                      disabled={!isAvailable}
                      className="h-8 px-3 rounded-xl text-xs font-bold bg-[#031d16] text-white hover:bg-[#072d22] transition-colors"
                    >
                      Submit Claim
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode (Figma Match: Checkbox, Customer avatar pill, rounded badges, Reserved+Used bars) */
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-white text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th scope="col" className="pl-5 pr-2 py-3.5 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredPolicies.length > 0 &&
                      Object.keys(selectedPolicies).length === filteredPolicies.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#00c569] focus:ring-[#00c569] cursor-pointer"
                  />
                </th>
                <th scope="col" className="px-4 py-3.5">Policy ID</th>
                {isAdmin && <th scope="col" className="px-4 py-3.5">Customer</th>}
                <th scope="col" className="px-4 py-3.5">Coverage Period</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5">Original Sum Insured (SI)</th>
                <th scope="col" className="px-4 py-3.5">Remaining Coverage</th>
                <th scope="col" className="px-4 py-3.5">Reserved + Used</th>
                <th scope="col" className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPolicies.map((policy) => {
                const consumedPercentage = Math.min(
                  100,
                  Math.round(
                    ((policy.sumInsured - policy.remainingClaimableSI) / policy.sumInsured) * 100
                  )
                );
                const isAvailable = policy.remainingClaimableSI > 0;
                const isSelected = !!selectedPolicies[policy.id];
                const custShort = (policy.customerUsername || '').toUpperCase().slice(0, 2) || 'C1';

                return (
                  <tr
                    key={policy.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td className="pl-5 pr-2 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(policy.id)}
                        className="rounded border-slate-300 text-[#00c569] focus:ring-[#00c569] cursor-pointer"
                      />
                    </td>

                    {/* Policy ID with Shield Icon */}
                    <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00c569]" />
                        </span>
                        <span>{policy.id}</span>
                      </div>
                    </td>

                    {/* Customer Info (Figma Match: C1/C2 pill with name + username) */}
                    {isAdmin && (
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {custShort}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block leading-tight">
                              {policy.customerName || policy.customerUsername}
                            </span>
                            <span className="text-[11px] text-slate-400 block leading-tight">
                              @{policy.customerUsername}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Coverage Period */}
                    <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(policy.startDate)}</span>
                        <span className="text-slate-400">&rarr;</span>
                        <span>{formatDate(policy.endDate)}</span>
                      </div>
                    </td>

                    {/* Coverage Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getCoverageStatusBadge(policy.coverageStatus)}
                    </td>

                    {/* Original Sum Insured */}
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-slate-900">
                      {formatCurrency(policy.sumInsured)}
                    </td>

                    {/* Remaining Coverage with green available indicator */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900">
                          {formatCurrency(policy.remainingClaimableSI)}
                        </span>
                        {isAvailable && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold text-[#00c569] bg-[#e6fbf1] border border-[#a2f4cc]">
                            Available
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Reserved + Used Progress Bar (Figma Match) */}
                    <td className="px-4 py-4 whitespace-nowrap w-36">
                      <div>
                        <span className="text-[11px] text-slate-500 font-medium block mb-1">
                          {consumedPercentage}% Reserved + Used
                        </span>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#00c569] h-full rounded-full transition-all"
                            style={{ width: `${consumedPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Row Action (3 dots menu icon) */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isAdmin && onSelectForClaim) onSelectForClaim(policy);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
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
