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

export { AnalyticsPage as AnalyticsView } from './AnalyticsPage';

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
