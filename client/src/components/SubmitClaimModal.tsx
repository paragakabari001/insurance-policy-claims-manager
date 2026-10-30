import React, { useState, useEffect } from 'react';
import { Policy } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from './ui/button';
import { DatePicker } from './ui/date-picker';
import {
  FilePlus,
  X,
  Calendar,
  DollarSign,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  ShieldAlert,
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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

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
  const isDateOutOfRange =
    activePolicy && incidentDate
      ? incidentDate < activePolicy.startDate || incidentDate > activePolicy.endDate
      : false;
  const dynamicPlaceholder = remainingSI > 0 ? `e.g. ${Math.min(50000, remainingSI)}` : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activePolicy) {
      setError('Please select a valid policy.');
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
        `Claim amount (${formatCurrency(parsedAmount)}) exceeds remaining coverage (${formatCurrency(remainingSI)}).`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        policyId: activePolicy.id,
        incidentDate,
        amount: parsedAmount,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-t-[28px] sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col transform transition-all animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Mobile Grab Handle Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 sm:py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
              <FilePlus className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Submit Claim
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Customer
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Coverage and balance verification
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

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="relative">
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50/50 appearance-none transition-all shadow-2xs"
                  required
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} • Available: {formatCurrency(p.remainingClaimableSI)} (SI: {formatCurrency(p.sumInsured)})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Policy Information Card: Coverage Dates & Remaining Claimable Amount */}
            {activePolicy && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Coverage Duration:</span>
                  <span className="font-bold text-slate-900">
                    {formatDate(activePolicy.startDate)} &rarr; {formatDate(activePolicy.endDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                  <span className="font-semibold text-slate-500">Remaining Coverage:</span>
                  <span className="font-black text-emerald-800 text-sm">
                    {formatCurrency(activePolicy.remainingClaimableSI)}
                  </span>
                </div>
              </div>
            )}

            {/* Incident Date Picker (shadcn Popover Calendar with boundary checking) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Incident Date (Calendar Date)
                </label>
                {activePolicy && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    Must be between {activePolicy.startDate} and {activePolicy.endDate}
                  </span>
                )}
              </div>
              <DatePicker
                value={incidentDate}
                onChange={setIncidentDate}
                minDate={activePolicy?.startDate}
                maxDate={activePolicy?.endDate}
                placeholder="Select incident calendar date"
                side="top"
              />
              {isDateOutOfRange && (
                <p className="text-xs text-rose-600 font-semibold mt-1">
                  Incident date must fall within policy coverage: {formatDate(activePolicy.startDate)} to {formatDate(activePolicy.endDate)} (inclusive).
                </p>
              )}
              {activePolicy && !isDateOutOfRange && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Must fall within coverage: <strong>{formatDate(activePolicy.startDate)}</strong> to <strong>{formatDate(activePolicy.endDate)}</strong> (inclusive).
                </p>
              )}
            </div>

            {/* Claim Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Claim Amount (INR ₹)
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  Maximum claim amount: {formatCurrency(remainingSI)}
                </span>
              </div>
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
                  placeholder={dynamicPlaceholder}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 font-bold text-slate-900 bg-white text-sm shadow-2xs transition-all ${
                    isAmountExceeded
                      ? 'border-rose-400 focus:ring-rose-500 text-rose-700'
                      : 'border-slate-200 focus:ring-emerald-600 focus:border-emerald-600'
                  }`}
                  required
                />
              </div>

              {/* Field-level validation messages */}
              {isAmountExceeded && (
                <p className="text-xs text-rose-600 font-semibold mt-1">
                  Claim amount exceeds maximum claimable coverage of {formatCurrency(remainingSI)}.
                </p>
              )}
              {amount !== '' && parsedAmount <= 0 && (
                <p className="text-xs text-rose-600 font-semibold mt-1">
                  Claim amount must be greater than ₹0.
                </p>
              )}

              {/* Dynamic Real-Time SI Calculation Preview */}
              {parsedAmount > 0 && !isAmountExceeded && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Projected Remaining Coverage:</span>
                    <span className="font-black text-emerald-700">
                      {formatCurrency(remainingSI - parsedAmount)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    &bull; This amount will be reserved immediately upon submission.
                  </p>
                </div>
              )}
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
                disabled={isSubmitting || isAmountExceeded || parsedAmount <= 0 || !incidentDate || isDateOutOfRange}
                size="sm"
                className="bg-[#06241b] hover:bg-[#083528] text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-950/20 px-5 gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Claim...' : 'Submit Claim'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
