import React, { useState } from 'react';
import { api, setStoredToken } from '../api';
import { User } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Shield, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

const DEMO_ACCOUNTS = [
  {
    role: 'Customer 1',
    username: 'customer1',
    password: 'Customer1@Demo26',
    description: 'Test policy coverage (₹10,00,000) & file claims within date range',
    badgeVariant: 'teal' as const,
  },
  {
    role: 'Customer 2',
    username: 'customer2',
    password: 'Customer2@Demo26',
    description: 'Test cross-tenant data isolation & separate policy limits',
    badgeVariant: 'secondary' as const,
  },
  {
    role: 'Administrator',
    username: 'admin',
    password: 'Admin@Demo26',
    description: 'Issue new policies, view all customer claims & approve/reject',
    badgeVariant: 'indigo' as const,
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
      onNotify('success', `Welcome back, ${res.user.name}! Authenticated as ${res.user.role}.`);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
      onNotify('error', err.message || 'Login failed.');
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-teal-500 selection:text-white">
      {/* Subtle top brand decoration */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 shadow-md mb-3 text-white">
          <Shield className="w-7 h-7 text-teal-400" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">TailVaR Consulting</h1>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Founding Engineer Assessment &bull; Insurance Policy & Claims Manager
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="rounded-3xl shadow-lg border-slate-200/90 overflow-hidden bg-white">
          <CardHeader className="p-6 pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Account Sign In</CardTitle>
            <CardDescription>
              Enter credentials or click any demo profile below for 1-click access.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="customer1, customer2, or admin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium text-slate-800 bg-slate-50/50 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium text-slate-800 bg-slate-50/50 focus:bg-white transition-all"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 font-bold text-xs shadow-sm gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>

            {/* Quick Reviewer Logins */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pre-Seeded Demo Reviewer Accounts
                </p>
                <Sparkles className="w-3 h-3 text-amber-500" />
              </div>

              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-2xl border border-slate-200/90 hover:border-slate-400 bg-slate-50/50 hover:bg-white transition-all duration-150 flex items-center justify-between group"
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{acc.role}</span>
                      <Badge variant={acc.badgeVariant} className="text-[10px] px-1.5 py-0.2">
                        @{acc.username}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{acc.description}</p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          TailVaR Consulting Hiring Assessment 2026 &bull; Multi-Tenant Architecture
        </p>
      </div>
    </div>
  );
};
