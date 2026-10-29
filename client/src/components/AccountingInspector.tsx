import React from 'react';
import { Policy, Claim } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { ShieldCheck, ArrowRight, CheckCircle2, Clock, XCircle, Info, Sparkles } from 'lucide-react';

interface AccountingInspectorProps {
  selectedPolicy: Policy | null;
  policies: Policy[];
  onSelectPolicy: (policy: Policy) => void;
}

export const AccountingInspector: React.FC<AccountingInspectorProps> = ({
  selectedPolicy,
  policies,
  onSelectPolicy,
}) => {
  const policy = selectedPolicy || policies[0];

  if (!policy) {
    return (
      <Card className="rounded-3xl border-slate-200/80 bg-white p-6 text-center">
        <p className="text-xs text-slate-500">No policy selected.</p>
      </Card>
    );
  }

  const consumedPercentage = Math.min(
    100,
    Math.round(((policy.sumInsured - policy.remainingClaimableSI) / policy.sumInsured) * 100)
  );

  return (
    <Card className="rounded-3xl border-slate-200/80 bg-white overflow-hidden shadow-2xs">
      <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900">
                Live Policy Ledger & Rules Check
              </CardTitle>
              <CardDescription className="text-[11px]">
                Real-time SI tracking for {policy.id}
              </CardDescription>
            </div>
          </div>
          <Badge variant="teal" className="text-[10px]">
            ACID Transactional
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Policy Selector Pills */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Select Policy to Inspect
          </label>
          <div className="flex flex-wrap gap-1.5">
            {policies.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPolicy(p)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition-all ${
                  p.id === policy.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Coverage Dates & Customer */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Owner</span>
            <span className="font-bold text-slate-800">
              {policy.customerName || policy.customerUsername || 'Customer'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Coverage</span>
            <span className="font-bold text-slate-800">
              {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
            </span>
          </div>
        </div>

        {/* Visual Balance Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-500">Sum Insured (SI)</span>
            <span className="text-base font-black text-slate-900">
              {formatCurrency(policy.sumInsured)}
            </span>
          </div>

          {/* Utilization Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/80">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  consumedPercentage > 85
                    ? 'bg-rose-500'
                    : consumedPercentage > 45
                    ? 'bg-amber-500'
                    : 'bg-teal-500'
                }`}
                style={{ width: `${consumedPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>{consumedPercentage}% blocked / consumed</span>
              <span>{(100 - consumedPercentage).toFixed(0)}% available</span>
            </div>
          </div>

          {/* Detailed ledger balances */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between text-amber-700 bg-amber-50/60 p-2 rounded-xl">
              <span className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5" /> Submitted Claims (Blocking):
              </span>
              <span className="font-mono font-bold">
                - {formatCurrency(policy.submittedTotal || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/60 p-2 rounded-xl">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved Claims (Consumed):
              </span>
              <span className="font-mono font-bold">
                - {formatCurrency(policy.approvedTotal || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500 bg-slate-50 p-2 rounded-xl">
              <span className="flex items-center gap-1.5 font-semibold">
                <XCircle className="w-3.5 h-3.5 text-slate-400" /> Rejected Claims (Released):
              </span>
              <span className="font-mono font-bold text-slate-700">
                + {formatCurrency(policy.rejectedTotal || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-900 mt-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 block">
                  Remaining Claimable SI
                </span>
                <span className="text-xl font-black text-teal-800">
                  {formatCurrency(policy.remainingClaimableSI)}
                </span>
              </div>
              <Badge variant="teal" className="text-xs font-bold px-2.5 py-1">
                {policy.remainingClaimableSI > 0 ? 'Active Coverage' : 'Exhausted'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Illustrative Spec Rule Reminder (Section 1.6) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Specification Rule Verification</span>
          </div>
          <p className="leading-relaxed">
            When a claim is <strong>Submitted</strong>, SI is blocked immediately. If <strong>Approved</strong>, it stays consumed. If <strong>Rejected</strong>, its blocked amount is instantly restored so the customer can claim it again.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
