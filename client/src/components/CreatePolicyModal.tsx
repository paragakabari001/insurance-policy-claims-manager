import React, { useState, useEffect } from 'react';
import { CustomerUser } from '../types';
import { Button } from './ui/button';
import {
  ShieldPlus,
  X,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface CreatePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerUser[];
  onSubmit: (data: {
    customerId: string;
    startDate: string;
    endDate: string;
    sumInsured: number;
    customId?: string;
  }) => Promise<void>;
}

export const CreatePolicyModal: React.FC<CreatePolicyModalProps> = ({
  isOpen,
  onClose,
  customers,
  onSubmit,
}) => {
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [sumInsured, setSumInsured] = useState<string>('1000000');
  const [customId, setCustomId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateAutoPolicyId = () => {
    return `POL-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  useEffect(() => {
    if (isOpen) {
      setCustomId(generateAutoPolicyId());
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!customerId && customers.length > 0) {
      setCustomerId(customers[0].id);
    }
  }, [customers, customerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError('Please select a customer.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Both coverage start date and end date are required.');
      return;
    }

    if (endDate < startDate) {
      setError('Coverage end date cannot be earlier than start date.');
      return;
    }

    const parsedSI = Number(sumInsured);
    if (isNaN(parsedSI) || parsedSI <= 0) {
      setError('Sum Insured must be a positive number greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        customerId,
        startDate,
        endDate,
        sumInsured: parsedSI,
        customId: customId.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create policy.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPresetSI = (amount: number) => {
    setSumInsured(amount.toString());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
              <ShieldPlus className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Create Policy
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Administrator
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Issue coverage policy for Customer 1 or Customer 2
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

          {/* Customer Selection (shadcn styled) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" /> Target Customer
            </label>
            <div className="relative">
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50/50 appearance-none transition-all shadow-2xs"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (@{c.username})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Dates Grid (shadcn styled) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs font-bold text-slate-900 bg-white shadow-2xs transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs font-bold text-slate-900 bg-white shadow-2xs transition-all"
                required
              />
            </div>
          </div>

          {/* Sum Insured */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Sum Insured (SI) in INR (₹)
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPresetSI(500000)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                >
                  ₹5L
                </button>
                <button
                  type="button"
                  onClick={() => setPresetSI(1000000)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                >
                  ₹10L
                </button>
                <button
                  type="button"
                  onClick={() => setPresetSI(2500000)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                >
                  ₹25L
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={sumInsured}
                onChange={(e) => setSumInsured(e.target.value)}
                placeholder="e.g. 1000000"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-bold text-slate-900 bg-white text-sm shadow-2xs"
                required
              />
            </div>
          </div>

          {/* Auto-generated Custom Policy ID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Policy ID <span className="text-emerald-700 font-normal lowercase">(auto-generated)</span>
              </label>
              <button
                type="button"
                onClick={() => setCustomId(generateAutoPolicyId())}
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                title="Generate new ID"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate ID
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="e.g. POL-1004"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs font-mono font-bold text-slate-900 bg-slate-50/50 shadow-2xs"
              />
              <span className="absolute right-3 text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto
              </span>
            </div>
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
              disabled={isSubmitting}
              size="sm"
              className="bg-[#06241b] hover:bg-[#083528] text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-950/20 px-5 gap-1.5"
            >
              {isSubmitting ? 'Creating Policy...' : 'Create Policy'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
