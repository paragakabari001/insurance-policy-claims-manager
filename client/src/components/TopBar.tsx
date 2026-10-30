import React, { useState, useEffect } from 'react';
import { User, Policy, Claim, CustomerUser } from '../types';
import { ActiveView } from './Sidebar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Search,
  Bell,
  Sparkles,
  Menu,
  ChevronDown,
  RefreshCw,
  LogOut,
  UserCheck,
  ShieldCheck,
  FileText,
  FileCheck2,
  Users,
  Check,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TopBarProps {
  user: User;
  activeView: ActiveView;
  setActiveView?: (view: ActiveView) => void;
  policies?: Policy[];
  claims?: Claim[];
  customers?: CustomerUser[];
  onOpenCreatePolicy?: () => void;
  onOpenSubmitClaim?: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  onOpenMobileMenu?: () => void;
  onQuickSwitch?: (username: string) => void;
  onLogout?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'claim' | 'policy' | 'system';
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  activeView,
  setActiveView,
  policies = [],
  claims = [],
  customers = [],
  onRefresh,
  isLoading = false,
  onOpenMobileMenu,
  onLogout,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Claim Submitted',
      desc: 'CLM-1005 for ₹25,000.00 is awaiting administrator decision.',
      time: '10m ago',
      read: false,
      type: 'claim',
    },
    {
      id: 'n2',
      title: 'Active Coverage',
      desc: 'Policy POL-1001 active through 31 Dec 2026.',
      time: '1h ago',
      read: false,
      type: 'policy',
    },
    {
      id: 'n3',
      title: 'Decision Recorded',
      desc: 'Claim CLM-1001 was approved for ₹2,50,000.00.',
      time: 'Yesterday',
      read: false,
      type: 'claim',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Keyboard shortcut: Command+K / Ctrl+K opens global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered items across policies, claims, and customers
  const q = searchQuery.trim().toLowerCase();
  const matchedPolicies = q
    ? policies.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          (p.customerName && p.customerName.toLowerCase().includes(q)) ||
          (p.customerUsername && p.customerUsername.toLowerCase().includes(q))
      ).slice(0, 4)
    : policies.slice(0, 3);

  const matchedClaims = q
    ? claims.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.policyId.toLowerCase().includes(q) ||
          (c.customer?.name && c.customer.name.toLowerCase().includes(q))
      ).slice(0, 4)
    : claims.slice(0, 3);

  const matchedCustomers = (user.role === 'Administrator' && q)
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q)
      ).slice(0, 4)
    : (user.role === 'Administrator' ? customers.slice(0, 3) : []);

  const handleSelectResult = (view: ActiveView) => {
    if (setActiveView) setActiveView(view);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs shrink-0">
        {/* Left: Mobile Menu & Functional Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md min-w-0">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63]"
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => setIsSearchOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsSearchOpen(true)}
            className="relative w-full hidden sm:flex items-center cursor-pointer group"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-emerald-600 transition-colors pointer-events-none" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              placeholder={
                user.role === 'Administrator'
                  ? 'Search policies, claims, customers...'
                  : 'Search your policies and claims...'
              }
              className="w-full pl-9 pr-14 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none group-hover:border-emerald-400 group-hover:bg-white transition-all cursor-pointer"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs group-hover:text-slate-700">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Right Controls: IST Badge, Notification Bell with Menu, User Avatar Menu, Refresh */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* IST Location Pill (Figma Match) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs text-slate-700 shadow-2xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#00c569] animate-pulse" />
            <span>IST (Asia/Kolkata)</span>
          </div>

          {/* Functional Notification Bell Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Notifications (${unreadCount} unread)`}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63]"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs transition-colors ${
                      n.read ? 'bg-white opacity-70' : 'bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 leading-tight">{n.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Account Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63]"
              >
                <div className="w-8 h-8 rounded-full bg-[#011f17] text-[#00ba63] font-bold text-xs flex items-center justify-center shrink-0">
                  {user.role === 'Administrator'
                    ? 'AD'
                    : user.username === 'customer1'
                    ? 'C1'
                    : 'C2'}
                </div>
                <div className="hidden sm:block text-left leading-tight pr-1">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{user.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5">
              <DropdownMenuLabel>
                <div className="truncate">
                  <p className="font-bold text-slate-900 text-xs">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-normal">@{user.username} &bull; {user.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {onLogout && (
                <DropdownMenuItem
                  onSelect={onLogout}
                  className="text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/80 transition-colors shadow-2xs disabled:opacity-50 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63]"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`}
            />
          </button>

          {/* Logout Button (top right) */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
              className="h-9 px-2.5 sm:px-3 rounded-xl text-rose-600 hover:text-white hover:bg-rose-500 border border-rose-200 bg-rose-50/60 transition-colors shadow-2xs shrink-0 flex items-center gap-1.5 text-xs font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* Global Command Palette / Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-3xl">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search policies, claims, customers..."
              className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {/* Policies Results */}
            {matchedPolicies.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-[#00ba63]" /> Policies
                </p>
                <div className="space-y-1">
                  {matchedPolicies.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectResult('policies')}
                      className="w-full p-2.5 rounded-xl hover:bg-emerald-50/60 flex items-center justify-between text-left text-xs transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block group-hover:text-emerald-800">
                          {p.id}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {p.customerName || p.customerUsername} &bull; Coverage {formatDate(p.startDate)} &rarr; {formatDate(p.endDate)}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-[#008f4c] block">
                          {formatCurrency(p.remainingClaimableSI)}
                        </span>
                        <Badge variant="outline" className="text-[9px]">
                          {p.coverageStatus || 'Active'}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Claims Results */}
            {matchedClaims.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                  <FileCheck2 className="w-3 h-3 text-[#00ba63]" /> Claims
                </p>
                <div className="space-y-1">
                  {matchedClaims.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectResult('claims')}
                      className="w-full p-2.5 rounded-xl hover:bg-emerald-50/60 flex items-center justify-between text-left text-xs transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block group-hover:text-emerald-800">
                          {c.id} (Policy {c.policyId})
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          Incident {formatDate(c.incidentDate)} {c.customer?.name ? `· ${c.customer.name}` : ''}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 block">
                          {formatCurrency(c.amount)}
                        </span>
                        <Badge
                          variant={
                            c.status === 'Approved'
                              ? 'success'
                              : c.status === 'Rejected'
                              ? 'destructive'
                              : 'warning'
                          }
                          className="text-[9px]"
                        >
                          {c.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customers Results */}
            {matchedCustomers.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#00ba63]" /> Customers
                </p>
                <div className="space-y-1">
                  {matchedCustomers.map((cu) => (
                    <button
                      key={cu.id}
                      type="button"
                      onClick={() => handleSelectResult('policies')}
                      className="w-full p-2.5 rounded-xl hover:bg-emerald-50/60 flex items-center justify-between text-left text-xs transition-colors cursor-pointer group"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block group-hover:text-emerald-800">
                          {cu.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block">@{cu.username}</span>
                      </div>
                      <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {matchedPolicies.length === 0 && matchedClaims.length === 0 && matchedCustomers.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No results found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
