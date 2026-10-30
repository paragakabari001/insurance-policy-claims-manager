import React, { useState } from 'react';
import { Claim } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from './ui/button';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  User,
  Shield,
  Search,
  Filter,
  MoreHorizontal,
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
  isLoadingDecision,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Submitted' | 'Approved' | 'Rejected'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClaims, setSelectedClaims] = useState<Record<string, boolean>>({});

  const filteredClaims = claims.filter((claim) => {
    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      claim.id.toLowerCase().includes(q) ||
      claim.policyId.toLowerCase().includes(q) ||
      (claim.customer?.name && claim.customer.name.toLowerCase().includes(q)) ||
      (claim.customer?.username && claim.customer.username.toLowerCase().includes(q))
    );
  });

  const toggleSelectAll = () => {
    if (Object.keys(selectedClaims).length === filteredClaims.length) {
      setSelectedClaims({});
    } else {
      const all: Record<string, boolean> = {};
      filteredClaims.forEach((c) => {
        all[c.id] = true;
      });
      setSelectedClaims(all);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedClaims((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6fbf1] text-[#00c569] border border-[#a2f4cc]">
            <CheckCircle2 className="w-3 h-3 text-[#00c569]" />
            Approved
          </span>
        );
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Submitted
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Header Bar (Figma Match: Claims Review title, Search, Filter, Status Tabs) */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <FileCheck className="w-4 h-4 text-[#00c569]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                {isAdmin ? 'Claims Review' : 'My Claims History'}
              </h3>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.2 rounded-full border border-slate-200">
                {claims.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Review and manage submitted claims
            </p>
          </div>
        </div>

        {/* Right Filter & Search Toolbar (Figma Match) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims..."
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

          {/* Status Tabs (All, Submitted, Approved, Rejected) */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            {(['ALL', 'Submitted', 'Approved', 'Rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#031d16] text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'ALL' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Content (Figma Match) */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-white text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th scope="col" className="pl-5 pr-2 py-3.5 w-8">
                <input
                  type="checkbox"
                  checked={
                    filteredClaims.length > 0 &&
                    Object.keys(selectedClaims).length === filteredClaims.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-[#00c569] focus:ring-[#00c569] cursor-pointer"
                />
              </th>
              <th scope="col" className="px-4 py-3.5">Claim ID</th>
              {isAdmin && <th scope="col" className="px-4 py-3.5">Customer</th>}
              <th scope="col" className="px-4 py-3.5">Policy ID</th>
              <th scope="col" className="px-4 py-3.5">Incident Date</th>
              <th scope="col" className="px-4 py-3.5">Claim Amount</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="px-4 py-3.5">Review Action</th>
              <th scope="col" className="px-4 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredClaims.map((claim) => {
              const isSelected = !!selectedClaims[claim.id];
              const isDeciding = isLoadingDecision === claim.id;
              const canDecide = isAdmin && claim.status === 'Submitted';
              const custShort = (claim.customer?.username || '').toUpperCase().slice(0, 2) || 'C1';

              return (
                <tr
                  key={claim.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="pl-5 pr-2 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(claim.id)}
                      className="rounded border-slate-300 text-[#00c569] focus:ring-[#00c569] cursor-pointer"
                    />
                  </td>

                  {/* Claim ID */}
                  <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap">
                    {claim.id}
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
                            {claim.customer?.name || claim.customer?.username || 'Customer'}
                          </span>
                          <span className="text-[11px] text-slate-400 block leading-tight">
                            @{claim.customer?.username}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Policy ID */}
                  <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-medium">
                    {claim.policyId}
                  </td>

                  {/* Incident Date */}
                  <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(claim.incidentDate)}
                    </div>
                  </td>

                  {/* Claim Amount */}
                  <td className="px-4 py-4 whitespace-nowrap font-black text-slate-900">
                    {formatCurrency(claim.amount)}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(claim.status)}
                  </td>

                  {/* Review Action (Figma Match: Approve / Reject or Decided state) */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {canDecide ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDecideClaim && onDecideClaim(claim.id, 'Approved')}
                          disabled={isDeciding}
                          className="px-2.5 py-1 rounded-lg bg-[#00c569] hover:bg-[#08a558] text-white text-[11px] font-bold shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onDecideClaim && onDecideClaim(claim.id, 'Rejected')}
                          disabled={isDeciding}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">
                        Decided ({claim.status})
                      </span>
                    )}
                  </td>

                  {/* Actions 3 dots */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button
                      type="button"
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
    </div>
  );
};
