import React, { useState } from 'react';
import { api, setStoredToken } from '../api';
import { User } from '../types';
import { Button } from '../components/ui/button';
import {
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Lock,
  User as UserIcon,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

const DEMO_ACCOUNTS = [
  {
    role: 'Customer 1',
    username: 'customer1',
    password: 'Customer1@Demo26',
    description: 'View policies, submit claims, and track remaining coverage',
    badge: 'Customer',
  },
  {
    role: 'Customer 2',
    username: 'customer2',
    password: 'Customer2@Demo26',
    description: 'Isolated customer account for data separation testing',
    badge: 'Customer',
  },
  {
    role: 'Administrator',
    username: 'admin',
    password: 'Admin@Demo26',
    description: 'Create customer policies and adjudicate submitted claims',
    badge: 'Administrator',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNotify }) => {
  const [username, setUsername] = useState('customer1');
  const [password, setPassword] = useState('Customer1@Demo26');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);

    const loginUser = customUser || username;
    const loginPass = customPass || password;

    try {
      setLoading(true);
      // Real authentication request against the backend endpoint
      const res = await api.login({ username: loginUser, password: loginPass });
      setStoredToken(res.token);
      onLoginSuccess(res.user);
      onNotify('success', `Signed in as ${res.user.name} (${res.user.role}).`);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      onNotify('error', err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setUsername(demo.username);
    setPassword(demo.password);
    handleLogin(undefined, demo.username, demo.password);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Left Column: Subtle Forest Green Hero */}
      <div className="lg:w-[45%] bg-[#06241b] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-sm">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block">TailVaR</span>
              <span className="text-xs text-emerald-300 font-medium">Insurance Policy & Claims Manager</span>
            </div>
          </div>

          <div className="mt-16 max-w-sm">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Insurance Policy & Claims Management
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/70 mt-3 leading-relaxed">
              Secure portal for policy administration and customer claims tracking. Access is restricted to authenticated users.
            </p>

            <div className="mt-8 space-y-3 border-t border-emerald-900/60 pt-6 text-xs text-emerald-200/80">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Strict role-based access control and tenant isolation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Atomic, real-time Sum Insured balance tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Calendar date validation for coverage boundaries</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 text-[11px] text-emerald-300/50">
          TailVaR Consulting &bull; Insurance Management System
        </div>
      </div>

      {/* Right Column: Clean, Compact Login Form */}
      <div className="flex-1 flex flex-col justify-center py-10 px-6 sm:px-12 lg:px-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or customer1"
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-900 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-900 bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#06241b] hover:bg-[#083528] text-white rounded-lg py-2 font-semibold text-xs shadow-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          {/* Pre-configured Demo Accounts */}
          <div className="pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pre-Configured Demo Accounts
            </p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                        {acc.role}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        @{acc.username}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{acc.description}</p>
                  </div>
                  <div className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-700 group-hover:border-emerald-600 shrink-0">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
