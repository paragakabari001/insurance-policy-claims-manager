import React from 'react';
import { User } from '../types';
import {
  Shield,
  LayoutGrid,
  FileText,
  FileCheck2,
  Users,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Headphones,
  ArrowRight,
  X,
  type LucideIcon,
} from 'lucide-react';

export type ActiveView = 'dashboard' | 'policies' | 'claims' | 'customers' | 'analytics' | 'reports';

interface SidebarProps {
  user: User;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout: () => void;
  onQuickSwitch: (username: string) => void;
  pendingClaimsCount?: number;
  policiesCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenAI?: () => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  view: ActiveView;
  highlightable: boolean;
  badge?: number;
  badgeTone?: 'green' | 'amber';
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  setActiveView,
  onQuickSwitch,
  pendingClaimsCount = 0,
  policiesCount = 0,
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  onOpenAI,
}) => {
  const demoAccounts = [
    { username: 'customer1', label: 'Customer 1', short: 'C1', role: 'Customer' },
    { username: 'customer2', label: 'Customer 2', short: 'C2', role: 'Customer' },
    { username: 'admin', label: 'Administrator', short: 'AD', role: 'Admin' },
  ];

  const navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid, view: 'dashboard', highlightable: true },
    { key: 'policies', label: 'Policies', icon: FileText, view: 'policies', highlightable: true, badge: policiesCount, badgeTone: 'green' },
    { key: 'claims', label: 'Claims', icon: FileCheck2, view: 'claims', highlightable: true, badge: pendingClaimsCount, badgeTone: 'amber' },
    { key: 'customers', label: 'Customers', icon: Users, view: 'customers', highlightable: true },
    { key: 'analytics', label: 'Analytics', icon: TrendingUp, view: 'analytics', highlightable: true },
    { key: 'reports', label: 'Reports', icon: FileSpreadsheet, view: 'reports', highlightable: true },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const handleDemoSwitch = (username: string) => {
    onQuickSwitch(username);
    if (onCloseMobile) onCloseMobile();
  };

  const renderSidebarContent = (collapsed: boolean) => (
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-emerald-900/50">
      <nav className="space-y-1.5" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.highlightable && activeView === item.view;
          const href = item.view === 'dashboard' ? '/dashboard' : `/${item.view}`;
          return (
            <a
              key={item.key}
              href={href}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  handleNavClick(item.view);
                }
              }}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={`relative w-full flex items-center ${
                collapsed ? 'justify-center px-0' : 'justify-between px-3.5'
              } py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                isActive
                  ? 'bg-[#00ba63] text-white font-bold shadow-md shadow-[#00ba63]/25'
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#042d20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </div>
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`min-w-6 h-6 px-1.5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    item.badgeTone === 'amber'
                      ? 'bg-amber-400 text-slate-950'
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#032e22] text-[#00c569]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`absolute top-1.5 right-2.5 w-2 h-2 rounded-full ${
                    item.badgeTone === 'amber' ? 'bg-amber-400' : 'bg-[#00ba63] ring-1 ring-[#011f17]'
                  }`}
                />
              )}
            </a>
          );
        })}
      </nav>

      {/* Demo Switcher */}
      <div className="pt-1">
        {!collapsed && (
          <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-[#00ba63] mb-2.5">
            Switch Demo User
          </p>
        )}
        <div className={`space-y-2 ${collapsed ? 'pt-3 border-t border-[#053225]' : ''}`}>
          {demoAccounts.map((account) => {
            const isActive = user.username === account.username;
            return (
              <button
                key={account.username}
                type="button"
                onClick={() => handleDemoSwitch(account.username)}
                title={`Switch to ${account.label} (${account.role})`}
                className={`w-full ${
                  collapsed ? 'justify-center px-0' : 'justify-between px-3 text-left'
                } py-2.5 rounded-2xl text-xs font-medium flex items-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63] ${
                  isActive
                    ? 'bg-[#003b29] text-white font-bold border border-[#00ba63]/30 shadow-sm'
                    : 'bg-[#02271d]/50 text-slate-300 hover:bg-[#033225] hover:text-white border border-[#053225]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-[#00ba63] text-[#011f17]' : 'bg-[#053225] text-slate-300'
                    }`}
                  >
                    {account.short}
                  </span>
                  {!collapsed && <span className="truncate">{account.label}</span>}
                </div>
                {!collapsed && isActive && (
                  <CheckCircle2 className="w-4 h-4 text-[#00ba63] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderFooter = (collapsed: boolean) => (
    <div className="p-3 bg-[#011f17] shrink-0">
      {collapsed ? (
        <button
          type="button"
          onClick={onOpenAI}
          title="Need Help?"
          className="w-full h-11 rounded-2xl bg-[#022419] border border-[#053b2b] text-[#00ba63] hover:bg-[#043324] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63]"
        >
          <Headphones className="w-4 h-4" />
        </button>
      ) : (
        <div className="p-3 rounded-2xl bg-[#022419] border border-[#053b2b] flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#043324] flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4 text-[#00ba63]" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate leading-tight">Need Help?</p>
              <p className="text-[10px] text-emerald-300/70 truncate leading-tight mt-0.5">
                Get support or talk to AI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAI}
            className="w-7 h-7 rounded-full bg-[#043324] text-emerald-300 hover:text-[#011f17] hover:bg-[#00ba63] transition-colors flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ba63]"
            aria-label="Open AI Assistant"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  const brand = (collapsed: boolean) => (
    <div className={`h-16 flex items-center shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#00ba63] flex items-center justify-center shrink-0 shadow-sm">
          <Shield className="w-5 h-5 fill-current text-[#011f17]" />
        </div>
        {!collapsed && (
          <div className="truncate">
            <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">TailVaR</h1>
            <p className="text-[10px] text-emerald-400/80 font-medium tracking-wide leading-tight">
              Claims & Policy Manager
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar: collapsible via the hamburger in the top bar */}
      <aside
        className={`hidden md:flex flex-col bg-[#011f17] text-white transition-[width] duration-300 ease-in-out shrink-0 select-none z-20 h-screen rounded-r-[28px] overflow-hidden ${
          isCollapsed ? 'w-[76px]' : 'w-60 xl:w-64'
        }`}
      >
        {brand(isCollapsed)}
        {renderSidebarContent(isCollapsed)}
        {renderFooter(isCollapsed)}
      </aside>

      {/* Mobile slide-over drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[82vw] bg-[#011f17] text-white flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200 rounded-r-[28px] overflow-hidden">
            <div className="flex items-center justify-between pr-3">
              {brand(false)}
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="p-1.5 rounded-lg text-emerald-300/70 hover:text-white hover:bg-[#072d22] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarContent(false)}
            {renderFooter(false)}
          </div>
        </div>
      )}
    </>
  );
};
