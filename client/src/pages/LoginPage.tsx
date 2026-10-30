import React, { useState } from 'react';
import { api, setStoredToken } from '../api';
import { User } from '../types';
import {
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Lock,
  User as UserIcon,
  ShieldCheck,
  BarChart3,
  Calendar,
  Check,
  Sun,
  Headphones,
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
    pill: 'C1',
    description: 'View policies, submit claims, and track coverage',
  },
  {
    role: 'Customer 2',
    username: 'customer2',
    password: 'Customer2@Demo26',
    pill: 'C2',
    description: 'Isolated customer account for testing',
  },
  {
    role: 'Administrator',
    username: 'admin',
    password: 'Admin@Demo26',
    pill: 'AD',
    description: 'Manage policies, customers and claims',
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#021b14] selection:bg-[#00ba63] selection:text-white">
      {/* ========================================================
          LEFT COLUMN: Forest Green Hero Showcase with 3D Illustration
          ======================================================== */}
      <div className="relative flex-1 lg:w-[54%] bg-gradient-to-br from-[#021b14] via-[#03271d] to-[#011710] p-6 sm:p-10 lg:p-14 text-white flex flex-col justify-between overflow-hidden">
        {/* Decorative Wave Glow Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00ba63]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#00e575]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Logo & Subtitle */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00c569] flex items-center justify-center text-[#021b14] shadow-lg shadow-[#00c569]/30">
            <Shield className="w-5 h-5 text-[#021b14] stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white leading-tight">TailVaR</h2>
            <p className="text-[11px] text-emerald-300/80 font-medium leading-tight">
              Insurance Policy & Claims Manager
            </p>
          </div>
        </div>

        {/* Center Hero Content & 3D Isometric Dashboard Illustration */}
        <div className="relative z-10 my-8 sm:my-10 space-y-8 max-w-xl">
          {/* Tagline Accent Pill */}
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[#00e575]">
            <span className="w-6 h-0.5 bg-[#00e575] rounded-full" />
            <span>Simple &bull; Secure &bull; Intelligent</span>
          </div>

          {/* Big Hero Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-[1.12]">
            Insurance Policy &
            <span className="block text-[#00e575] mt-1">Claims Management</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-md">
            A secure and powerful platform to manage your insurance policies, track claims, and monitor
            coverage &mdash; all in one place.
          </p>

          {/* 3 Value Proposition Features */}
          <div className="space-y-4 pt-2">
            {/* Feature 1 */}
            <div className="flex items-start gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-[#032e22]/90 border border-emerald-500/30 flex items-center justify-center text-[#00c569] shrink-0 shadow-md transition-transform group-hover:scale-105">
                <ShieldCheck className="w-5 h-5 text-[#00c569]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Secure Access Control
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">
                  Role-based access and tenant isolation for complete data security.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-[#032e22]/90 border border-emerald-500/30 flex items-center justify-center text-[#00c569] shrink-0 shadow-md transition-transform group-hover:scale-105">
                <BarChart3 className="w-5 h-5 text-[#00c569]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Real-time Insights
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">
                  Track sum insured, claims and coverage with live analytics.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-[#032e22]/90 border border-emerald-500/30 flex items-center justify-center text-[#00c569] shrink-0 shadow-md transition-transform group-hover:scale-105">
                <Calendar className="w-5 h-5 text-[#00c569]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Smart Policy Management
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">
                  Validate policy dates and monitor coverage boundaries.
                </p>
              </div>
            </div>
          </div>

          {/* 3D Isometric Floating Dashboard Showcase (Matching reference image) */}
          <div className="relative pt-4 hidden md:block">
            <div className="relative w-full max-w-md h-56 mx-auto">
              {/* Back Card: Main Dashboard Window (Tilted Dark Glass) */}
              <div className="absolute left-4 top-2 w-72 h-44 rounded-2xl bg-[#04281f]/95 border border-emerald-500/30 shadow-2xl p-3 -rotate-6 transform transition-transform hover:-rotate-3">
                {/* Window Traffic Dots */}
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                  <div className="w-2 h-2 rounded-full bg-emerald-300/30" />
                  <span className="text-[9px] font-bold text-emerald-400/80 ml-2">TailVaR</span>
                </div>
                {/* Mini skeleton rows */}
                <div className="space-y-2 opacity-70">
                  <div className="h-2 bg-emerald-500/20 rounded-full w-3/4" />
                  <div className="h-2 bg-emerald-500/15 rounded-full w-full" />
                  <div className="h-2 bg-emerald-500/20 rounded-full w-5/6" />
                  <div className="h-2 bg-emerald-500/15 rounded-full w-2/3" />
                </div>
              </div>

              {/* Front Floating Card: Coverage Chart with Wave */}
              <div className="absolute right-2 top-0 w-64 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-2xl border border-slate-100 rotate-2 transform transition-transform hover:rotate-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-800">Coverage</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60">
                    +12%
                  </span>
                </div>
                {/* Mini Wave SVG */}
                <svg className="w-full h-12 overflow-visible" viewBox="0 0 160 40">
                  <defs>
                    <linearGradient id="loginWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ba63" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00ba63" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,25 Q 30,10 60,20 T 120,8 T 160,18 L 160,40 L 0,40 Z"
                    fill="url(#loginWaveGrad)"
                  />
                  <path
                    d="M 0,25 Q 30,10 60,20 T 120,8 T 160,18"
                    fill="none"
                    stroke="#00ba63"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Floating Badge Card: Policy Active */}
              <div className="absolute left-24 bottom-2 z-20 flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-100 rotate-1">
                <div className="w-6 h-6 rounded-full bg-[#00ba63] flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-900 leading-tight">Policy Active</p>
                  <p className="text-[9px] text-slate-400 font-medium">All documents verified</p>
                </div>
              </div>

              {/* Glowing Shield Icon Squircle */}
              <div className="absolute right-20 bottom-4 z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#022c21] to-[#011f17] border border-emerald-500/40 shadow-xl flex items-center justify-center -rotate-6">
                <Shield className="w-6 h-6 text-[#00c569]" />
              </div>

              {/* Mini analytics bar squircle */}
              <div className="absolute right-6 bottom-8 z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-[#022c21] to-[#011f17] border border-emerald-500/40 shadow-xl flex items-end justify-around p-1.5 rotate-3">
                <div className="w-1.5 h-3 bg-[#00c569] rounded-t-xs" />
                <div className="w-1.5 h-5 bg-[#00c569] rounded-t-xs" />
                <div className="w-1.5 h-4 bg-[#00c569] rounded-t-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Enterprise Compliance & Copyright Footer */}
        <div className="relative z-10 pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00c569] shadow-[0_0_8px_#00c569]" />
              <p className="text-xs sm:text-sm font-bold text-white tracking-tight">
                &copy; 2026 TailVaR Technologies &amp; Consulting Inc.
              </p>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Enterprise Policy &amp; Claims Management Platform &bull; v1.2.0
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400/90 bg-[#022c21]/90 border border-emerald-500/30 px-3 py-1.5 rounded-full shadow-2xs">
              <Shield className="w-3 h-3 text-[#00c569]" />
              <span>SOC-2 Type II Certified</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400/90 bg-[#022c21]/90 border border-emerald-500/30 px-3 py-1.5 rounded-full shadow-2xs">
              <Lock className="w-3 h-3 text-[#00c569]" />
              <span>256-Bit TLS End-to-End</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN: Clean White Modern Card with Form & Demo Logins
          ======================================================== */}
      <div className="flex-1 lg:w-[46%] bg-white rounded-t-3xl lg:rounded-l-[32px] lg:rounded-tr-none shadow-2xl p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-y-auto">
        {/* Top Right Theme / Action Toggle Pill */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            aria-label="Theme toggle"
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>

        {/* Main Sign In Form Area */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Sign in to access your TailVaR account
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00ba63] focus:border-transparent transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00ba63] focus:border-transparent transition-all shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#00ba63] focus:ring-[#00ba63] cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  onNotify(
                    'success',
                    'Demo accounts are pre-configured below for 1-click instant login.'
                  )
                }
                className="font-bold text-[#00ba63] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Primary Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-2xl bg-[#031d16] hover:bg-[#072d22] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#031d16]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <div className="w-5 h-5 rounded-full bg-[#00ba63] flex items-center justify-center text-[#031d16] group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </div>
            </button>
          </form>

          {/* Divider with Center Pill */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              or try a demo account
            </span>
          </div>

          {/* Pre-configured Demo Accounts Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Demo Accounts</span>
              <span className="text-[11px] text-slate-400 font-medium">Quick access</span>
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-2xl border border-slate-200/80 bg-white hover:border-[#00ba63] hover:bg-emerald-50/20 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Role Avatar Pill */}
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#008f4c] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {acc.pill}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-950">
                          {acc.role}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                          {acc.username}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                        {acc.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Circle Arrow Button */}
                  <div className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#008f4c] group-hover:border-[#00ba63] group-hover:bg-emerald-50 transition-all shrink-0 ml-2">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Decorative Wave Curve and Help Contact */}
        <div className="pt-6 relative">
          {/* Subtle Bottom Wave SVG */}
          <svg
            className="w-full h-8 pointer-events-none opacity-40 mb-2"
            viewBox="0 0 200 20"
            preserveAspectRatio="none"
          >
            <path
              d="M0,15 Q50,0 100,10 T200,5"
              fill="none"
              stroke="#00ba63"
              strokeWidth="1.2"
            />
            <path
              d="M0,18 Q60,5 120,12 T200,8"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="0.8"
            />
          </svg>

          <p className="text-[11px] text-slate-400 font-medium text-center flex items-center justify-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-slate-400" />
            <span>Need help? Contact your system administrator.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
