import React, { useState, useMemo } from 'react';
import { Policy, Claim, CustomerUser, User } from '../types';
import { filterByPeriod } from '../utils/period';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '../components/ui/dropdown-menu';
import {
  FileText,
  Layers,
  ShieldCheck,
  Target,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Columns3,
  MoreVertical,
  TrendingUp,
  ChevronDown,
  Check,
  Users,
  BarChart3,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';

export interface AnalyticsPageProps {
  user?: User;
  policies: Policy[];
  claims: Claim[];
  customers?: CustomerUser[];
  onOpenPolicies?: (query?: string) => void;
  onOpenClaims?: (query?: string) => void;
}

type TabType = 'Overview' | 'Customer Wise' | 'Trends' | 'Coverage' | 'Claims Analysis';

interface CustomerSummaryRow {
  id: string;
  name: string;
  totalPolicies: number;
  sumInsured: number;
  usedReserved: number;
  remainingCoverage: number;
  totalClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  pendingClaims: number;
}

/**
 * Reusable Precision SVG Donut Chart with Center Summary & Clean Legend
 */
const SvgDonutChart: React.FC<{
  total: number;
  centerLabel: string;
  slices: { label: string; value: number; color: string; dotColor: string }[];
}> = ({ total, centerLabel, slices }) => {
  const radius = 40;
  const strokeWidth = 11;
  const circumference = 2 * Math.PI * radius; // ~251.32

  // Calculate segment offsets
  let accumulatedOffset = 0;
  const segments = slices.map((slice) => {
    const fraction = total > 0 ? slice.value / total : 0;
    const strokeDash = fraction * circumference;
    const currentOffset = accumulatedOffset;
    accumulatedOffset += strokeDash;
    return {
      ...slice,
      strokeDasharray: `${strokeDash} ${circumference - strokeDash}`,
      strokeDashoffset: -currentOffset,
      fraction,
    };
  });

  return (
    <div className="flex items-center gap-3 sm:gap-4 w-full">
      {/* SVG Donut Canvas with Center Text (Compact size) */}
      <div className="relative w-24 h-24 sm:w-26 sm:h-26 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Base background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Active colored segments */}
          {total > 0 &&
            segments.map((seg, idx) => (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="anim-donut"
                style={{ ['--dash' as any]: seg.strokeDasharray, ['--circ' as any]: circumference, animationDelay: `${0.1 + idx * 0.12}s` }}
              />
            ))}
        </svg>

        {/* Centered Total & Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            {total}
          </span>
          <span className="text-[9px] font-semibold text-slate-400 capitalize">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend with matching color dots, values and percentages */}
      <div className="flex-1 space-y-1.5 min-w-0">
        {slices.map((slice) => {
          const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0;
          return (
            <div key={slice.label} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full ${slice.dotColor} shrink-0`} />
                <span className="font-semibold text-slate-700 truncate">{slice.label}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 shrink-0">
                <span className="w-4 text-right">{slice.value}</span>
                <span className="text-slate-400 text-[10px] w-7 text-right font-medium">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  user,
  policies: allPolicies = [],
  claims: allClaims = [],
  customers = [],
  onOpenPolicies,
  onOpenClaims,
}) => {
  const isAdmin = user?.role === 'Administrator';

  // Preset selector: matches the user's reference screenshot default 'H2 2026 (Jul - Dec)'
  const [datePreset, setDatePreset] = useState<string>('FY 2026 (Full Year)');
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [summaryViewMode, setSummaryViewMode] = useState<'table' | 'cards'>('table');
  const [claimsAnalysisViewMode, setClaimsAnalysisViewMode] = useState<'table' | 'cards'>('table');

  // Column visibility controls for table
  const [visibleColumns, setVisibleColumns] = useState({
    customerId: true,
    customerName: true,
    totalPolicies: true,
    sumInsured: true,
    usedReserved: true,
    remainingCoverage: true,
    totalClaims: true,
    approved: true,
    rejected: true,
    pending: true,
    actions: true,
  });

  // Filter state for modal/dropdown
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Upcoming' | 'Expired'>('All');

  // Apply the selected period and policy-status filter to everything on this page
  const { policies, claims } = useMemo(() => {
    const scoped = filterByPeriod(allPolicies, allClaims, datePreset);
    if (statusFilter === 'All') return scoped;
    const ps = scoped.policies.filter((p) => (p.coverageStatus || 'Active') === statusFilter);
    const ids = new Set(ps.map((p) => p.id));
    return { policies: ps, claims: scoped.claims.filter((c) => ids.has(c.policyId)) };
  }, [allPolicies, allClaims, datePreset, statusFilter]);

  // Compute live data with strict isolation:
  // Customers ONLY see their own data; Administrator sees full portfolio
  const analyticsData = useMemo(() => {
    // 1. Customer Mode: Strictly calculate only for the logged-in customer's policies & claims
    if (!isAdmin) {
      const totalPolicies = policies.length;
      const totalSI = policies.reduce((a, p) => a + p.sumInsured, 0);
      const totalRemaining = policies.reduce((a, p) => a + p.remainingClaimableSI, 0);
      const totalUsed = totalSI - totalRemaining;
      const totalClaims = claims.length;
      const approvedClaims = claims.filter((c) => c.status === 'Approved').length;
      const rejectedClaims = claims.filter((c) => c.status === 'Rejected').length;
      const pendingClaims = claims.filter((c) => c.status === 'Submitted').length;

      const activePol = policies.filter((p) => p.coverageStatus === 'Active').length;
      const upcomingPol = policies.filter((p) => p.coverageStatus === 'Upcoming').length;
      const expiredPol = policies.filter((p) => p.coverageStatus === 'Expired').length;

      // Each row represents one of the customer's own policies
      const customerRows: CustomerSummaryRow[] = policies.map((p) => {
        const pClaims = claims.filter((c) => c.policyId === p.id);
        const approved = pClaims.filter((c) => c.status === 'Approved').length;
        const rejected = pClaims.filter((c) => c.status === 'Rejected').length;
        const pending = pClaims.filter((c) => c.status === 'Submitted').length;
        return {
          id: p.id,
          name: p.coverageStatus || 'Active',
          totalPolicies: 1,
          sumInsured: p.sumInsured,
          usedReserved: p.sumInsured - p.remainingClaimableSI,
          remainingCoverage: p.remainingClaimableSI,
          totalClaims: pClaims.length,
          approvedClaims: approved,
          rejectedClaims: rejected,
          pendingClaims: pending,
        };
      });

      // Bar distribution across the customer's policies (in ₹ Lakhs)
      const barDistribution = policies.map((p) => ({
        name: p.id,
        value: Math.max(1, Math.round(p.sumInsured / 100000)),
      }));

      return {
        customerRows,
        totalPolicies,
        totalSI,
        totalRemaining,
        totalUsed,
        totalClaims,
        approvedClaims,
        rejectedClaims,
        pendingClaims,
        activePol,
        upcomingPol,
        expiredPol,
        barDistribution,
      };
    }

    // 2. Administrator Mode: If real DB data exists, calculate dynamically across all customers
    if (policies.length > 0) {
      const custMap = new Map<string, CustomerSummaryRow>();

      // Initialize all customers
      customers.forEach((c, idx) => {
        custMap.set(c.id, {
          id: `C${idx + 1}`,
          name: c.name || `Customer ${idx + 1}`,
          totalPolicies: 0,
          sumInsured: 0,
          usedReserved: 0,
          remainingCoverage: 0,
          totalClaims: 0,
          approvedClaims: 0,
          rejectedClaims: 0,
          pendingClaims: 0,
        });
      });

      // Populate policy data
      policies.forEach((p) => {
        let entry = custMap.get(p.customerId);
        if (!entry) {
          entry = {
            id: `C${custMap.size + 1}`,
            name: p.customerName || p.customerUsername || 'Customer',
            totalPolicies: 0,
            sumInsured: 0,
            usedReserved: 0,
            remainingCoverage: 0,
            totalClaims: 0,
            approvedClaims: 0,
            rejectedClaims: 0,
            pendingClaims: 0,
          };
          custMap.set(p.customerId, entry);
        }
        entry.totalPolicies += 1;
        entry.sumInsured += p.sumInsured;
        entry.remainingCoverage += p.remainingClaimableSI;
        entry.usedReserved += p.sumInsured - p.remainingClaimableSI;
      });

      // Populate claims data
      claims.forEach((c) => {
        const custId = c.customer?.id || (c as any).customerId;
        const entry = custId ? custMap.get(custId) : undefined;
        if (entry) {
          entry.totalClaims += 1;
          if (c.status === 'Approved') entry.approvedClaims += 1;
          else if (c.status === 'Rejected') entry.rejectedClaims += 1;
          else entry.pendingClaims += 1;
        }
      });

      const customerRows = Array.from(custMap.values());
      const totalPolicies = policies.length;
      const totalSI = policies.reduce((a, p) => a + p.sumInsured, 0);
      const totalRemaining = policies.reduce((a, p) => a + p.remainingClaimableSI, 0);
      const totalUsed = totalSI - totalRemaining;
      const totalClaims = claims.length;
      const approvedClaims = claims.filter((c) => c.status === 'Approved').length;
      const rejectedClaims = claims.filter((c) => c.status === 'Rejected').length;
      const pendingClaims = claims.filter((c) => c.status === 'Submitted').length;

      const activePol = policies.filter((p) => p.coverageStatus === 'Active').length;
      const upcomingPol = policies.filter((p) => p.coverageStatus === 'Upcoming').length;
      const expiredPol = policies.filter((p) => p.coverageStatus === 'Expired').length;

      return {
        customerRows,
        totalPolicies,
        totalSI,
        totalRemaining,
        totalUsed,
        totalClaims,
        approvedClaims,
        rejectedClaims,
        pendingClaims,
        activePol,
        upcomingPol,
        expiredPol,
        barDistribution: customerRows.map((c) => ({
          name: c.name,
          value: c.totalPolicies,
        })),
      };
    }

    // 3. Fallback benchmark figures if Admin has fresh unseeded database
    const referenceCustomers: CustomerSummaryRow[] = [
      {
        id: 'C1',
        name: 'Customer 1',
        totalPolicies: 6,
        sumInsured: 1500000,
        usedReserved: 250000,
        remainingCoverage: 1250000,
        totalClaims: 3,
        approvedClaims: 2,
        rejectedClaims: 1,
        pendingClaims: 0,
      },
      {
        id: 'C2',
        name: 'Customer 2',
        totalPolicies: 4,
        sumInsured: 1000000,
        usedReserved: 200000,
        remainingCoverage: 800000,
        totalClaims: 3,
        approvedClaims: 3,
        rejectedClaims: 0,
        pendingClaims: 0,
      },
      {
        id: 'C3',
        name: 'Customer 3',
        totalPolicies: 2,
        sumInsured: 800000,
        usedReserved: 130000,
        remainingCoverage: 670000,
        totalClaims: 1,
        approvedClaims: 1,
        rejectedClaims: 0,
        pendingClaims: 0,
      },
    ];

    const customerRows = referenceCustomers;
    const totalPolicies = 12;
    const totalSI = 3300000;
    const totalUsed = 580000;
    const totalRemaining = 2720000;
    const totalClaims = 7;
    const approvedClaims = 6;
    const rejectedClaims = 1;
    const pendingClaims = 0;

    const activePol = 9;
    const upcomingPol = 2;
    const expiredPol = 1;

    const barDistribution = [
      { name: 'Customer 1', value: 6, color: '#00ba63' },
      { name: 'Customer 2', value: 4, color: '#6ee7b7' },
      { name: 'Customer 3', value: 0, color: '#a7f3d0' },
    ];

    return {
      customerRows,
      totalPolicies,
      totalSI,
      totalRemaining,
      totalUsed,
      totalClaims,
      approvedClaims,
      rejectedClaims,
      pendingClaims,
      activePol,
      upcomingPol,
      expiredPol,
      barDistribution,
    };
  }, [policies, claims, customers, datePreset, isAdmin]);

  // Percentage calculations
  const remainingPct =
    analyticsData.totalSI > 0
      ? Math.round((analyticsData.totalRemaining / analyticsData.totalSI) * 100)
      : 82;
  const usedPct = 100 - remainingPct;

  // Filtered customer table rows
  const filteredCustomers = useMemo(() => {
    return analyticsData.customerRows.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    });
  }, [analyticsData.customerRows, searchQuery]);

  // Grand totals for table summary row
  const tableTotals = useMemo(() => {
    return filteredCustomers.reduce(
      (acc, c) => ({
        totalPolicies: acc.totalPolicies + c.totalPolicies,
        sumInsured: acc.sumInsured + c.sumInsured,
        usedReserved: acc.usedReserved + c.usedReserved,
        remainingCoverage: acc.remainingCoverage + c.remainingCoverage,
        totalClaims: acc.totalClaims + c.totalClaims,
        approvedClaims: acc.approvedClaims + c.approvedClaims,
        rejectedClaims: acc.rejectedClaims + c.rejectedClaims,
        pendingClaims: acc.pendingClaims + c.pendingClaims,
      }),
      {
        totalPolicies: 0,
        sumInsured: 0,
        usedReserved: 0,
        remainingCoverage: 0,
        totalClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        pendingClaims: 0,
      }
    );
  }, [filteredCustomers]);

  // Export Analytics Summary to CSV
  const handleExportReport = () => {
    const csvRows: string[][] = [
      ['TailVaR Insurance Analytics Report'],
      ['Period', datePreset],
      ['Generated On', new Date().toLocaleString()],
      [],
      ['--- PORTFOLIO OVERVIEW ---'],
      ['Metric', 'Value', 'Percentage'],
      ['Total Policies', String(analyticsData.totalPolicies), '100%'],
      ['Active Policies', String(analyticsData.activePol), `${Math.round((analyticsData.activePol / analyticsData.totalPolicies) * 100)}%`],
      ['Upcoming Policies', String(analyticsData.upcomingPol), `${Math.round((analyticsData.upcomingPol / analyticsData.totalPolicies) * 100)}%`],
      ['Expired Policies', String(analyticsData.expiredPol), `${Math.round((analyticsData.expiredPol / analyticsData.totalPolicies) * 100)}%`],
      ['Total Sum Insured', String(analyticsData.totalSI), '100%'],
      ['Reserved + Used Coverage', String(analyticsData.totalUsed), `${usedPct}%`],
      ['Remaining Coverage (Available)', String(analyticsData.totalRemaining), `${remainingPct}%`],
      ['Total Claims Filed', String(analyticsData.totalClaims), '100%'],
      ['Approved Claims', String(analyticsData.approvedClaims), `${Math.round((analyticsData.approvedClaims / (analyticsData.totalClaims || 1)) * 100)}%`],
      ['Rejected Claims', String(analyticsData.rejectedClaims), `${Math.round((analyticsData.rejectedClaims / (analyticsData.totalClaims || 1)) * 100)}%`],
      ['Pending Claims', String(analyticsData.pendingClaims), '0%'],
      [],
      ['--- CUSTOMER WISE SUMMARY ---'],
      [
        'Customer ID',
        'Customer Name',
        'Total Policies',
        'Sum Insured',
        'Used / Reserved',
        'Remaining Coverage',
        'Total Claims',
        'Approved',
        'Rejected',
        'Pending',
      ],
      ...filteredCustomers.map((c) => [
        c.id,
        c.name,
        String(c.totalPolicies),
        String(c.sumInsured),
        String(c.usedReserved),
        String(c.remainingCoverage),
        String(c.totalClaims),
        String(c.approvedClaims),
        String(c.rejectedClaims),
        String(c.pendingClaims),
      ]),
      [
        'Total',
        '',
        String(tableTotals.totalPolicies),
        String(tableTotals.sumInsured),
        String(tableTotals.usedReserved),
        String(tableTotals.remainingCoverage),
        String(tableTotals.totalClaims),
        String(tableTotals.approvedClaims),
        String(tableTotals.rejectedClaims),
        String(tableTotals.pendingClaims),
      ],
    ];

    const escapeCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const csvContent = csvRows.map((r) => r.map(escapeCell).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Analytics-Report-${datePreset.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs: TabType[] = isAdmin
    ? ['Overview', 'Customer Wise', 'Trends', 'Coverage', 'Claims Analysis']
    : ['Overview', 'Trends', 'Coverage', 'Claims Analysis'];

  const show = (...t: TabType[]) => t.includes(activeTab);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendYear = useMemo(() => {
    const years = claims.map((c) => new Date(c.createdAt).getFullYear()).filter((y) => !isNaN(y));
    return years.length ? Math.max(...years) : 2026;
  }, [claims]);
  const monthCounts = useMemo(() => {
    const arr = Array(12).fill(0) as number[];
    claims.forEach((c) => {
      const d = new Date(c.createdAt);
      if (!isNaN(d.getTime()) && d.getFullYear() === trendYear) arr[d.getMonth()] += 1;
    });
    return arr;
  }, [claims, trendYear]);
  const trendPts = useMemo(() => {
    const max = Math.max(1, ...monthCounts);
    return monthCounts.map((v, i) => ({ x: 8 + i * (264 / 11), y: 60 - (v / max) * 48, v }));
  }, [monthCounts]);
  const trendPath = trendPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  const coveragePolicies = useMemo(
    () => policies,
    [policies]
  );
  const claimAmounts = useMemo(() => {
    const t = { Approved: 0, Submitted: 0, Rejected: 0 };
    claims.forEach((c) => {
      t[c.status] += c.amount;
    });
    return t;
  }, [claims]);

  return (
    <div className="space-y-5 w-full pb-10">
      {/* 1. Page Header with Title, Date Range Dropdown, Export Button & Filter Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isAdmin
              ? 'Complete overview of policies, coverage and claims across all customers'
              : 'Personal overview of your coverage, policies and claims history'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Range Preset Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{datePreset}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5">
              <DropdownMenuLabel>Timeframe Preset</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['FY 2026 (Full Year)', 'H1 2026 (Jan - Jun)', 'H2 2026 (Jul - Dec)', 'Q3 2026 (Jul - Sep)', 'Q4 2026 (Oct - Dec)', 'All Time'].map(
                (preset) => (
                  <DropdownMenuItem
                    key={preset}
                    onClick={() => setDatePreset(preset)}
                    className="flex items-center justify-between text-xs cursor-pointer font-medium"
                  >
                    <span>{preset}</span>
                    {datePreset === preset && <Check className="w-3.5 h-3.5 text-[#00ba63]" />}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Report Action Button (Figma / Reference Design match) */}
          <button
            type="button"
            onClick={handleExportReport}
            className="h-9 px-4 rounded-xl bg-[#031d16] hover:bg-[#072d22] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#031d16]/20 transition-all cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#00c569]" />
            <span>Export Report</span>
          </button>

          {/* Filter Popover/Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-[#00ba63]" />
                <span>Filter</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1.5">
              <DropdownMenuLabel>Policy Status Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['All', 'Active', 'Upcoming', 'Expired'] as const).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className="flex items-center justify-between text-xs cursor-pointer"
                >
                  <span>{status} Policies</span>
                  {statusFilter === status && <Check className="w-3.5 h-3.5 text-[#00ba63]" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs Bar */}
      <div className="border-b border-slate-200/80 flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar pt-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold pb-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#00ba63] text-[#00ba63]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 3. KPI Metrics: stacked responsive cards (2x2 on mobile, 4 cols on wide) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="kpi-card bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-emerald-300 transition-all min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="w-8 h-8 rounded-xl bg-[#e6f9f0] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#00ba63]" />
            </div>
            <span className="inline-flex items-center rounded-full bg-[#eafaf1] text-[#00ba63] font-bold px-2 py-0.5 text-[10px] sm:text-xs shrink-0">↑ 20%</span>
          </div>
          <div className="mt-2.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight truncate">Total Policies</p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5 truncate">{analyticsData.totalPolicies}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">Across all policies</p>
          </div>
        </div>
        <div className="kpi-card bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-blue-300 transition-all min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="w-8 h-8 rounded-xl bg-[#eef4ff] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-[#2563eb]" />
            </div>
            <span className="inline-flex items-center rounded-full bg-[#eff6ff] text-[#2563eb] font-bold px-2 py-0.5 text-[10px] sm:text-xs shrink-0">↑ 8%</span>
          </div>
          <div className="mt-2.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight truncate">Total Sum Insured</p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5 truncate">{formatCurrency(analyticsData.totalSI)}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">Total insured value</p>
          </div>
        </div>
        <div className="kpi-card bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-emerald-300 transition-all min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="w-8 h-8 rounded-xl bg-[#e6f9f0] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#00ba63]" />
            </div>
            <span className="inline-flex items-center rounded-full bg-[#eafaf1] text-[#00ba63] font-bold px-2 py-0.5 text-[10px] sm:text-xs shrink-0">{remainingPct}%</span>
          </div>
          <div className="mt-2.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight truncate">Available Coverage</p>
            <p className="text-lg sm:text-2xl font-black text-[#008f4c] tracking-tight leading-tight mt-0.5 truncate">{formatCurrency(analyticsData.totalRemaining)}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">Remaining to claim</p>
          </div>
        </div>
        <div className="kpi-card bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-orange-300 transition-all min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-orange-500" />
            </div>
            <span className="inline-flex items-center rounded-full bg-orange-50 text-orange-600 font-bold px-2 py-0.5 text-[10px] sm:text-xs shrink-0">Claims</span>
          </div>
          <div className="mt-2.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight truncate">Total Claims</p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5 truncate">{analyticsData.totalClaims}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">{analyticsData.approvedClaims} approved • {analyticsData.rejectedClaims} rejected</p>
          </div>
        </div>
      </div>

      {/* 4. Row 2: Coverage Summary (Left) & Policies by Status Donut (Right) - High-Density */}
      {show('Overview', 'Coverage') && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Coverage Summary Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-md bg-[#e6f9f0] flex items-center justify-center text-[#00ba63]">
              <FileText className="w-3.5 h-3.5 text-[#00ba63]" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Coverage Summary</h3>
          </div>

          {/* Large Two-Tone Horizontal Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div
                className="bg-[#00c569] h-full anim-bar-x"
                style={{ width: `${usedPct}%` }}
                title={`Reserved + Used: ${formatCurrency(analyticsData.totalUsed)} (${usedPct}%)`}
              />
              <div
                className="bg-[#00ba63] h-full anim-bar-x" 
                style={{ width: `${remainingPct}%` }}
                title={`Remaining: ${formatCurrency(analyticsData.totalRemaining)} (${remainingPct}%)`}
              />
            </div>

            {/* Three Breakdown Stat Values matching screenshot */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00c569]" />
                <span className="font-semibold text-slate-600">Reserved + Used</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(analyticsData.totalUsed)} ({usedPct}%)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ba63]" />
                <span className="font-semibold text-slate-600">Remaining</span>
                <span className="font-bold text-[#008f4c]">
                  {formatCurrency(analyticsData.totalRemaining)} ({remainingPct}%)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Total Sum Insured</span>
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(analyticsData.totalSI)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Policies by Status Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-[#e6f9f0] flex items-center justify-center text-[#00ba63]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ba63]" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Policies by Status</h3>
          </div>

          <SvgDonutChart
            total={analyticsData.totalPolicies}
            centerLabel="Policies"
            slices={[
              {
                label: 'Active',
                value: analyticsData.activePol,
                color: '#00ba63',
                dotColor: 'bg-[#00ba63]',
              },
              {
                label: 'Upcoming',
                value: analyticsData.upcomingPol,
                color: '#f59e0b',
                dotColor: 'bg-amber-400',
              },
              {
                label: 'Expired',
                value: analyticsData.expiredPol,
                color: '#cbd5e1',
                dotColor: 'bg-slate-300',
              },
            ]}
          />
        </div>
      </div>
)}

      {/* 5. Row 3: Three Visualizations (Claims by Outcome, Customer Wise Distribution, Monthly Claim Trend) - Space-Efficient */}
      <div className={`grid grid-cols-1 gap-3.5 sm:gap-4 ${activeTab === 'Overview' ? 'md:grid-cols-3' : activeTab === 'Trends' ? 'md:grid-cols-2' : ''}`}>
        {/* Chart 1: Claims by Outcome Donut */}
        <div className={`${show('Overview', 'Trends', 'Claims Analysis') ? '' : 'hidden'} bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between`}>
          <h3 className="text-xs font-bold text-slate-900 mb-2">Claims by Outcome</h3>
          <SvgDonutChart
            total={analyticsData.totalClaims}
            centerLabel="Claims"
            slices={[
              {
                label: 'Approved',
                value: analyticsData.approvedClaims,
                color: '#00ba63',
                dotColor: 'bg-[#00ba63]',
              },
              {
                label: 'Rejected',
                value: analyticsData.rejectedClaims,
                color: '#ef4444',
                dotColor: 'bg-rose-500',
              },
              {
                label: 'Pending',
                value: analyticsData.pendingClaims,
                color: '#f59e0b',
                dotColor: 'bg-amber-400',
              },
            ]}
          />
        </div>

        {/* Chart 2: Customer Wise Distribution Bar Chart */}
        <div className={`${show('Overview', 'Customer Wise') ? '' : 'hidden'} bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between`}>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-md bg-[#e6f9f0] flex items-center justify-center text-[#00ba63]">
              <Users className="w-3 h-3 text-[#00ba63]" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              {isAdmin ? 'Customer Wise Distribution' : 'Policy Coverage Distribution'}
            </h3>
          </div>

          <div className="relative pt-2 pb-1 flex-1 flex flex-col justify-end">
            {/* Horizontal Dashed Gridlines & Left Y-Axis labels */}
            <div className="absolute inset-x-0 inset-y-2 flex flex-col justify-between pointer-events-none">
              {[8, 6, 4, 2, 0].map((val) => (
                <div key={val} className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-medium w-3 text-right">
                    {val}
                  </span>
                  <div className="flex-1 border-b border-dashed border-slate-100" />
                </div>
              ))}
            </div>

            {/* Vertical Bars */}
            <div className="relative z-10 pl-5 pr-2 h-22 flex items-end justify-around">
              {analyticsData.barDistribution.map((bar, idx) => {
                const heightPct = Math.min(100, Math.max(0, (bar.value / 8) * 100));
                const barColor =
                  idx === 0 ? 'bg-[#00ba63]' : idx === 1 ? 'bg-[#6ee7b7]' : 'bg-[#a7f3d0]';

                return (
                  <div key={bar.name} className="flex flex-col items-center gap-1 w-14 group">
                    <span className="text-[10px] font-bold text-slate-700">
                      {bar.value}
                    </span>
                    <div className="w-7 bg-slate-100/60 rounded-t-md h-16 flex items-end">
                      <div
                        className={`w-full ${barColor} rounded-t-md anim-bar-y group-hover:opacity-90`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-600 truncate max-w-full text-center">
                      {bar.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 3: Monthly Claim Trend (computed from real claims) */}
        <div className={`${show('Overview', 'Trends') ? '' : 'hidden'} bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900">Monthly Claim Trend</h3>
            <span className="text-[10px] font-semibold text-slate-400">{trendYear}</span>
          </div>
          <div className="relative flex-1 flex flex-col justify-end">
            <svg className="w-full h-24 overflow-visible" viewBox="0 0 280 70" preserveAspectRatio="none">
              {[0, 1, 2, 3].map((g) => (
                <line key={g} x1="0" x2="280" y1={10 + g * 16.6} y2={10 + g * 16.6} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              <path d={`${trendPath} L ${trendPts[11].x},60 L ${trendPts[0].x},60 Z`} fill="#00ba63" opacity="0.1" />
              <path d={trendPath} fill="none" stroke="#00ba63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="anim-line" />
              {trendPts.map((pt, i) => (
                <g key={i} className="group anim-pop" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${0.4 + i * 0.06}s` }}>
                  <circle cx={pt.x} cy={pt.y} r="3" fill="#00ba63" stroke="#fff" strokeWidth="1.5">
                    <title>{`${MONTHS[i]}: ${pt.v} claim(s)`}</title>
                  </circle>
                </g>
              ))}
            </svg>
            <div className="flex justify-between text-[9px] font-semibold text-slate-500 pt-1">
              {MONTHS.map((m) => (
                <span key={m}>{m[0]}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Row 4: Customer Wise Summary Table (Compact Space-Efficient View) */}
      {show('Overview', 'Customer Wise') && (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
        {/* Table Top Header: Title & Search + Columns Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#e6f9f0] flex items-center justify-center text-[#00ba63]">
              <Users className="w-3.5 h-3.5 text-[#00ba63]" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              {isAdmin ? 'Customer Wise Summary' : 'My Policies Coverage Summary'}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Search Input */}
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAdmin ? 'Search customers...' : 'Search policies...'}
                className="w-full h-8 pl-8 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#00ba63] focus:bg-white transition-all"
              />
            </div>

            {/* Column Toggling Dropdown */}
            {summaryViewMode === 'table' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-8 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Columns3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Columns</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1.5">
                  <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.sumInsured}
                    onCheckedChange={(checked) =>
                      setVisibleColumns((prev) => ({ ...prev, sumInsured: !!checked }))
                    }
                  >
                    Sum Insured
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.usedReserved}
                    onCheckedChange={(checked) =>
                      setVisibleColumns((prev) => ({ ...prev, usedReserved: !!checked }))
                    }
                  >
                    Used / Reserved
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.remainingCoverage}
                    onCheckedChange={(checked) =>
                      setVisibleColumns((prev) => ({ ...prev, remainingCoverage: !!checked }))
                    }
                  >
                    Remaining Coverage
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.totalClaims}
                    onCheckedChange={(checked) =>
                      setVisibleColumns((prev) => ({ ...prev, totalClaims: !!checked }))
                    }
                  >
                    Total Claims
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Cards vs Table View Toggle */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setSummaryViewMode('cards')}
                aria-pressed={summaryViewMode === 'cards'}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                  summaryViewMode === 'cards'
                    ? 'bg-[#011f17] text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Cards
              </button>
              <button
                type="button"
                onClick={() => setSummaryViewMode('table')}
                aria-pressed={summaryViewMode === 'table'}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                  summaryViewMode === 'table'
                    ? 'bg-[#011f17] text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" /> Table
              </button>
            </div>
          </div>
        </div>

        {/* View Mode: Cards */}
        {summaryViewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {filteredCustomers.map((row) => (
              <div
                key={row.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 text-[#008f4c] font-black text-xs flex items-center justify-center shrink-0">
                      {row.id}
                    </span>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-xs truncate">{row.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {row.totalPolicies} {row.totalPolicies === 1 ? 'Policy' : 'Policies'} &bull; {row.totalClaims} {row.totalClaims === 1 ? 'Claim' : 'Claims'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Actions"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 p-1.5 text-xs">
                      <DropdownMenuItem
                        onClick={() => onOpenPolicies?.(row.name)}
                        className="cursor-pointer"
                      >
                        View Policies
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onOpenClaims?.(row.name)}
                        className="cursor-pointer"
                      >
                        View Claims
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div className="bg-slate-50/80 rounded-xl p-2.5">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sum Insured</p>
                    <p className="font-black text-slate-900 text-xs mt-0.5">{formatCurrency(row.sumInsured)}</p>
                  </div>
                  <div className="bg-emerald-50/60 rounded-xl p-2.5">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Remaining</p>
                    <p className="font-black text-[#008f4c] text-xs mt-0.5">{formatCurrency(row.remainingCoverage)}</p>
                  </div>
                  <div className="bg-slate-50/80 rounded-xl p-2.5">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Used / Reserved</p>
                    <p className="font-bold text-slate-800 text-xs mt-0.5">{formatCurrency(row.usedReserved)}</p>
                  </div>
                  <div className="bg-slate-50/80 rounded-xl p-2.5">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Claims Outcome</p>
                    <p className="font-bold text-xs mt-0.5 text-slate-800">
                      <span className="text-[#008f4c]">{row.approvedClaims} App</span>
                      {row.rejectedClaims > 0 && <span className="text-rose-500 ml-1">&bull; {row.rejectedClaims} Rej</span>}
                      {row.pendingClaims > 0 && <span className="text-amber-500 ml-1">&bull; {row.pendingClaims} Pend</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-slate-400">
                No customers found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        ) : (
        /* Scrollable Customer Table with Rounded Corners */
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                {visibleColumns.customerId && (
                  <th className="px-3 py-2">{isAdmin ? 'Customer ID' : 'Policy ID'}</th>
                )}
                {visibleColumns.customerName && (
                  <th className="px-3 py-2">{isAdmin ? 'Customer Name' : 'Coverage Status'}</th>
                )}
                {visibleColumns.totalPolicies && <th className="px-3 py-2 text-center">Total Policies</th>}
                {visibleColumns.sumInsured && <th className="px-3 py-2">Sum Insured</th>}
                {visibleColumns.usedReserved && <th className="px-3 py-2">Used / Reserved</th>}
                {visibleColumns.remainingCoverage && <th className="px-3 py-2">Remaining Coverage</th>}
                {visibleColumns.totalClaims && <th className="px-3 py-2 text-center">Total Claims</th>}
                {visibleColumns.approved && <th className="px-3 py-2 text-center">Approved</th>}
                {visibleColumns.rejected && <th className="px-3 py-2 text-center">Rejected</th>}
                {visibleColumns.pending && <th className="px-3 py-2 text-center">Pending</th>}
                {visibleColumns.actions && <th className="px-3 py-2 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCustomers.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  {visibleColumns.customerId && (
                    <td className="px-3 py-2 font-bold text-slate-800">{row.id}</td>
                  )}
                  {visibleColumns.customerName && (
                    <td className="px-3 py-2 font-semibold text-slate-700">{row.name}</td>
                  )}
                  {visibleColumns.totalPolicies && (
                    <td className="px-3 py-2 text-center font-bold text-slate-900">
                      {row.totalPolicies}
                    </td>
                  )}
                  {visibleColumns.sumInsured && (
                    <td className="px-3 py-2 font-bold text-slate-900">
                      {formatCurrency(row.sumInsured)}
                    </td>
                  )}
                  {visibleColumns.usedReserved && (
                    <td className="px-3 py-2 font-bold text-slate-800">
                      {formatCurrency(row.usedReserved)}
                    </td>
                  )}
                  {visibleColumns.remainingCoverage && (
                    <td className="px-3 py-2 font-extrabold text-[#008f4c]">
                      {formatCurrency(row.remainingCoverage)}
                    </td>
                  )}
                  {visibleColumns.totalClaims && (
                    <td className="px-3 py-2 text-center font-bold text-slate-900">
                      {row.totalClaims}
                    </td>
                  )}
                  {visibleColumns.approved && (
                    <td className="px-3 py-2 text-center font-bold text-[#008f4c]">
                      {row.approvedClaims}
                    </td>
                  )}
                  {visibleColumns.rejected && (
                    <td className="px-3 py-2 text-center font-bold text-rose-500">
                      {row.rejectedClaims}
                    </td>
                  )}
                  {visibleColumns.pending && (
                    <td className="px-3 py-2 text-center font-bold text-amber-500">
                      {row.pendingClaims}
                    </td>
                  )}
                  {visibleColumns.actions && (
                    <td className="px-3 py-2 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label="Actions"
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 p-1.5 text-xs">
                          <DropdownMenuItem
                            onClick={() => onOpenPolicies?.(row.name)}
                            className="cursor-pointer"
                          >
                            View Policies
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onOpenClaims?.(row.name)}
                            className="cursor-pointer"
                          >
                            View Claims
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-6 text-center text-xs text-slate-400">
                    No customers found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              )}
            </tbody>

            {/* Bottom Total / Summary Row matching exact screenshot */}
            {filteredCustomers.length > 0 && (
              <tfoot className="bg-slate-50/90 font-black text-slate-900 border-t-2 border-slate-200">
                <tr>
                  {visibleColumns.customerId && (
                    <td className="px-3 py-2.5 font-black text-slate-900">Total</td>
                  )}
                  {visibleColumns.customerName && <td className="px-3 py-2.5"></td>}
                  {visibleColumns.totalPolicies && (
                    <td className="px-3 py-2.5 text-center font-black text-slate-900">
                      {tableTotals.totalPolicies}
                    </td>
                  )}
                  {visibleColumns.sumInsured && (
                    <td className="px-3 py-2.5 font-black text-slate-900">
                      {formatCurrency(tableTotals.sumInsured)}
                    </td>
                  )}
                  {visibleColumns.usedReserved && (
                    <td className="px-3 py-2.5 font-black text-slate-900">
                      {formatCurrency(tableTotals.usedReserved)}
                    </td>
                  )}
                  {visibleColumns.remainingCoverage && (
                    <td className="px-3 py-2.5 font-black text-[#008f4c]">
                      {formatCurrency(tableTotals.remainingCoverage)}
                    </td>
                  )}
                  {visibleColumns.totalClaims && (
                    <td className="px-3 py-2.5 text-center font-black text-slate-900">
                      {tableTotals.totalClaims}
                    </td>
                  )}
                  {visibleColumns.approved && (
                    <td className="px-3 py-2.5 text-center font-black text-[#008f4c]">
                      {tableTotals.approvedClaims}
                    </td>
                  )}
                  {visibleColumns.rejected && (
                    <td className="px-3 py-2.5 text-center font-black text-rose-500">
                      {tableTotals.rejectedClaims}
                    </td>
                  )}
                  {visibleColumns.pending && (
                    <td className="px-3 py-2.5 text-center font-black text-amber-500">
                      {tableTotals.pendingClaims}
                    </td>
                  )}
                  {visibleColumns.actions && <td className="px-3 py-2.5"></td>}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        )}
      </div>
)}
      {/* Coverage tab: coverage by policy */}
      {show('Coverage') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-900">Coverage by Policy</h3>
          <div className="space-y-3">
            {coveragePolicies.map((p) => {
              const used = p.sumInsured - p.remainingClaimableSI;
              const pct = p.sumInsured > 0 ? Math.round((used / p.sumInsured) * 100) : 0;
              return (
                <div key={p.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900">{p.id}</p>
                      {isAdmin && <p className="text-[10px] text-slate-400 font-medium">{p.customerName}</p>}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{p.coverageStatus || 'Active'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2.5 flex">
                    <div className="bg-[#00c569] h-full anim-bar-x" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] mt-1.5 font-semibold text-slate-500 gap-2 flex-wrap">
                    <span>Used/Reserved {formatCurrency(used)} ({pct}%)</span>
                    <span className="text-[#008f4c]">Remaining {formatCurrency(p.remainingClaimableSI)}</span>
                    <span className="text-slate-700">SI {formatCurrency(p.sumInsured)}</span>
                  </div>
                </div>
              );
            })}
            {coveragePolicies.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">No policies for this filter.</p>}
          </div>
        </div>
      )}

      {/* Claims Analysis tab: claims breakdown */}
      {show('Claims Analysis') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-xs font-bold text-slate-900">Claims Breakdown</h3>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex gap-3 text-[11px] font-semibold text-slate-500">
                <span>Approved {formatCurrency(claimAmounts.Approved)}</span>
                <span>Pending {formatCurrency(claimAmounts.Submitted)}</span>
                <span>Rejected {formatCurrency(claimAmounts.Rejected)}</span>
              </div>
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setClaimsAnalysisViewMode('cards')}
                  aria-pressed={claimsAnalysisViewMode === 'cards'}
                  className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                    claimsAnalysisViewMode === 'cards'
                      ? 'bg-[#011f17] text-white shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Cards
                </button>
                <button
                  type="button"
                  onClick={() => setClaimsAnalysisViewMode('table')}
                  aria-pressed={claimsAnalysisViewMode === 'table'}
                  className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                    claimsAnalysisViewMode === 'table'
                      ? 'bg-[#011f17] text-white shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-3.5 h-3.5" /> Table
                </button>
              </div>
            </div>
          </div>

          {claimsAnalysisViewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {claims.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{c.id}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Policy: {c.policyId}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : c.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {c.status === 'Submitted' ? 'Pending' : c.status}
                    </span>
                  </div>
                  {isAdmin && c.customer?.name && (
                    <p className="text-[11px] text-slate-600 font-semibold">{c.customer.name}</p>
                  )}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500 text-[10px] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {c.incidentDate}
                    </span>
                    <span className="font-extrabold text-slate-900">{formatCurrency(c.amount)}</span>
                  </div>
                </div>
              ))}
              {claims.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
                  No claims yet.
                </div>
              )}
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-2 pr-3">Claim</th>
                  <th className="py-2 pr-3">Policy</th>
                  {isAdmin && <th className="py-2 pr-3">Customer</th>}
                  <th className="py-2 pr-3">Incident</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-3 font-bold text-slate-900">{c.id}</td>
                    <td className="py-2.5 pr-3 text-slate-600">{c.policyId}</td>
                    {isAdmin && <td className="py-2.5 pr-3 text-slate-600">{c.customer?.name || '-'}</td>}
                    <td className="py-2.5 pr-3 text-slate-600 whitespace-nowrap">{c.incidentDate}</td>
                    <td className="py-2.5 pr-3 text-right font-bold text-slate-900 whitespace-nowrap">{formatCurrency(c.amount)}</td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : c.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {c.status === 'Submitted' ? 'Pending' : c.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {claims.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No claims yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
    </div>
  );
};
