import { Policy, Claim } from '../types';

export interface PeriodRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

const norm = (s: string) => s.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();

const RANGES: Array<[string, PeriodRange | null]> = [
  ['Jan 1, 2026 - Dec 31, 2026', { start: '2026-01-01', end: '2026-12-31' }],
  ['FY 2026 (Full Year)', { start: '2026-01-01', end: '2026-12-31' }],
  ['Q1 2026 (Jan - Mar)', { start: '2026-01-01', end: '2026-03-31' }],
  ['Q2 2026 (Apr - Jun)', { start: '2026-04-01', end: '2026-06-30' }],
  ['Q3 2026 (Jul - Sep)', { start: '2026-07-01', end: '2026-09-30' }],
  ['Q4 2026 (Oct - Dec)', { start: '2026-10-01', end: '2026-12-31' }],
  ['H1 2026 (Jan - Jun)', { start: '2026-01-01', end: '2026-06-30' }],
  ['H2 2026 (Jul - Dec)', { start: '2026-07-01', end: '2026-12-31' }],
  ['All Time', null],
  ['Live Database Data', null],
];

export function getPeriodRange(label: string): PeriodRange | null {
  const hit = RANGES.find(([l]) => norm(l) === norm(label));
  return hit ? hit[1] : null;
}

/**
 * Policies whose coverage period overlaps the range, and claims whose incident date falls inside it.
 * A null range (All Time) returns everything.
 */
export function filterByPeriod(policies: Policy[], claims: Claim[], label: string) {
  const r = getPeriodRange(label);
  if (!r) return { policies, claims };
  return {
    policies: policies.filter((p) => p.startDate <= r.end && p.endDate >= r.start),
    claims: claims.filter((c) => c.incidentDate >= r.start && c.incidentDate <= r.end),
  };
}
