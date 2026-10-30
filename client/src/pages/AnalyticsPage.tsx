import React, { useState, useMemo } from 'react';
import { Policy, Claim, CustomerUser, User } from '../types';
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
  policies = [],
  claims = [],
  customers = [],
  onOpenPolicies,
  onOpenClaims,
}) => {
  const isAdmin = user?.role === 'Administrator';

  // Preset selector: matches the user's reference screenshot default 'H2 2026 (Jul - Dec)'
  const [datePreset, setDatePreset] = useState<string>('H2 2026 (Jul - Dec)');
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
              {['H2 2026 (Jul - Dec)', 'H1 2026 (Jan - Jun)', 'FY 2026 (Full Year)', 'Live Database Data'].map(
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

      {/* 5. Row 3: Three Visualizations (Claims by Outcome, Customer Wise Distribution, Monthly Claim Trend) - Space-Efficient */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Chart 1: Claims by Outcome Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
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

        {/* Chart 3: Monthly Claim Trend Area/Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900 mb-2">Monthly Claim Trend</h3>

          <div className="relative pt-2 pb-1 flex-1 flex flex-col justify-end">
            {/* Y-axis Ticks & Gridlines */}
            <div className="absolute inset-x-0 inset-y-2 flex flex-col justify-between pointer-events-none">
              {[4, 3, 2, 1, 0].map((val) => (
                <div key={val} className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-medium w-3 text-right">
                    {val}
                  </span>
                  <div className="flex-1 border-b border-dashed border-slate-100" />
                </div>
              ))}
            </div>

            {/* SVG Spline Curve with Gradient Area Fill */}
            <div className="relative z-10 pl-5 pr-2 h-22 flex flex-col justify-between">
              <svg className="w-full h-18 overflow-visible" viewBox="0 0 280 70">
                <defs>
                  <linearGradient id="claimTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ba63" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00ba63" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area Fill */}
                <path
                  d="M 15,50 C 35,42 45,38 65,38 C 90,38 95,50 115,50 C 140,50 145,16 165,16 C 190,16 195,38 215,38 C 240,38 245,50 265,50 L 265,70 L 15,70 Z"
                  fill="url(#claimTrendGradient)"
                />

                {/* Line Path */}
                <path
                  d="M 15,50 C 35,42 45,38 65,38 C 90,38 95,50 115,50 C 140,50 145,16 165,16 C 190,16 195,38 215,38 C 240,42 245,50 265,50"
                  fill="none"
                  stroke="#00ba63"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  pathLength={1}
                  className="anim-line"
                />

                {/* Data Points */}
                {[
                  { cx: 15, cy: 50, val: 1 },
                  { cx: 65, cy: 38, val: 2 },
                  { cx: 115, cy: 50, val: 1 },
                  { cx: 165, cy: 16, val: 3, isPeak: true },
                  { cx: 215, cy: 38, val: 2 },
                  { cx: 265, cy: 50, val: 1 },
                ].map((pt, i) => (
                  <g key={i} className="group cursor-pointer anim-pop" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${0.4 + i * 0.15}s` }}>
                    {pt.isPeak && (
                      <circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r="6"
                        fill="#00ba63"
                        opacity="0.25"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r="3.5"
                      fill="#00ba63"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                ))}
              </svg>

              {/* Month Labels below chart */}
              <div className="flex justify-between text-[9px] font-semibold text-slate-500 pt-0.5 px-1">
                {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Row 4: Customer Wise Summary Table (Compact Space-Efficient View) */}
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

          <div className="flex items-center gap-2.5">
            {/* Live Search Input */}
            <div className="relative w-52 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAdmin ? 'Search customers...' : 'Search policies...'}
                className="w-full pl-8 pr-3 py-1 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#00ba63] focus:bg-white transition-all"
              />
            </div>

            {/* Column Toggling Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-7.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
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
          </div>
        </div>

        {/* Scrollable Customer Table with Rounded Corners */}
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
      </div>
    </div>
  );
};
