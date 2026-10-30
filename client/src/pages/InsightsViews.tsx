import React from 'react';
import { Policy, Claim, CustomerUser, User } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Download, FileText, FileCheck2, Users, ShieldCheck, Clock, XCircle, CheckCircle2 } from 'lucide-react';

/** Escapes a value for a CSV cell. */
const csvCell = (value: unknown) => {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const downloadCsv = (filename: string, header: string[], rows: unknown[][]) => {
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

interface BaseProps {
  user: User;
  policies: Policy[];
  claims: Claim[];
}

/* ------------------------------ Customers ------------------------------ */

export const CustomersView: React.FC<BaseProps & { customers: CustomerUser[]; onOpenPolicies: (q: string) => void }> = ({
  policies,
  claims,
  customers,
  onOpenPolicies,
}) => (
  <div className="space-y-4">
    <div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customers</h1>
      <p className="text-xs text-slate-500 font-medium mt-0.5">
        {customers.length} customers &bull; coverage and claims per customer
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {customers.map((c) => {
        const own = policies.filter((p) => p.customerId === c.id);
        const ownClaims = claims.filter((cl) => cl.customer?.id === c.id);
        const totalSI = own.reduce((a, p) => a + p.sumInsured, 0);
        const remaining = own.reduce((a, p) => a + p.remainingClaimableSI, 0);
        const pending = ownClaims.filter((cl) => cl.status === 'Submitted').length;
        return (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                {c.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{c.name}</p>
                <p className="text-xs text-slate-400">@{c.username}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Policies</dt>
                <dd className="mt-1 font-extrabold text-slate-900">{own.length}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Claims</dt>
                <dd className="mt-1 font-extrabold text-slate-900">
                  {ownClaims.length}
                  {pending > 0 && <span className="ml-1 text-amber-600">({pending} pending)</span>}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sum insured</dt>
                <dd className="mt-1 font-extrabold text-slate-900">{formatCurrency(totalSI)}</dd>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Remaining</dt>
                <dd className="mt-1 font-extrabold text-[#008f4c]">{formatCurrency(remaining)}</dd>
              </div>
            </dl>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onOpenPolicies(c.username)}
              className="w-full"
            >
              View policies
            </Button>
          </div>
        );
      })}
      {customers.length === 0 && (
        <p className="text-xs text-slate-400 font-medium py-10 col-span-full text-center">No customers found.</p>
      )}
    </div>
  </div>
);

/* ------------------------------ Analytics ------------------------------ */

const Bar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
  <div>
    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
      <span>{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
    </div>
  </div>
);

export const AnalyticsView: React.FC<BaseProps> = ({ policies, claims }) => {
  const totalSI = policies.reduce((a, p) => a + p.sumInsured, 0);
  const remaining = policies.reduce((a, p) => a + p.remainingClaimableSI, 0);
  const used = totalSI - remaining;
  const usedPct = totalSI > 0 ? Math.round((used / totalSI) * 100) : 0;

  const count = (s: Claim['status']) => claims.filter((c) => c.status === s).length;
  const amount = (s: Claim['status']) => claims.filter((c) => c.status === s).reduce((a, c) => a + c.amount, 0);
  const maxClaims = Math.max(1, count('Submitted'), count('Approved'), count('Rejected'));

  const active = policies.filter((p) => p.coverageStatus === 'Active').length;
  const expired = policies.filter((p) => p.coverageStatus === 'Expired').length;
  const upcoming = policies.filter((p) => p.coverageStatus === 'Upcoming').length;
  const maxPol = Math.max(1, active, expired, upcoming);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Coverage utilisation and claim outcomes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00ba63]" /> Coverage utilisation
          </h2>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
            <div className="bg-emerald-300 h-full" style={{ width: `${usedPct}%` }} />
            <div className="bg-[#00ba63] h-full" style={{ width: `${100 - usedPct}%` }} />
          </div>
          <dl className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <dt className="text-slate-400 font-bold uppercase text-[10px]">Total SI</dt>
              <dd className="font-extrabold text-slate-900 mt-1">{formatCurrency(totalSI)}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-bold uppercase text-[10px]">Reserved + used</dt>
              <dd className="font-extrabold text-slate-900 mt-1">
                {formatCurrency(used)} <span className="text-slate-400">({usedPct}%)</span>
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-bold uppercase text-[10px]">Remaining</dt>
              <dd className="font-extrabold text-[#008f4c] mt-1">{formatCurrency(remaining)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00ba63]" /> Policies by status
          </h2>
          <Bar label="Active" value={active} max={maxPol} color="bg-[#00ba63]" />
          <Bar label="Upcoming" value={upcoming} max={maxPol} color="bg-indigo-400" />
          <Bar label="Expired" value={expired} max={maxPol} color="bg-slate-300" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#00ba63]" /> Claims by outcome
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(
              [
                ['Submitted', Clock, 'bg-amber-400', 'text-amber-600'],
                ['Approved', CheckCircle2, 'bg-[#00ba63]', 'text-[#00ba63]'],
                ['Rejected', XCircle, 'bg-rose-400', 'text-rose-600'],
              ] as const
            ).map(([status, Icon, bar, text]) => (
              <div key={status} className="rounded-xl bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${text}`}>
                    <Icon className="w-3.5 h-3.5" /> {status}
                  </span>
                  <Badge variant="outline">{count(status)}</Badge>
                </div>
                <Bar label="Claims" value={count(status)} max={maxClaims} color={bar} />
                <p className="text-xs text-slate-500 font-medium">
                  Total value <span className="font-extrabold text-slate-900">{formatCurrency(amount(status))}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------- Reports ------------------------------- */

export const ReportsView: React.FC<BaseProps> = ({ user, policies, claims }) => {
  const isAdmin = user.role === 'Administrator';
  const stamp = new Date().toISOString().slice(0, 10);

  const exportPolicies = () =>
    downloadCsv(
      `policies-${stamp}.csv`,
      ['Policy ID', 'Customer', 'Start Date', 'End Date', 'Status', 'Sum Insured', 'Remaining Claimable'],
      policies.map((p) => [
        p.id,
        p.customerName || p.customerUsername || '',
        p.startDate,
        p.endDate,
        p.coverageStatus || '',
        p.sumInsured,
        p.remainingClaimableSI,
      ])
    );

  const exportClaims = () =>
    downloadCsv(
      `claims-${stamp}.csv`,
      ['Claim ID', 'Policy ID', 'Customer', 'Incident Date', 'Amount', 'Status'],
      claims.map((c) => [c.id, c.policyId, c.customer?.name || '', c.incidentDate, c.amount, c.status])
    );

  const cards = [
    {
      title: 'Policies report',
      desc: `${policies.length} ${isAdmin ? 'policies across all customers' : 'of your policies'} with coverage dates, status and remaining sum insured.`,
      icon: FileText,
      onClick: exportPolicies,
      disabled: policies.length === 0,
    },
    {
      title: 'Claims report',
      desc: `${claims.length} ${isAdmin ? 'claims across all customers' : 'of your claims'} with incident date, amount and status.`,
      icon: FileCheck2,
      onClick: exportClaims,
      disabled: claims.length === 0,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Download your data as CSV (opens in Excel / Sheets)</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <div key={c.title} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5 text-[#00ba63]" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{c.title}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">{c.desc}</p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={c.disabled}
              onClick={c.onClick}
              className="bg-[#011f17] hover:bg-[#072d22] self-start gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Users };
