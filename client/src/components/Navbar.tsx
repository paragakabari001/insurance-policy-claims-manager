import React from 'react';
import { User } from '../types';
import { Shield, LogOut, UserCheck, RefreshCw } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onQuickSwitch: (username: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onQuickSwitch }) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  TailVaR
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Claims Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal leading-none hidden sm:block">
                Insurance Policy & Claims Management
              </p>
            </div>
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Quick Demo Switcher */}
            <div className="hidden md:flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60 text-xs">
              <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
                <RefreshCw className="w-3 h-3 text-slate-400" /> Switch:
              </span>
              <button
                onClick={() => onQuickSwitch('customer1')}
                className={`px-2 py-1 rounded transition-colors ${
                  user.username === 'customer1'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Switch to Customer 1"
              >
                Customer 1
              </button>
              <button
                onClick={() => onQuickSwitch('customer2')}
                className={`px-2 py-1 rounded transition-colors ${
                  user.username === 'customer2'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Switch to Customer 2"
              >
                Customer 2
              </button>
              <button
                onClick={() => onQuickSwitch('admin')}
                className={`px-2 py-1 rounded transition-colors ${
                  user.username === 'admin'
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Switch to Administrator"
              >
                Admin
              </button>
            </div>

            {/* Current user badge */}
            <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-slate-700">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                <UserCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-white leading-tight">
                  {user.name}
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                      user.role === 'Administrator'
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                        : 'bg-sky-900/60 text-sky-300 border border-sky-700/50'
                    }`}
                  >
                    {user.role}
                  </span>
                  <span className="text-[11px] text-slate-400">(@{user.username})</span>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800/60 transition-all duration-150"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
