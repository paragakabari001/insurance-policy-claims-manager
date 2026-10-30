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
  policiesCount = 4,
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
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
    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-emerald-900/50">
        {/* Navigation Section */}
        <div>
          <nav className="space-y-1.5">
            {/* Dashboard */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-[#00ba63] text-white font-bold shadow-md shadow-[#00ba63]/25'
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#042d20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Policies */}
            <button
              onClick={() => handleNavClick('policies')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'policies'
                  ? 'bg-[#00ba63] text-white font-bold shadow-md shadow-[#00ba63]/25'
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#042d20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Policies</span>
              </div>
              <span
                className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${
                  activeView === 'policies'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#032e22] text-[#00c569]'
                }`}
              >
                {policiesCount > 0 ? policiesCount : 4}
              </span>
            </button>

            {/* Claims */}
            <button
              onClick={() => handleNavClick('claims')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'claims'
                  ? 'bg-[#00ba63] text-white font-bold shadow-md shadow-[#00ba63]/25'
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#042d20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-4 h-4 shrink-0" />
                <span>Claims</span>
              </div>
              {pendingClaimsCount > 0 && (
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center shrink-0">
                  {pendingClaimsCount}
                </span>
              )}
            </button>

            {/* Customers (Figma Match) */}
            <button
              onClick={() => handleNavClick('policies')}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all text-emerald-100/80 hover:text-white hover:bg-[#042d20] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0" />
                <span>Customers</span>
              </div>
            </button>

            {/* Analytics (Figma Match) */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all text-emerald-100/80 hover:text-white hover:bg-[#042d20] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>Analytics</span>
              </div>
            </button>

            {/* Reports (Figma Match) */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all text-emerald-100/80 hover:text-white hover:bg-[#042d20] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Reports</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Demo Switcher Section (Figma Match) */}
        <div className="pt-2">
          <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-[#00ba63] mb-2.5">
            Switch Demo User
          </p>
          <div className="space-y-2">
            {demoAccounts.map((account) => {
              const isActive = user.username === account.username;
              return (
                <button
                  key={account.username}
                  onClick={() => handleDemoSwitch(account.username)}
                  className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#003b29] text-white font-bold border border-[#00ba63]/30 shadow-sm'
                      : 'bg-[#02271d]/50 text-slate-300 hover:bg-[#033225] hover:text-white border border-[#053225]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-[#00ba63] text-[#011f17]'
                          : 'bg-[#053225] text-slate-300'
                      }`}
                    >
                      {account.short}
                    </span>
                    <span className="truncate">{account.label}</span>
                  </div>
                  {isActive && (
                    <div className="w-4 h-4 rounded-full bg-[#00ba63] flex items-center justify-center text-[#011f17] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className="p-3.5 bg-[#011f17] shrink-0">
        <div className="p-3 rounded-2xl bg-[#022419] border border-[#053b2b] flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#043324] text-[#00ba63] flex items-center justify-center shrink-0">
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
            onClick={() => handleNavClick('dashboard')}
            className="w-7 h-7 rounded-full bg-[#043324] text-emerald-300 hover:text-[#011f17] hover:bg-[#00ba63] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            title="Help"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar (Figma Match with rounded-r-[28px]) */}
      <aside className="hidden md:flex flex-col bg-[#011f17] text-white transition-all duration-300 ease-in-out shrink-0 select-none z-20 h-screen rounded-r-[28px] overflow-hidden w-60 xl:w-64">
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#00ba63] flex items-center justify-center text-[#011f17] shrink-0 shadow-sm">
              <Shield className="w-5 h-5 fill-current text-[#011f17]" />
            </div>
            <div className="truncate">
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 leading-tight">
                TailVaR
              </h1>
              <p className="text-[10px] text-emerald-400/80 font-medium tracking-wide leading-tight">
                Claims & Policy Manager
              </p>
            </div>
          </div>
        </div>

        {/* Navigation & Profiles */}
        {renderSidebarContent(false)}

        {/* Footer */}
        {renderFooter()}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#011f17] text-white flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200 rounded-r-[28px] overflow-hidden">
            {/* Mobile Header */}
            <div className="h-16 px-4 border-b border-[#053225] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00ba63] flex items-center justify-center text-[#011f17]">
                  <Shield className="w-5 h-5 fill-current text-[#011f17]" />
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
            {renderFooter()}
          </div>
        </div>
      )}
    </>
  );
};
