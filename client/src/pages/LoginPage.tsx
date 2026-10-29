import React, { useState } from 'react';
import { api, setStoredToken } from '../api';
import { User } from '../types';
import { Shield, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

const DEMO_ACCOUNTS = [
  {
    role: 'Customer 1',
    username: 'customer1',
    password: 'Customer1@Demo26',
    description: 'Access Customer 1 policies (e.g. 10 Lakh SI) & file claims',
    color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/40',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  {
    role: 'Customer 2',
    username: 'customer2',
    password: 'Customer2@Demo26',
    description: 'Access Customer 2 isolated data & test cross-tenant isolation',
    color: 'border-sky-200 hover:border-sky-400 bg-sky-50/40',
    badge: 'bg-sky-100 text-sky-700',
  },
  {
    role: 'Administrator',
    username: 'admin',
    password: 'Admin@Demo26',
    description: 'Create policies, review all claims, approve or reject claims',
    color: 'border-purple-200 hover:border-purple-400 bg-purple-50/40',
    badge: 'bg-purple-100 text-purple-700',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNotify }) => {
  const [username, setUsername] = useState('customer1');
  const [password, setPassword] = useState('Customer1@Demo26');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);

    const loginUser = customUser || username;
    const loginPass = customPass || password;

    try {
      setLoading(true);
      const res = await api.login({ username: loginUser, password: loginPass });
      setStoredToken(res.token);
      onLoginSuccess(res.user);
      onNotify('success', `Logged in successfully as ${res.user.name} (${res.user.role})`);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 shadow-xl shadow-indigo-500/25 mb-4">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">TailVaR Consulting</h2>
          <p className="text-sm font-semibold text-indigo-300 mt-1">
            Insurance Policy & Claims Management Application
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
          <form className="space-y-4" onSubmit={(e) => handleLogin(e)}>
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-600" /> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 bg-slate-50 focus:bg-white text-sm"
                placeholder="customer1, customer2, or admin"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 bg-slate-50 focus:bg-white text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Reviewer Logins */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Reviewer Demo Accounts
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={loading}
                  className={`w-full text-left p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between group ${acc.color}`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{acc.role}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${acc.badge}`}>
                        @{acc.username}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{acc.description}</p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-300 transition-colors shrink-0 shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          TailVaR Consulting Hiring Assessment 2026 &bull; Secure Multi-Tenant Architecture
        </p>
      </div>
    </div>
  );
};
