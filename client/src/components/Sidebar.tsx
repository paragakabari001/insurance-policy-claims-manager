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

export type ActiveView = 'dashboard' | 'policies' | 'claims' | 'analytics' | 'reports';

interface SidebarProps {
  user: User;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout: () => void;
  onQuickSwitch?: (username: string) => void;
  pendingClaimsCount?: number;
  policiesCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
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
  pendingClaimsCount = 0,
  policiesCount = 0,
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid, view: 'dashboard', highlightable: true },
    { key: 'policies', label: 'Policies', icon: FileText, view: 'policies', highlightable: true, badge: policiesCount, badgeTone: 'green' },
    { key: 'claims', label: 'Claims', icon: FileCheck2, view: 'claims', highlightable: true, badge: pendingClaimsCount, badgeTone: 'amber' },
    { key: 'analytics', label: 'Analytics', icon: TrendingUp, view: 'analytics', highlightable: true },
    { key: 'reports', label: 'Reports', icon: FileSpreadsheet, view: 'reports', highlightable: true },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const renderSidebarContent = (collapsed: boolean) => (
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pt-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {!collapsed && (
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300/40">Menu</p>
      )}
      <nav className="space-y-1" aria-label="Primary">
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
              className={`group relative w-full flex items-center ${
                collapsed ? 'justify-center px-0' : 'justify-between pl-2 pr-3'
              } py-1.5 rounded-xl text-[13px] border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
                isActive
                  ? 'bg-[#e9fbf1] border-white/70 text-[#063a28] font-bold shadow-[0_6px_16px_-6px_rgba(0,0,0,0.45)]'
                  : 'border-transparent text-emerald-50/65 font-medium hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00ba63] text-white shadow-sm'
                      : 'bg-white/[0.05] text-emerald-200/75 group-hover:bg-white/10 group-hover:text-emerald-100'
                  }`}
                >
                  <Icon className="w-[15px] h-[15px]" strokeWidth={isActive ? 2.4 : 2} />
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                    item.badgeTone === 'amber'
                      ? 'bg-amber-400 text-slate-950'
                      : isActive
                      ? 'bg-[#00ba63] text-white'
                      : 'bg-emerald-400/15 text-emerald-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`absolute top-1.5 right-3 w-2 h-2 rounded-full ring-2 ring-[#03251b] ${
                    item.badgeTone === 'amber' ? 'bg-amber-400' : 'bg-[#00ba63]'
                  }`}
                />
              )}
            </a>
          );
        })}
      </nav>
    </div>
  );

  const renderFooter = (collapsed: boolean) => (
    <div className="p-3 shrink-0">
      {!collapsed && (
        <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-center">
          <p className="text-[11px] font-bold text-white/90 leading-tight">TailVaR Insurance</p>
          <p className="text-[9px] text-emerald-300/60 font-medium leading-tight mt-0.5">Policy & Claims Manager</p>
        </div>
      )}
    </div>
  );

  const brand = (collapsed: boolean) => (
    <div className={`h-16 flex items-center shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2bec8f] to-[#00ba63] flex items-center justify-center shrink-0 shadow-[0_6px_18px_-4px_rgba(0,197,105,0.6)]">
          <Shield className="w-5 h-5 fill-current text-[#011f17]" />
        </div>
        {!collapsed && (
          <div className="truncate">
            <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">TailVaR</h1>
            <p className="text-[10px] text-emerald-300/70 font-medium tracking-wide leading-tight">
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
        className={`hidden md:flex flex-col bg-gradient-to-b from-[#06382a] via-[#032a1f] to-[#021b14] border-r border-emerald-400/10 text-white transition-[width] duration-300 ease-in-out shrink-0 select-none z-20 h-screen rounded-r-[28px] overflow-hidden ${
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
          <div className="relative w-72 max-w-[82vw] bg-gradient-to-b from-[#06382a] via-[#032a1f] to-[#021b14] text-white flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200 rounded-r-[28px] overflow-hidden">
            <div className="flex items-center justify-between pr-3">
              {brand(false)}
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="p-1.5 rounded-lg text-emerald-300/70 hover:text-white hover:bg-white/10 cursor-pointer"
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
