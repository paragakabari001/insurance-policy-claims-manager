import React, { useState, useEffect } from 'react';
import { Policy } from '../types';
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
  ShieldCheck,
  Calendar,
  LayoutGrid,
  List,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Copy,
  FilePlus2,
  Check,
  X,
} from 'lucide-react';

type StatusFilter = 'ALL' | 'Active' | 'Upcoming' | 'Expired';

interface PolicyTableProps {
  policies: Policy[];
  isAdmin?: boolean;
  onSelectForClaim?: (policy: Policy) => void;
}

const statusVariant = (status?: string) => {
  switch (status) {
    case 'Upcoming':
      return 'indigo' as const;
    case 'Expired':
      return 'secondary' as const;
    default:
      return 'success' as const;
  }
};

export const PolicyTable: React.FC<PolicyTableProps> = ({
  policies,
  isAdmin = false,
  onSelectForClaim,
}) => {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'grid';
    }
    return 'table';
  });

  // Automatically switch to Cards view on mobile devices or narrow screen sizes
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setViewMode('grid');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (width > 0 && width < 768) {
      setViewMode('grid');
    }
  }, [width]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [detailPolicy, setDetailPolicy] = useState<Policy | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPolicies = policies.filter((p) => {
    if (statusFilter !== 'ALL' && p.coverageStatus !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      (p.customerName && p.customerName.toLowerCase().includes(q)) ||
      (p.customerUsername && p.customerUsername.toLowerCase().includes(q))
    );
  });

  const activeCount = policies.filter((p) => p.coverageStatus === 'Active').length;
  const selectedCount = filteredPolicies.filter((p) => selected[p.id]).length;
  const allSelected = filteredPolicies.length > 0 && selectedCount === filteredPolicies.length;

  // Responsive: table layout only when the container is wide enough, otherwise stacked cards.
  const useTable = viewMode === 'table' && width >= 640;
  const showUsageColumn = width >= 900;
  const showCustomerColumn = isAdmin && width >= 760;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const all: Record<string, boolean> = {};
      filteredPolicies.forEach((p) => (all[p.id] = true));
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

  const consumedPct = (p: Policy) =>
    p.sumInsured > 0
      ? Math.min(100, Math.round(((p.sumInsured - p.remainingClaimableSI) / p.sumInsured) * 100))
      : 0;

  const renderActions = (policy: Policy) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${policy.id}`}
          className="h-8 w-8 text-slate-400 hover:text-slate-800"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{policy.id}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => setDetailPolicy(policy)}>
          <Eye className="w-3.5 h-3.5 text-slate-400" /> View details
        </DropdownMenuItem>
        {!isAdmin && onSelectForClaim && (
          <DropdownMenuItem
            disabled={policy.remainingClaimableSI <= 0}
            onSelect={() => onSelectForClaim(policy)}
          >
            <FilePlus2 className="w-3.5 h-3.5 text-slate-400" /> Submit claim
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => copyId(policy.id)}>
          {copiedId === policy.id ? (
            <Check className="w-3.5 h-3.5 text-[#00ba63]" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-400" />
          )}
          {copiedId === policy.id ? 'Copied!' : 'Copy policy ID'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const usageBar = (policy: Policy) => (
    <div className="min-w-[96px]">
      <span className="text-[11px] text-slate-500 font-medium block mb-1">
        {consumedPct(policy)}% Reserved + Used
      </span>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-[#00ba63] h-full rounded-full transition-all"
          style={{ width: `${consumedPct(policy)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#00ba63]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
              Policies Overview
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {policies.length} policies &bull; {activeCount} active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px] sm:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search policies..."
              aria-label="Search policies"
              className="h-9 w-full sm:w-48 pl-8 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00ba63]/40 focus:border-[#00ba63]"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl">
                <Filter className="w-3 h-3 text-slate-400" />
                Filter
                {statusFilter !== 'ALL' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ba63]" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Coverage status</DropdownMenuLabel>
              {(['ALL', 'Active', 'Upcoming', 'Expired'] as const).map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={statusFilter === s}
                  onCheckedChange={() => setStatusFilter(s)}
                >
                  {s === 'ALL' ? 'All policies' : s}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              title="Cards view"
              aria-label="Cards view"
              className={`h-8 px-2 sm:px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                viewMode === 'grid'
                  ? 'bg-[#011f17] text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              title="Table view"
              aria-label="Table view"
              className={`h-8 px-2 sm:px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                viewMode === 'table'
                  ? 'bg-[#011f17] text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk selection bar */}
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

      {filteredPolicies.length === 0 && (
        <div className="py-12 text-center text-xs font-medium text-slate-400">
          No policies match your search or filter.
        </div>
      )}

      {/* Cards (grid mode or narrow containers) */}
      {filteredPolicies.length > 0 && !useTable && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3.5">
          {filteredPolicies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400/60 p-4 shadow-2xs transition-all flex flex-col gap-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#00ba63]" />
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 text-sm block truncate whitespace-nowrap">{policy.id}</span>
                    {policy.customerName && (
                      <span className="text-[11px] text-slate-500 font-medium block truncate">
                        {policy.customerName} (@{policy.customerUsername})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={statusVariant(policy.coverageStatus)} className="text-[11px]">
                    {policy.coverageStatus || 'Active'}
                  </Badge>
                  {renderActions(policy)}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {formatDate(policy.startDate)} &rarr; {formatDate(policy.endDate)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <span className="font-extrabold text-[#00ba63] text-sm">
                    {formatCurrency(policy.remainingClaimableSI)}
                  </span>
                </div>
              </div>

              {usageBar(policy)}

              {!isAdmin && onSelectForClaim && (
                <Button
                  type="button"
                  size="sm"
                  disabled={policy.remainingClaimableSI <= 0}
                  onClick={() => onSelectForClaim(policy)}
                  className="bg-[#011f17] hover:bg-[#072d22] w-full"
                >
                  Submit Claim
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table (no horizontal scroll: columns wrap and low-priority columns collapse) */}
      {filteredPolicies.length > 0 && useTable && (
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th scope="col" className="pl-5 pr-2 py-3 w-8">
                <input
                  type="checkbox"
                  aria-label="Select all policies"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 accent-[#00ba63] cursor-pointer"
                />
              </th>
              <th scope="col" className="px-3 py-3">Policy ID</th>
              {showCustomerColumn && <th scope="col" className="px-3 py-3">Customer</th>}
              <th scope="col" className="px-3 py-3">Coverage Period</th>
              <th scope="col" className="px-3 py-3">Status</th>
              <th scope="col" className="px-3 py-3">Sum Insured</th>
              <th scope="col" className="px-3 py-3">Remaining</th>
              {showUsageColumn && <th scope="col" className="px-3 py-3">Reserved + Used</th>}
              <th scope="col" className="pl-3 pr-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPolicies.map((policy) => {
              const isSelected = !!selected[policy.id];
              const initials = (policy.customerName || policy.customerUsername || 'C')
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              return (
                <tr
                  key={policy.id}
                  className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}
                >
                  <td className="pl-5 pr-2 py-3.5">
                    <input
                      type="checkbox"
                      aria-label={`Select ${policy.id}`}
                      checked={isSelected}
                      onChange={() => toggleSelect(policy.id)}
                      className="rounded border-slate-300 accent-[#00ba63] cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00ba63]" />
                      </span>
                      <span className="font-bold text-slate-900 whitespace-nowrap">{policy.id}</span>
                    </div>
                  </td>
                  {showCustomerColumn && (
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block leading-tight">
                            {policy.customerName || policy.customerUsername}
                          </span>
                          <span className="text-[11px] text-slate-400 block leading-tight">
                            @{policy.customerUsername}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-3 py-3.5 text-slate-600 font-medium">
                    <div className="flex items-start gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="leading-snug">
                        <span className="block">{formatDate(policy.startDate)}</span>
                        <span className="block text-slate-400">&rarr; {formatDate(policy.endDate)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge variant={statusVariant(policy.coverageStatus)} className="text-[11px]">
                      {policy.coverageStatus || 'Active'}
                    </Badge>
                  </td>
                  <td className="px-3 py-3.5 font-bold text-slate-900">
                    {formatCurrency(policy.sumInsured)}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="font-black text-[#008f4c] block">
                      {formatCurrency(policy.remainingClaimableSI)}
                    </span>
                    {policy.remainingClaimableSI > 0 && (
                      <Badge variant="success" className="mt-1 px-1.5 py-0 text-[10px]">
                        Available
                      </Badge>
                    )}
                  </td>
                  {showUsageColumn && <td className="px-3 py-3.5">{usageBar(policy)}</td>}
                  <td className="pl-3 pr-3 py-3.5 text-right">{renderActions(policy)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Details dialog */}
      <Dialog open={!!detailPolicy} onOpenChange={(open) => !open && setDetailPolicy(null)}>
        <DialogContent className="max-w-md">
          {detailPolicy && (
            <>
              <DialogHeader>
                <DialogTitle>Policy {detailPolicy.id}</DialogTitle>
                <DialogDescription>
                  Coverage {formatDate(detailPolicy.startDate)} &rarr; {formatDate(detailPolicy.endDate)}
                </DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</dt>
                  <dd className="mt-1">
                    <Badge variant={statusVariant(detailPolicy.coverageStatus)}>
                      {detailPolicy.coverageStatus || 'Active'}
                    </Badge>
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Usage</dt>
                  <dd className="mt-1 font-bold text-slate-900">
                    {consumedPct(detailPolicy)}% reserved + used
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sum insured</dt>
                  <dd className="mt-1 font-extrabold text-slate-900">
                    {formatCurrency(detailPolicy.sumInsured)}
                  </dd>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Remaining</dt>
                  <dd className="mt-1 font-extrabold text-[#008f4c]">
                    {formatCurrency(detailPolicy.remainingClaimableSI)}
                  </dd>
                </div>
                {detailPolicy.customerName && (
                  <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</dt>
                    <dd className="mt-1 font-bold text-slate-900">
                      {detailPolicy.customerName} (@{detailPolicy.customerUsername})
                    </dd>
                  </div>
                )}
              </dl>
              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => copyId(detailPolicy.id)}>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copiedId === detailPolicy.id ? 'Copied!' : 'Copy ID'}
                </Button>
                {!isAdmin && onSelectForClaim && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={detailPolicy.remainingClaimableSI <= 0}
                    className="bg-[#011f17] hover:bg-[#072d22]"
                    onClick={() => {
                      const p = detailPolicy;
                      setDetailPolicy(null);
                      onSelectForClaim(p);
                    }}
                  >
                    Submit Claim
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
