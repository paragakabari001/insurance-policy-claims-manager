import { Policy, Claim } from '@prisma/client';

export type CoverageStatus = 'Upcoming' | 'Active' | 'Expired';

export type PolicyWithClaims = Policy & {
  claims?: Claim[];
  customer?: { id: string; name: string; username: string };
};

export const APPLICATION_TIMEZONE = 'Asia/Kolkata'; // Indian Standard Time (IST)

export function getTodayCalendarDate(): string {
  // Calendar date YYYY-MM-DD in the application timezone
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APPLICATION_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function isValidDateFormat(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isDateWithinRange(targetDate: string, startDate: string, endDate: string): boolean {
  // ISO YYYY-MM-DD calendar dates compared lexicographically
  return targetDate >= startDate && targetDate <= endDate;
}

export function getCoverageStatus(startDate: string, endDate: string, referenceDate = getTodayCalendarDate()): CoverageStatus {
  if (referenceDate < startDate) {
    return 'Upcoming';
  }
  if (referenceDate > endDate) {
    return 'Expired';
  }
  return 'Active';
}

export function calculatePolicyBalances(policy: PolicyWithClaims) {
  const claims = policy.claims || [];

  let submittedTotal = 0;
  let approvedTotal = 0;
  let rejectedTotal = 0;

  for (const claim of claims) {
    if (claim.status === 'Submitted') {
      submittedTotal += claim.amount;
    } else if (claim.status === 'Approved') {
      approvedTotal += claim.amount;
    } else if (claim.status === 'Rejected') {
      rejectedTotal += claim.amount;
    }
  }

  // Submitted claims reserve SI immediately.
  // Approved claims continue consuming SI.
  // Rejected claims release their reserved amount.
  const totalReservedAndUsed = Math.round((submittedTotal + approvedTotal) * 100) / 100;
  const remainingClaimableSI = Math.max(0, Math.round((policy.sumInsured - totalReservedAndUsed) * 100) / 100);

  return {
    submittedTotal: Math.round(submittedTotal * 100) / 100,
    approvedTotal: Math.round(approvedTotal * 100) / 100,
    rejectedTotal: Math.round(rejectedTotal * 100) / 100,
    totalReservedAndUsed,
    remainingClaimableSI,
  };
}
