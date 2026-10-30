import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface DatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
  minDate?: string; // 'YYYY-MM-DD'
  maxDate?: string; // 'YYYY-MM-DD'
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Pick a date',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial year & month from value or fallback to current
  const parseYearMonth = (dateStr?: string) => {
    if (dateStr && dateStr.includes('-')) {
      const [y, m] = dateStr.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) return { year: y, month: m - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  };

  const [viewDate, setViewDate] = useState(() => parseYearMonth(value || minDate));

  // Sync viewDate when value changes
  useEffect(() => {
    if (value) {
      setViewDate(parseYearMonth(value));
    }
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  // Build calendar matrix
  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewDate.year, viewDate.month, 1).getDay(); // 0 = Sun

  const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const mStr = String(viewDate.month + 1).padStart(2, '0');
    const dStr = String(i).padStart(2, '0');
    days.push({
      day: i,
      dateStr: `${viewDate.year}-${mStr}-${dStr}`,
      isCurrentMonth: true,
    });
  }

  const isDateDisabled = (dateStr: string) => {
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const handleSelect = (dateStr: string) => {
    if (isDateDisabled(dateStr) || disabled) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Format today's date in local YYYY-MM-DD
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button (shadcn Popover Trigger) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-10 px-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all shadow-2xs ${
          isOpen
            ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-white'
            : 'border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-emerald-700 shrink-0" />
          {value ? (
            <span className="text-slate-900 font-bold truncate">
              {formatDate(value)}
            </span>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Calendar Dropdown (shadcn Popover Content) */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3.5 w-[280px] sm:w-[310px] animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header with Quick Month/Year Dropdown & Chevrons */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <select
                value={viewDate.month}
                onChange={(e) => setViewDate((prev) => ({ ...prev, month: Number(e.target.value) }))}
                className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-600 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {monthNames.map((name, i) => (
                  <option key={name} value={i}>{name}</option>
                ))}
              </select>
              <select
                value={viewDate.year}
                onChange={(e) => setViewDate((prev) => ({ ...prev, year: Number(e.target.value) }))}
                className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-600 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {Array.from({ length: 15 }, (_, i) => 2020 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((wd) => (
              <span key={wd} className="text-[10px] font-bold text-slate-400 uppercase py-1">
                {wd}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank leading slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="w-8 h-8" />
            ))}

            {/* Days in Month */}
            {days.map(({ day, dateStr }) => {
              const isSelected = value === dateStr;
              const isToday = todayStr === dateStr;
              const disabledDay = isDateDisabled(dateStr);

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelect(dateStr)}
                  className={`w-8 h-8 mx-auto rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#06241b] text-white shadow-xs font-bold'
                      : isToday
                      ? 'border border-emerald-500 text-emerald-800 font-bold bg-emerald-50/50'
                      : disabledDay
                      ? 'text-slate-300 opacity-40 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Popover Footer: Clear / Today + Boundary info */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
            {(minDate || maxDate) && (
              <span className="text-[10px] text-slate-400 font-medium">
                {minDate || 'Past'} &rarr; {maxDate || 'Future'}
              </span>
            )}
            <button
              type="button"
              disabled={isDateDisabled(todayStr)}
              onClick={() => {
                if (!isDateDisabled(todayStr)) {
                  handleSelect(todayStr);
                }
              }}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
