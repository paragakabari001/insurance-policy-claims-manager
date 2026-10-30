import React, { useState } from 'react';
import { User } from '../types';
import {
  Shield,
  LayoutDashboard,
  FileText,
  FileCheck2,
  Users,
  BarChart3,
  FileSpreadsheet,
  CheckCircle,
  Headphones,
  ArrowRight,
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

  const renderSidebarContent = (isMobileMode = false) => {
    const collapsed = isMobileMode ? false : isCollapsed;

    return (
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-emerald-900/50">
        {/* Navigation Section */}
        <div>
          <nav className="space-y-1.5">
            {/* Dashboard */}
            <button
              onClick={() => handleNavClick('dashboard')}
              title={collapsed ? 'Dashboard' : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-2.5'
              } rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-[#00c569] text-[#031d16] font-bold shadow-md shadow-[#00c569]/20'
                  : 'text-emerald-100/70 hover:text-white hover:bg-[#072d22]'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Dashboard</span>}
              </div>
            </button>

            {/* Policies */}
            <button
              onClick={() => handleNavClick('policies')}
              title={collapsed ? `Policies (${policiesCount})` : undefined}
              className={`w-full flex items-center relative ${
                collapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-2.5'
              } rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'policies'
                  ? 'bg-[#00c569] text-[#031d16] font-bold shadow-md shadow-[#00c569]/20'
                  : 'text-emerald-100/70 hover:text-white hover:bg-[#072d22]'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Policies</span>}
              </div>
              {!collapsed ? (
                policiesCount > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeView === 'policies'
                        ? 'bg-[#031d16]/30 text-[#031d16]'
                        : 'bg-[#083528] text-emerald-300'
                    }`}
                  >
                    {policiesCount}
                  </span>
                )
              ) : (
                policiesCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#00c569]" />
                )
              )}
            </button>

            {/* Claims */}
            <button
              onClick={() => handleNavClick('claims')}
              title={collapsed ? `Claims (${pendingClaimsCount} pending)` : undefined}
              className={`w-full flex items-center relative ${
                collapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-2.5'
              } rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'claims'
                  ? 'bg-[#00c569] text-[#031d16] font-bold shadow-md shadow-[#00c569]/20'
                  : 'text-emerald-100/70 hover:text-white hover:bg-[#072d22]'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Claims</span>}
              </div>
              {!collapsed ? (
                pendingClaimsCount > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeView === 'claims'
                        ? 'bg-[#031d16]/30 text-[#031d16]'
                        : 'bg-amber-400 text-slate-950 font-mono shadow-xs'
                    }`}
                  >
                    {pendingClaimsCount}
                  </span>
                )
              ) : (
                pendingClaimsCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-400" />
                )
              )}
            </button>

            {/* Customers (Figma Match) */}
            <button
              onClick={() => handleNavClick('policies')}
              title={collapsed ? 'Customers' : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-2.5'
              } rounded-2xl text-xs font-semibold transition-all text-emerald-100/70 hover:text-white hover:bg-[#072d22] cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Customers</span>}
              </div>
            </button>

            {/* Analytics (Figma Match) */}
            <button
              onClick={() => handleNavClick('dashboard')}
              title={collapsed ? 'Analytics' : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-2.5'
              } rounded-2xl text-xs font-semibold transition-all text-emerald-100/70 hover:text-white hover:bg-[#072d22] cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Analytics</span>}
              </div>
            </button>

            {/* Reports (Figma Match) */}
            <button
              onClick={() => handleNavClick('dashboard')}
              title={collapsed ? 'Reports' : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-2.5'
              } rounded-2xl text-xs font-semibold transition-all text-emerald-100/70 hover:text-white hover:bg-[#072d22] cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Reports</span>}
              </div>
            </button>
          </nav>
        </div>

        {/* Demo Switcher Section (Figma Match) */}
        <div className="pt-2">
          {!collapsed ? (
            <>
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400/50 mb-2">
                Switch Demo User
              </p>
              <div className="space-y-1.5">
                {demoAccounts.map((account) => {
                  const isActive = user.username === account.username;
                  return (
                    <button
                      key={account.username}
                      onClick={() => handleDemoSwitch(account.username)}
                      className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#00c569]/20 text-[#00c569] font-bold border border-[#00c569]/40'
                          : 'text-emerald-200/70 hover:bg-[#072d22] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-[#00c569] text-[#031d16]'
                              : 'bg-[#083528] text-emerald-300'
                          }`}
                        >
                          {account.short}
                        </span>
                        <span className="truncate">{account.label}</span>
                      </div>
                      {isActive && <CheckCircle className="w-3.5 h-3.5 text-[#00c569] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2 border-t border-[#093529]">
              {demoAccounts.map((account) => {
                const isActive = user.username === account.username;
                return (
                  <button
                    key={account.username}
                    onClick={() => handleDemoSwitch(account.username)}
                    title={`Switch to ${account.label} (${account.role})`}
                    className={`w-full h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative cursor-pointer ${
                      isActive
                        ? 'bg-[#00c569]/20 text-[#00c569] border border-[#00c569]/50'
                        : 'text-emerald-200/70 hover:bg-[#072d22] hover:text-white'
                    }`}
                  >
                    <span>{account.short}</span>
                    {isActive && (
                      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00c569]" />
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
      <div className="p-3 border-t border-[#093529] bg-[#021812]">
        {!collapsed ? (
          <div className="p-2.5 rounded-2xl bg-[#06241b] border border-[#0b4233] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#00c569]/20 text-[#00c569] border border-[#00c569]/30 flex items-center justify-center text-xs font-bold shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Need Help?</p>
                <p className="text-[10px] text-emerald-300/70 truncate">Get support or talk to AI</p>
              </div>
            </div>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="p-1.5 rounded-full bg-[#083528] text-emerald-300 hover:text-white hover:bg-[#00c569] hover:text-[#031d16] transition-colors shrink-0 cursor-pointer"
              title="Help"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleNavClick('dashboard')}
            className="w-full h-10 rounded-xl flex items-center justify-center text-emerald-300 hover:text-white hover:bg-[#072d22] cursor-pointer"
            title="Need Help?"
          >
            <Headphones className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#031d16] text-white border-r border-[#093529] transition-all duration-300 ease-in-out shrink-0 select-none z-20 ${
          isCollapsed ? 'w-16' : 'w-60 xl:w-64'
        }`}
      >
        {/* Brand Header with Single Toggle */}
        <div className="h-16 px-4 border-b border-[#093529] flex items-center justify-between shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#00c569]/20 border border-[#00c569]/30 flex items-center justify-center text-[#00c569] shrink-0">
                <Shield className="w-4 h-4 fill-current text-[#00c569]" />
              </div>
              <div className="truncate">
                <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  TailVaR
                </h1>
                <p className="text-[10px] text-emerald-400/80 font-medium tracking-wide">
                  Claims & Policy Manager
                </p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto w-8 h-8 rounded-xl bg-[#00c569]/20 border border-[#00c569]/30 flex items-center justify-center text-[#00c569]">
              <Shield className="w-4 h-4 fill-current text-[#00c569]" />
            </div>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-lg text-emerald-400/70 hover:text-white hover:bg-[#072d22] transition-colors cursor-pointer"
            >
              {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation & Profiles */}
        {renderSidebarContent(false)}

        {/* Footer */}
        {renderFooter(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#031d16] text-white flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200 border-r border-[#093529]">
            {/* Mobile Header */}
            <div className="h-16 px-4 border-b border-[#093529] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00c569]/20 border border-[#00c569]/30 flex items-center justify-center text-[#00c569]">
                  <Shield className="w-4 h-4 fill-current text-[#00c569]" />
                </div>
                <div>
                  <h1 className="font-extrabold text-sm text-white">TailVaR</h1>
                  <p className="text-[10px] text-emerald-400/80">Claims & Policy Manager</p>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-emerald-300/70 hover:text-white hover:bg-[#072d22]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderSidebarContent(true)}
            {renderFooter(true)}
          </div>
        </div>
      )}
    </>
  );
};
