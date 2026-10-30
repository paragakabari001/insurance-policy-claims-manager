import React, { useMemo, useState } from 'react';
import { Policy, Claim, CustomerUser, User } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Search,
  List,
  LayoutGrid,
  FileText,
  FileCheck2,
  Layers,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Activity,
  Users,
  ChevronDown,
} from 'lucide-react';

interface CustomersPageProps {
  user: User;
  policies: Policy[];
  claims: Claim[];
  customers: CustomerUser[];
  onOpenPolicies: (q: string) => void;
}

type Filter = 'all' | 'active' | 'inactive';
type SortKey = 'name-asc' | 'name-desc' | 'policies' | 'sum';
type Metric = 'policies' | 'claims' | 'sum';

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const AVATAR_TONES = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
];

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return `${date} • ${time}`;
};

export const CustomersPage: React.FC<CustomersPageProps> = ({ policies, claims, customers, onOpenPolicies }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('name-asc');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const [metric, setMetric] = useState<Metric>('policies');

  const portfolioSI = policies.reduce((a, p) => a + p.sumInsured, 0);

  const rows = useMemo(
    () =>
      customers.map((c, idx) => {
        const own = policies.filter((p) => p.customerId === c.id);
        const ownClaims = claims.filter((cl) => cl.customer?.id === c.id);
        const totalSI = own.reduce((a, p) => a + p.sumInsured, 0);
        const remaining = own.reduce((a, p) => a + p.remainingClaimableSI, 0);
        const active = own.filter((p) => p.coverageStatus === 'Active').length;
        const expired = own.filter((p) => p.coverageStatus === 'Expired').length;
        const upcoming = own.filter((p) => p.coverageStatus === 'Upcoming').length;
        return {
          c,
          tone: AVATAR_TONES[idx % AVATAR_TONES.length],
          own,
          ownClaims,
          totalSI,
          remaining,
          active,
          expired,
          upcoming,
          approved: ownClaims.filter((x) => x.status === 'Approved').length,
          rejected: ownClaims.filter((x) => x.status === 'Rejected').length,
          pending: ownClaims.filter((x) => x.status === 'Submitted').length,
          siPct: portfolioSI > 0 ? Math.round((totalSI / portfolioSI) * 100) : 0,
          availPct: totalSI > 0 ? Math.round((remaining / totalSI) * 100) : 0,
          isActive: active > 0,
        };
      }),
    [customers, policies, claims, portfolioSI]
  );

  const counts = {
    all: rows.length,
    active: rows.filter((r) => r.isActive).length,
    inactive: rows.filter((r) => !r.isActive).length,
  };

  const visible = rows
    .filter((r) => (filter === 'all' ? true : filter === 'active' ? r.isActive : !r.isActive))
    .filter((r) => {
      const q = query.trim().toLowerCase();
      return !q || r.c.name.toLowerCase().includes(q) || r.c.username.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === 'name-asc') return a.c.name.localeCompare(b.c.name);
      if (sort === 'name-desc') return b.c.name.localeCompare(a.c.name);
      if (sort === 'policies') return b.own.length - a.own.length;
      return b.totalSI - a.totalSI;
    });

  // Distribution chart data
  const chart = rows.map((r) => ({
    name: r.c.name,
    value: metric === 'policies' ? r.own.length : metric === 'claims' ? r.ownClaims.length : r.totalSI,
  }));
  const maxVal = Math.max(1, ...chart.map((d) => d.value));
  const fmtVal = (v: number) => (metric === 'sum' ? `₹${(v / 100000).toFixed(v >= 1000000 ? 0 : 1)}L` : String(v));

  // Recent activity feed derived from real policy & claim records
  const activity = useMemo(() => {
    const items: { id: string; ts: string; text: string; tag: 'Policy' | 'Claim'; tone: string }[] = [];
    policies.forEach((p) =>
      items.push({
        id: `p-${p.id}`,
        ts: p.createdAt,
        text: `${p.customerName || 'Customer'} - Policy ${p.id} created`,
        tag: 'Policy',
        tone: 'blue',
      })
    );
    claims.forEach((cl) => {
      const who = cl.customer?.name || 'Customer';
      items.push({
        id: `c-${cl.id}`,
        ts: cl.status === 'Submitted' ? cl.createdAt : cl.updatedAt,
        text: `${who} - Claim ${cl.id} ${cl.status === 'Submitted' ? 'submitted' : cl.status.toLowerCase()}`,
        tag: 'Claim',
        tone: cl.status === 'Rejected' ? 'rose' : 'green',
      });
    });
    return items.sort((a, b) => +new Date(b.ts) - +new Date(a.ts)).slice(0, 5);
  }, [policies, claims]);

  const toneIcon: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  const Bar = ({ pct }: { pct: number }) => (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mt-1">
      <div className="h-full rounded-full bg-gradient-to-r from-[#00ba63] to-[#00d474] anim-bar-x" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );

  const Stat = ({ icon: Icon, label, value, sub, bar }: { icon: any; label: string; value: React.ReactNode; sub?: string; bar?: number }) => (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
        <Icon className="w-3.5 h-3.5 text-slate-400" /> {label}
      </div>
      <div className="text-lg font-black text-slate-900 leading-tight mt-0.5 truncate">{value}</div>
      {bar !== undefined && <Bar pct={bar} />}
      {sub && <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customers</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage your customers, view their policies, claims and coverage details.
        </p>
      </div>

      {/* Toolbar: filters, search, sort, layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {([
            ['all', 'All Customers', counts.all],
            ['active', 'Active', counts.active],
            ['inactive', 'Inactive', counts.inactive],
          ] as const).map(([key, label, n]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`shrink-0 h-9 px-4 rounded-xl text-xs font-bold border cursor-pointer ${
                filter === key
                  ? 'bg-[#031d16] text-white border-[#031d16] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label} ({n})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-64 lg:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00ba63]/30 focus:border-[#00ba63]"
            />
          </div>
          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort customers"
              className="appearance-none h-9 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00ba63]/30 cursor-pointer"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="policies">Most policies</option>
              <option value="sum">Highest sum insured</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 shrink-0">
            {([['list', List], ['grid', LayoutGrid]] as const).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                aria-label={`${key} view`}
                onClick={() => setLayout(key)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${
                  layout === key ? 'bg-[#031d16] text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customer list */}
      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4' : 'space-y-3 sm:space-y-4'}>
        {visible.map((r) => (
          <div
            key={r.c.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-emerald-200 transition-all"
          >
            <div className={`flex flex-col ${layout === 'list' ? 'xl:flex-row xl:items-center' : ''} gap-4 xl:gap-5`}>
              {/* Identity */}
              <div className={`flex items-start gap-3 min-w-0 ${layout === 'list' ? 'xl:w-60 xl:shrink-0' : ''}`}>
                <span className={`w-11 h-11 rounded-full ${r.tone} font-black text-sm flex items-center justify-center shrink-0`}>
                  {initials(r.c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-900 truncate">{r.c.name}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">@{r.c.username}</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" /> Joined {formatDate(r.c.createdAt?.slice(0, 10))}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 min-w-0 ${
                  layout === 'list' ? 'xl:border-l xl:border-slate-100 xl:pl-5' : 'pt-4 border-t border-slate-100'
                }`}
              >
                <Stat
                  icon={FileText}
                  label="Policies"
                  value={r.own.length}
                  sub={`${r.active} active • ${r.expired} expired${r.upcoming ? ` • ${r.upcoming} upcoming` : ''}`}
                />
                <Stat
                  icon={FileCheck2}
                  label="Claims"
                  value={r.ownClaims.length}
                  sub={`${r.approved} approved • ${r.rejected} rejected${r.pending ? ` • ${r.pending} pending` : ''}`}
                />
                <Stat icon={Layers} label="Sum Insured" value={formatCurrency(r.totalSI)} bar={r.siPct} sub={`${r.siPct}% of total`} />
                <Stat icon={ShieldCheck} label="Remaining" value={formatCurrency(r.remaining)} bar={r.availPct} sub={`${r.availPct}% available`} />
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => onOpenPolicies(r.c.username)}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 shrink-0 cursor-pointer group"
              >
                View Details
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 text-center col-span-full">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">No customers match your filters.</p>
          </div>
        )}
      </div>

      {/* Distribution + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00ba63] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Customer Distribution</h3>
                <p className="text-[11px] text-slate-400 font-medium">Policies, claims and coverage across all customers.</p>
              </div>
            </div>
            <div className="relative shrink-0">
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as Metric)}
                aria-label="Chart metric"
                className="appearance-none h-8 pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="policies">Policies</option>
                <option value="claims">Claims</option>
                <option value="sum">Sum Insured</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div key={metric} className="mt-5 h-44 flex items-end justify-around gap-4 border-b border-slate-100 px-2">
            {chart.map((d, i) => (
              <div key={d.name} className="flex flex-col items-center justify-end h-full w-16 sm:w-24 gap-1">
                <span className="text-[11px] font-black text-slate-800">{fmtVal(d.value)}</span>
                <div
                  className={`w-full max-w-14 rounded-t-lg anim-bar-y ${i % 2 === 0 ? 'bg-[#00ba63]' : 'bg-emerald-300'}`}
                  style={{ height: `${Math.max(4, (d.value / maxVal) * 78)}%`, animationDelay: `${i * 0.1}s` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-around gap-4 px-2 pt-2">
            {chart.map((d) => (
              <span key={d.name} className="w-16 sm:w-24 text-center text-[10px] font-semibold text-slate-500 truncate">
                {d.name}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00ba63] flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Recent Activity</h3>
              <p className="text-[11px] text-slate-400 font-medium">Latest customer related activities.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${toneIcon[a.tone]}`}>
                  {a.tag === 'Policy' ? <FileText className="w-4 h-4" /> : <FileCheck2 className="w-4 h-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{a.text}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{fmtDateTime(a.ts)}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    a.tag === 'Policy' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {a.tag}
                </span>
              </li>
            ))}
            {activity.length === 0 && <li className="text-xs text-slate-400 py-4 text-center">No recent activity.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};
