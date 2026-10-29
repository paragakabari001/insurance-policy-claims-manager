import React, { useState, useEffect } from 'react';
import { Policy } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FilePlus, X, Calendar, DollarSign, ShieldAlert, AlertTriangle } from 'lucide-react';

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

  // Sync selected policy
  useEffect(() => {
    if (preselectedPolicyId) {
      setSelectedPolicyId(preselectedPolicyId);
    } else if (!selectedPolicyId && policies.length > 0) {
      setSelectedPolicyId(policies[0].id);
    }
  }, [preselectedPolicyId, policies, selectedPolicyId]);

  const activePolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0];

  // Set default incident date to policy start date if outside
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
      setError('Claim amount must be greater than 0.');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/50 border border-indigo-400/30 flex items-center justify-center">
              <FilePlus className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">File an Insurance Claim</h3>
              <p className="text-xs text-indigo-200">Customer Claim Submission</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Policy */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> Linked Policy
            </label>
            <select
              value={selectedPolicyId}
              onChange={(e) => setSelectedPolicyId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 bg-slate-50 focus:bg-white"
              required
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} | Available SI: {formatCurrency(p.remainingClaimableSI)} (SI: {formatCurrency(p.sumInsured)})
                </option>
              ))}
            </select>
          </div>

          {/* Policy Information Pill */}
          {activePolicy && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-indigo-800">Coverage Window:</span>
                <span className="font-bold">
                  {formatDate(activePolicy.startDate)} to {formatDate(activePolicy.endDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-indigo-800">Remaining Claimable SI:</span>
                <span className="font-extrabold text-indigo-700 text-sm">
                  {formatCurrency(activePolicy.remainingClaimableSI)}
                </span>
              </div>
            </div>
          )}

          {/* Incident Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Incident Date (Calendar Date)
            </label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              min={activePolicy?.startDate}
              max={activePolicy?.endDate}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 bg-slate-50 focus:bg-white"
              required
            />
            {activePolicy && (
              <p className="text-[11px] text-slate-500 mt-1">
                Must fall between {formatDate(activePolicy.startDate)} and {formatDate(activePolicy.endDate)} (inclusive).
              </p>
            )}
          </div>

          {/* Claim Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600" /> Claim Amount in INR (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
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
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 font-bold text-slate-900 bg-slate-50 focus:bg-white ${
                  isAmountExceeded
                    ? 'border-rose-400 focus:ring-rose-500 text-rose-700'
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
                required
              />
            </div>

            {/* Dynamic SI remaining feedback */}
            {parsedAmount > 0 && (
              <div className="mt-2 text-xs flex justify-between font-medium">
                <span className="text-slate-500">Remaining SI after this submission:</span>
                <span
                  className={`font-bold ${
                    isAmountExceeded ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {isAmountExceeded
                    ? `Exceeds available SI by ${formatCurrency(parsedAmount - remainingSI)}`
                    : formatCurrency(remainingSI - parsedAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Custom Claim ID (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Custom Claim ID <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="e.g. CLM-2026-X1 (Leave blank to auto-generate)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono text-slate-800 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isAmountExceeded}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isSubmitting ? 'Submitting Claim...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
