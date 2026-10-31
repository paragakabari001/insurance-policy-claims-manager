import React from 'react';
import { Policy, Claim, CustomerUser, User } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Download, FileText, FileCheck2, Users, ShieldCheck, Clock, XCircle, CheckCircle2, Printer } from 'lucide-react';

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

export { CustomersPage as CustomersView } from './CustomersPage';

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

  const printOfficialStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TailVaR Insurance Statement - ${user.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 36px; color: #0f172a; margin: 0; }
            .header { border-bottom: 2px solid #00ba63; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 22px; font-weight: 800; color: #011f17; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 2px; }
            .meta { font-size: 11px; color: #475569; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 24px; font-size: 11px; }
            th { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; font-weight: 700; color: #334155; }
            td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
            .section-title { font-size: 13px; font-weight: 700; color: #011f17; margin-top: 20px; margin-bottom: 6px; }
            .badge { display: inline-block; padding: 2px 7px; border-radius: 9999px; font-size: 10px; font-weight: 600; }
            .badge-green { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
            .badge-amber { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
            .badge-red { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">TailVaR Insurance & Claims</div>
              <div class="subtitle">Official Statement & Coverage Summary</div>
            </div>
            <div class="meta">
              <div><strong>Account:</strong> ${user.name} (${user.role})</div>
              <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
            </div>
          </div>

          <div class="section-title">1. Insurance Policies</div>
          <table>
            <thead>
              <tr>
                <th>Policy ID</th>
                <th>Coverage Period</th>
                <th>Status</th>
                <th>Original Sum Insured</th>
                <th>Remaining Available SI</th>
              </tr>
            </thead>
            <tbody>
              ${policies.map(p => `
                <tr>
                  <td><strong>${p.id}</strong></td>
                  <td>${p.startDate} &rarr; ${p.endDate}</td>
                  <td><span class="badge badge-green">${p.coverageStatus || 'Active'}</span></td>
                  <td>₹${p.sumInsured.toLocaleString('en-IN')}</td>
                  <td><strong style="color: #008f4c;">₹${p.remainingClaimableSI.toLocaleString('en-IN')}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">2. Filed Claims History</div>
          <table>
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Policy ID</th>
                <th>Incident Date</th>
                <th>Claimed Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${claims.length > 0 ? claims.map(c => `
                <tr>
                  <td><strong>${c.id}</strong></td>
                  <td>${c.policyId}</td>
                  <td>${c.incidentDate}</td>
                  <td>₹${c.amount.toLocaleString('en-IN')}</td>
                  <td><span class="badge ${c.status === 'Approved' ? 'badge-green' : c.status === 'Rejected' ? 'badge-red' : 'badge-amber'}">${c.status}</span></td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align:center; color: #94a3b8;">No claims recorded yet.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            TailVaR Insurance Policy & Claims Management System &bull; Generated for Evaluation
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  };

  const cards = [
    {
      title: 'Policies report',
      desc: `${policies.length} ${isAdmin ? 'policies across all customers' : 'of your policies'} with coverage dates, status and remaining sum insured.`,
      icon: FileText,
      btnText: 'Download CSV',
      btnIcon: Download,
      onClick: exportPolicies,
      disabled: policies.length === 0,
    },
    {
      title: 'Claims report',
      desc: `${claims.length} ${isAdmin ? 'claims across all customers' : 'of your claims'} with incident date, amount and status.`,
      icon: FileCheck2,
      btnText: 'Download CSV',
      btnIcon: Download,
      onClick: exportClaims,
      disabled: claims.length === 0,
    },
    {
      title: 'Official Statement (PDF / Print)',
      desc: `Generate a formatted official account summary of policies, active claims, and coverage balances.`,
      icon: Printer,
      btnText: 'Print / Save PDF',
      btnIcon: Printer,
      onClick: printOfficialStatement,
      disabled: policies.length === 0 && claims.length === 0,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Download your data as CSV (opens in Excel / Sheets)</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.title} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5 text-[#00ba63]" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{c.title}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{c.desc}</p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={c.disabled}
              onClick={c.onClick}
              className="bg-[#011f17] hover:bg-[#072d22] self-start gap-1.5 font-bold"
            >
              <c.btnIcon className="w-3.5 h-3.5 text-[#00ba63]" /> {c.btnText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Users };
