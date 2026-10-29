import React from 'react';
import { User } from '../types';
import {
  Shield,
  LayoutDashboard,
  FileText,
  FileCheck2,
  LogOut,
  CheckCircle,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react';

export type ActiveView = 'dashboard' | 'policies' | 'claims';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  setActiveView,
  onLogout,
  onQuickSwitch,
  pendingClaimsCount = 0,
  policiesCount = 0,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isAdmin = user.role === 'Administrator';

  const demoAccounts = [
    { username: 'customer1', label: 'Customer 1', short: 'C1', role: 'Customer' },
    { username: 'customer2', label: 'Customer 2', short: 'C2', role: 'Customer' },
    { username: 'admin', label: 'Administrator', short: 'AD', role: 'Admin' },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const handleDemoSwitch = (username: string) => {
    onQuickSwitch(username);
    if (onCloseMobile) onCloseMobile();
  };

  // Shared content for navigation & profiles
  const renderSidebarContent = (isMobileMode = false) => {
    const collapsed = isMobileMode ? false : isCollapsed;

    return (
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-emerald-900/50">
        {/* Navigation Section */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400/60 mb-2">
              Navigation
            </p>
          )}
          <nav className="space-y-1.5">
            {/* Dashboard */}
            <button
              onClick={() => handleNavClick('dashboard')}
              title={collapsed ? 'Dashboard' : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5'
              } rounded-xl text-xs font-semibold transition-all ${
                activeView === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20'
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#093327]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Dashboard</span>}
              </div>
            </button>

            {/* Policies */}
            <button
              onClick={() => handleNavClick('policies')}
              title={collapsed ? `Policies (${policiesCount})` : undefined}
              className={`w-full flex items-center relative ${
                collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5'
              } rounded-xl text-xs font-semibold transition-all ${
                activeView === 'policies'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20'
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#093327]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Policies</span>}
              </div>
              {!collapsed ? (
                policiesCount > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeView === 'policies'
                        ? 'bg-slate-950 text-emerald-300'
                        : 'bg-[#093327] text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {policiesCount}
                  </span>
                )
              ) : (
                policiesCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald-400" />
                )
              )}
            </button>

            {/* Claims */}
            <button
              onClick={() => handleNavClick('claims')}
              title={collapsed ? `Claims (${pendingClaimsCount} pending)` : undefined}
              className={`w-full flex items-center relative ${
                collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5'
              } rounded-xl text-xs font-semibold transition-all ${
                activeView === 'claims'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20'
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#093327]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Claims</span>}
              </div>
              {!collapsed ? (
                pendingClaimsCount > 0 && (
                  <span
                    title={`${pendingClaimsCount} pending claims requiring review`}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono shadow-xs"
                  >
                    {pendingClaimsCount} pending
                  </span>
                )
              ) : (
                pendingClaimsCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )
              )}
            </button>
          </nav>
        </div>

        {/* Demo Switcher Section */}
        <div>
          {!collapsed ? (
            <>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400/60 mb-2">
                Switch Demo User
              </p>
              <div className="space-y-1.5">
                {demoAccounts.map((account) => {
                  const isActive = user.username === account.username;
                  return (
                    <button
                      key={account.username}
                      onClick={() => handleDemoSwitch(account.username)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/40 shadow-xs'
                          : 'text-emerald-200/70 hover:bg-[#093327] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-[#093327] text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {account.short}
                        </span>
                        <span className="truncate">{account.label}</span>
                      </div>
                      {isActive && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2 border-t border-[#0d3b2e]/80">
              {demoAccounts.map((account) => {
                const isActive = user.username === account.username;
                return (
                  <button
                    key={account.username}
                    onClick={() => handleDemoSwitch(account.username)}
                    title={`Switch to ${account.label} (${account.role})`}
                    className={`w-full h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative ${
                      isActive
                        ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/50 shadow-xs'
                        : 'text-emerald-200/70 hover:bg-[#093327] hover:text-white'
                    }`}
                  >
                    <span>{account.short}</span>
                    {isActive && (
                      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFooter = (isMobileMode = false) => {
    const collapsed = isMobileMode ? false : isCollapsed;

    return (
      <div className="p-3 border-t border-[#0d3b2e] bg-[#051e17]">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-[#093327] border border-[#0f4435] flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center text-xs font-bold shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-emerald-300/80 font-medium truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-emerald-300/70 hover:text-rose-400 hover:bg-rose-950/50 transition-colors shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center text-xs font-bold"
              title={`${user.name} (${user.role})`}
            >
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-emerald-300/70 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        className={`hidden md:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-[#06241b] text-white border-r border-[#0d3b2e] flex-col shrink-0 h-screen sticky top-0 select-none z-20 transition-all duration-300 ease-in-out`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#0d3b2e] bg-[#051e17]">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-950/40 shrink-0">
                  <Shield className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold text-sm tracking-tight text-white block truncate">
                    TailVaR
                  </span>
                  <span className="text-[11px] text-emerald-300/80 font-medium block truncate">
                    Claims & Policy Manager
                  </span>
                </div>
              </div>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-lg text-emerald-300/70 hover:text-white hover:bg-[#093327] transition-colors shrink-0"
                  title="Collapse Sidebar"
                  aria-label="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-1">
              <button
                onClick={onToggleCollapse}
                className="w-10 h-10 rounded-xl bg-[#093327] hover:bg-[#0d4233] border border-emerald-500/20 flex items-center justify-center text-emerald-300 hover:text-white transition-all shadow-xs group"
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <PanelLeft className="w-5 h-5 group-hover:scale-105 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Body */}
        {renderSidebarContent(false)}

        {/* User Card at Bottom */}
        {renderFooter(false)}
      </aside>

      {/* Mobile Slide-out Drawer (shown when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-[#06241b] text-white flex flex-col h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-[#0d3b2e] bg-[#051e17]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-950/40 shrink-0">
                  <Shield className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <span className="font-extrabold text-sm tracking-tight text-white block">
                    TailVaR
                  </span>
                  <span className="text-[11px] text-emerald-300/80 font-medium block">
                    Insurance App
                  </span>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-emerald-300/70 hover:text-white hover:bg-[#093327] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            {renderSidebarContent(true)}

            {/* Footer */}
            {renderFooter(true)}
          </div>
        </div>
      )}
    </>
  );
};
