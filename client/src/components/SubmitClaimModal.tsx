import React, { useState, useEffect } from 'react';
import { Policy } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  FilePlus,
  X,
  Calendar,
  DollarSign,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface SubmitClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: Policy[];
  preselectedPolicyId?: string;
  onSubmit: (data: {
    policyId: string;
    incidentDate: string;
    amount: number;
    customId?: string;
  }) => Promise<void>;
}

export const SubmitClaimModal: React.FC<SubmitClaimModalProps> = ({
  isOpen,
  onClose,
  policies,
  preselectedPolicyId,
  onSubmit,
}) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(
    preselectedPolicyId || policies[0]?.id || ''
  );
  const [incidentDate, setIncidentDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [customId, setCustomId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedPolicyId) {
      setSelectedPolicyId(preselectedPolicyId);
    } else if (!selectedPolicyId && policies.length > 0) {
      setSelectedPolicyId(policies[0].id);
    }
  }, [preselectedPolicyId, policies, selectedPolicyId]);

  const activePolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0];

  useEffect(() => {
    if (activePolicy) {
      if (!incidentDate || incidentDate < activePolicy.startDate || incidentDate > activePolicy.endDate) {
        setIncidentDate(activePolicy.startDate);
      }
    }
  }, [activePolicy]);

  if (!isOpen) return null;

  const parsedAmount = Number(amount) || 0;
  const remainingSI = activePolicy ? activePolicy.remainingClaimableSI : 0;
  const isAmountExceeded = parsedAmount > remainingSI;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activePolicy) {
      setError('Please select an active policy.');
      return;
    }

    if (!incidentDate) {
      setError('Incident date is required.');
      return;
    }

    if (incidentDate < activePolicy.startDate || incidentDate > activePolicy.endDate) {
      setError(
        `Incident date must fall within coverage period (${formatDate(activePolicy.startDate)} to ${formatDate(activePolicy.endDate)}).`
      );
      return;
    }

    if (parsedAmount <= 0) {
      setError('Claim amount must be greater than ₹0.');
      return;
    }

    if (parsedAmount > remainingSI) {
      setError(
        `Claim amount (${formatCurrency(parsedAmount)}) exceeds remaining claimable SI (${formatCurrency(remainingSI)}).`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        policyId: activePolicy.id,
        incidentDate,
        amount: parsedAmount,
        customId: customId.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150">
        {/* Clean Pure White Header (shadcn style) */}
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
              <FilePlus className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  File an Insurance Claim
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Customer Action
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Instant real-time Sum Insured verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Linked Policy Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" /> Linked Coverage Policy
            </label>
            <select
              value={selectedPolicyId}
              onChange={(e) => setSelectedPolicyId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-bold text-slate-800 bg-slate-50/70 focus:bg-white transition-all shadow-2xs"
              required
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} &bull; Available: {formatCurrency(p.remainingClaimableSI)} (SI: {formatCurrency(p.sumInsured)})
                </option>
              ))}
            </select>
          </div>

          {/* Policy Information Card */}
          {activePolicy && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500">Coverage Duration:</span>
                <span className="font-bold text-slate-900">
                  {formatDate(activePolicy.startDate)} &rarr; {formatDate(activePolicy.endDate)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                <span className="font-semibold text-slate-500">Remaining Claimable SI:</span>
                <span className="font-black text-emerald-800 text-sm">
                  {formatCurrency(activePolicy.remainingClaimableSI)}
                </span>
              </div>
            </div>
          )}

          {/* Incident Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Incident Date (Calendar Date)
            </label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              min={activePolicy?.startDate}
              max={activePolicy?.endDate}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-medium text-slate-800 bg-white focus:bg-white transition-all shadow-2xs"
              required
            />
            {activePolicy && (
              <p className="text-[11px] text-slate-500 mt-1">
                Must fall within coverage: <strong>{formatDate(activePolicy.startDate)}</strong> to <strong>{formatDate(activePolicy.endDate)}</strong> (inclusive).
              </p>
            )}
          </div>

          {/* Claim Amount Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Claim Amount (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                max={remainingSI}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 600000"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 font-bold text-slate-900 bg-white text-sm shadow-2xs transition-all ${
                  isAmountExceeded
                    ? 'border-rose-400 focus:ring-rose-500 text-rose-700'
                    : 'border-slate-200 focus:ring-emerald-600'
                }`}
                required
              />
            </div>

            {/* Dynamic Real-Time SI Calculation Preview */}
            {parsedAmount > 0 && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Projected Remaining SI:</span>
                  <span
                    className={`font-black ${
                      isAmountExceeded ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {isAmountExceeded
                      ? `Exceeds limit by ${formatCurrency(parsedAmount - remainingSI)}`
                      : formatCurrency(remainingSI - parsedAmount)}
                  </span>
                </div>
                {!isAmountExceeded && (
                  <p className="text-[10px] text-slate-500">
                    &bull; This amount will be blocked immediately upon submission.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Optional Custom Claim ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Custom Claim ID <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="e.g. CLM-CUSTOM-01 (Auto-generated if blank)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-mono text-slate-800 bg-white shadow-2xs"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isAmountExceeded}
              size="sm"
              className="bg-[#06241b] hover:bg-[#083528] text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-950/20 px-5 gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
