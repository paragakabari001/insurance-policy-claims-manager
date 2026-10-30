import React, { useState } from 'react';
import { Claim } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useElementWidth } from '../hooks/useElementWidth';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Copy,
  Check,
  X,
  Loader2,
  LayoutGrid,
  List,
} from 'lucide-react';

type SortKey = 'newest' | 'oldest' | 'amount-desc' | 'amount-asc';

interface ClaimTableProps {
  claims: Claim[];
  isAdmin?: boolean;
  onDecideClaim?: (claimId: string, decision: 'Approved' | 'Rejected') => Promise<void>;
  isLoadingDecision?: string | null;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'Approved':
      return (
        <Badge variant="success" className="gap-1 text-[11px]">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </Badge>
      );
    case 'Submitted':
      return (
        <Badge variant="warning" className="gap-1 text-[11px]">
          <Clock className="w-3 h-3" /> Submitted
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge variant="destructive" className="gap-1 text-[11px]">
          <XCircle className="w-3 h-3" /> Rejected
        </Badge>
      );
    default:
      return null;
  }
};

export const ClaimTable: React.FC<ClaimTableProps> = ({
  claims,
  isAdmin = false,
  onDecideClaim,
  isLoadingDecision,
}) => {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Submitted' | 'Approved' | 'Rejected'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [detailClaim, setDetailClaim] = useState<Claim | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredClaims = claims
    .filter((claim) => {
      if (statusFilter !== 'ALL' && claim.status !== statusFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        claim.id.toLowerCase().includes(q) ||
        claim.policyId.toLowerCase().includes(q) ||
        (claim.customer?.name && claim.customer.name.toLowerCase().includes(q)) ||
        (claim.customer?.username && claim.customer.username.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'oldest':
          return a.incidentDate.localeCompare(b.incidentDate);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return b.incidentDate.localeCompare(a.incidentDate);
      }
    });

  const selectedCount = filteredClaims.filter((c) => selected[c.id]).length;
  const allSelected = filteredClaims.length > 0 && selectedCount === filteredClaims.length;

  const useTable = viewMode === 'table' && width >= 640;
  const showCustomerColumn = isAdmin && width >= 760;
  const showReviewColumn = isAdmin && width >= 880;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const all: Record<string, boolean> = {};
      filteredClaims.forEach((c) => (all[c.id] = true));
      setSelected(all);
    }
  };
  const toggleSelect = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const decide = async (claim: Claim, decision: 'Approved' | 'Rejected') => {
    if (!onDecideClaim) return;
    await onDecideClaim(claim.id, decision);
    setDetailClaim(null);
  };

  const canDecide = (claim: Claim) => isAdmin && claim.status === 'Submitted' && !!onDecideClaim;

  const renderDecisionButtons = (claim: Claim, compact = false) => {
    const deciding = isLoadingDecision === claim.id;
    if (!canDecide(claim)) {
      return (
        <span className="text-slate-400 font-medium text-xs">Decided ({claim.status})</span>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          disabled={deciding}
          onClick={() => decide(claim, 'Approved')}
          className={`bg-[#00ba63] hover:bg-[#00a357] h-7 ${compact ? 'px-2' : 'px-2.5'} text-[11px]`}
        >
          {deciding ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={deciding}
          onClick={() => decide(claim, 'Rejected')}
          className={`h-7 ${compact ? 'px-2' : 'px-2.5'} text-[11px]`}
        >
          Reject
        </Button>
      </div>
    );
  };

  const renderActions = (claim: Claim) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${claim.id}`}
          className="h-8 w-8 text-slate-400 hover:text-slate-800"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{claim.id}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => setDetailClaim(claim)}>
          <Eye className="w-3.5 h-3.5 text-slate-400" /> View details
        </DropdownMenuItem>
        {canDecide(claim) && (
          <>
            <DropdownMenuItem onSelect={() => decide(claim, 'Approved')}>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00ba63]" /> Approve claim
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => decide(claim, 'Rejected')}
              className="text-rose-600 focus:bg-rose-50 focus:text-rose-700"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject claim
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => copyId(claim.id)}>
          {copiedId === claim.id ? (
            <Check className="w-3.5 h-3.5 text-[#00ba63]" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-400" />
          )}
          {copiedId === claim.id ? 'Copied!' : 'Copy claim ID'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const initialsOf = (claim: Claim) =>
    (claim.customer?.name || claim.customer?.username || 'C')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <FileCheck className="w-4 h-4 text-[#00ba63]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                {isAdmin ? 'Claims Review' : 'My Claims History'}
              </h3>
              <Badge variant="secondary" className="px-2 py-0 text-xs">
                {claims.length}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">Review and manage submitted claims</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px] sm:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims..."
              aria-label="Search claims"
              className="h-9 w-full sm:w-48 pl-8 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00ba63]/40 focus:border-[#00ba63]"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl">
                <Filter className="w-3 h-3 text-slate-400" />
                Sort
                {sortKey !== 'newest' && <span className="w-1.5 h-1.5 rounded-full bg-[#00ba63]" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort claims</DropdownMenuLabel>
              {(
                [
                  ['newest', 'Newest incident first'],
                  ['oldest', 'Oldest incident first'],
                  ['amount-desc', 'Amount: high to low'],
                  ['amount-asc', 'Amount: low to high'],
                ] as const
              ).map(([key, label]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={sortKey === key}
                  onCheckedChange={() => setSortKey(key)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            {(['ALL', 'Submitted', 'Approved', 'Rejected'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                aria-pressed={statusFilter === status}
                className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                  statusFilter === status
                    ? 'bg-[#011f17] text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'ALL' ? 'All' : status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                viewMode === 'grid'
                  ? 'bg-[#011f17] text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                viewMode === 'table'
                  ? 'bg-[#011f17] text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="px-5 py-2 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-800">{selectedCount} selected</span>
          <button
            type="button"
            onClick={() => setSelected({})}
            className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline cursor-pointer"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </div>
      )}

      {filteredClaims.length === 0 && (
        <div className="py-12 text-center text-xs font-medium text-slate-400">
          No claims match your search or filter.
        </div>
      )}

      {/* Cards View (Grid mode or narrow container) */}
      {filteredClaims.length > 0 && !useTable && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="rounded-2xl border border-slate-200/90 bg-white p-4 flex flex-col justify-between gap-3 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 text-sm block truncate whitespace-nowrap">{claim.id}</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Policy {claim.policyId}
                    {isAdmin && claim.customer?.name ? ` · ${claim.customer.name}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <StatusBadge status={claim.status} />
                  {renderActions(claim)}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDate(claim.incidentDate)}
                </span>
                <span className="font-black text-slate-900 text-sm">{formatCurrency(claim.amount)}</span>
              </div>
              {isAdmin && claim.status === 'Submitted' && (
                <div className="pt-2 border-t border-slate-100">{renderDecisionButtons(claim)}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table: fits container, no horizontal scroll */}
      {filteredClaims.length > 0 && useTable && (
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th scope="col" className="pl-5 pr-2 py-3 w-8">
                <input
                  type="checkbox"
                  aria-label="Select all claims"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 accent-[#00ba63] cursor-pointer"
                />
              </th>
              <th scope="col" className="px-3 py-3">Claim ID</th>
              {showCustomerColumn && <th scope="col" className="px-3 py-3">Customer</th>}
              <th scope="col" className="px-3 py-3">Policy ID</th>
              <th scope="col" className="px-3 py-3">Incident Date</th>
              <th scope="col" className="px-3 py-3">Claim Amount</th>
              <th scope="col" className="px-3 py-3">Status</th>
              {showReviewColumn && <th scope="col" className="px-3 py-3">Review Action</th>}
              <th scope="col" className="pl-3 pr-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClaims.map((claim) => {
              const isSelected = !!selected[claim.id];
              return (
                <tr
                  key={claim.id}
                  className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}
                >
                  <td className="pl-5 pr-2 py-3.5">
                    <input
                      type="checkbox"
                      aria-label={`Select ${claim.id}`}
                      checked={isSelected}
                      onChange={() => toggleSelect(claim.id)}
                      className="rounded border-slate-300 accent-[#00ba63] cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3.5 font-bold text-slate-900 whitespace-nowrap">{claim.id}</td>
                  {showCustomerColumn && (
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {initialsOf(claim)}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block leading-tight">
                            {claim.customer?.name || claim.customer?.username || 'Customer'}
                          </span>
                          <span className="text-[11px] text-slate-400 block leading-tight">
                            @{claim.customer?.username}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-3 py-3.5 text-slate-600 font-medium break-all">{claim.policyId}</td>
                  <td className="px-3 py-3.5 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(claim.incidentDate)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 font-black text-slate-900">{formatCurrency(claim.amount)}</td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={claim.status} />
                  </td>
                  {showReviewColumn && (
                    <td className="px-3 py-3.5">{renderDecisionButtons(claim, true)}</td>
                  )}
                  <td className="pl-3 pr-3 py-3.5 text-right">{renderActions(claim)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Details dialog */}
      <Dialog open={!!detailClaim} onOpenChange={(open) => !open && setDetailClaim(null)}>
        <DialogContent className="max-w-md">
          {detailClaim && (
            <>
              <DialogHeader>
                <DialogTitle>Claim {detailClaim.id}</DialogTitle>
                <DialogDescription>Filed against policy {detailClaim.policyId}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge status={detailClaim.status} />
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Incident date</dt>
                  <dd className="mt-1 font-bold text-slate-900">{formatDate(detailClaim.incidentDate)}</dd>
                </div>
                <div className="col-span-2 rounded-xl bg-emerald-50 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Claim amount</dt>
                  <dd className="mt-1 font-extrabold text-[#008f4c] text-base">
                    {formatCurrency(detailClaim.amount)}
                  </dd>
                </div>
                {isAdmin && detailClaim.customer && (
                  <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</dt>
                    <dd className="mt-1 font-bold text-slate-900">
                      {detailClaim.customer.name} (@{detailClaim.customer.username})
                    </dd>
                  </div>
                )}
              </dl>
              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => copyId(detailClaim.id)}>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copiedId === detailClaim.id ? 'Copied!' : 'Copy ID'}
                </Button>
                {canDecide(detailClaim) && renderDecisionButtons(detailClaim)}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
