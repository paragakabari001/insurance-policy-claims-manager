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
  Sparkles,
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
    description: 'Active Policy ₹10,00,000 SI & test claim submissions',
    badgeVariant: 'teal' as const,
    badgeText: 'Primary Client',
  },
  {
    role: 'Customer 2',
    username: 'customer2',
    password: 'Customer2@Demo26',
    description: 'Isolated Policy ₹5,00,000 SI & tenant data segregation test',
    badgeVariant: 'secondary' as const,
    badgeText: 'Secondary Client',
  },
  {
    role: 'Administrator',
    username: 'admin',
    password: 'Admin@Demo26',
    description: 'Issue policies, review claims & adjudicate with live SI updates',
    badgeVariant: 'indigo' as const,
    badgeText: 'Underwriter / Admin',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNotify }) => {
  const [username, setUsername] = useState('customer1');
  const [password, setPassword] = useState('Customer1@Demo26');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      setError(err.message || 'Authentication failed. Please verify credentials.');
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-emerald-500 selection:text-white">
      {/* Left Column: Dark Forest Green Premium Hero (matching uploaded Elstar-style split layout) */}
      <div className="lg:w-[46%] xl:w-[48%] bg-gradient-to-br from-[#041a13] via-[#06241b] to-[#03150f] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Subtle decorative glowing background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Shield className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">TailVaR</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CONSULTING
                </span>
              </div>
              <p className="text-xs text-emerald-400/80 font-medium">Founding Engineer Assessment 2026</p>
            </div>
          </div>
        </div>

        {/* Center Content & Testimonial Card */}
        <div className="relative z-10 my-12 lg:my-0 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Insurance Policy & Claims Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            High Integrity Claims & Policy Management
          </h2>
          <p className="text-sm text-emerald-100/70 mt-3 leading-relaxed">
            Enterprise multi-tenant core engine featuring real-time Sum Insured accounting, atomic concurrency safeguards, and strict role-based access control.
          </p>

          {/* Testimonial card matching screenshot */}
          <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-sm">
                AN
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Anubhav</p>
                <p className="text-xs text-emerald-300/80 mt-1">Founder, TailVaR Consulting</p>
              </div>
            </div>
            <p className="text-xs text-emerald-100/80 italic leading-relaxed">
              "Assesses full-stack backend engineering, cloud deployment, data integrity, calendar date validation, and functional frontend elegance."
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-emerald-200/50 pt-6 border-t border-white/10">
          <span>Copyright &copy; 2026 TailVaR Consulting</span>
          <span>v1.0.0 Production Core</span>
        </div>
      </div>

      {/* Right Column: Clean, Crisp White Sign-In Card (Matching uploaded screenshot) */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Please enter your credentials to sign in!
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                User Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or customer1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-medium text-slate-900 bg-white shadow-2xs transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-medium text-slate-900 bg-white shadow-2xs transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Remember Me</span>
              </label>
              <span className="font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer">
                Demo Credentials Below
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#06241b] hover:bg-[#083528] text-white rounded-xl py-2.5 font-bold text-sm shadow-md shadow-emerald-950/20 transition-all gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          {/* 1-Click Reviewer Accounts Section */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Evaluator 1-Click Fast Sign-In
              </p>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Pre-Configured
              </span>
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={loading}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200/90 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 transition-all duration-150 flex items-center justify-between group shadow-2xs"
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                        {acc.role}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                        @{acc.username}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {acc.description}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-300 transition-colors shrink-0 shadow-2xs">
                    <ArrowRight className="w-4 h-4" />
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
