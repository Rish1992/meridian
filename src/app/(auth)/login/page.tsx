'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Plane,
  Shield,
  Zap,
  BarChart3,
  FileCheck,
  Globe,
  ArrowRight,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Role-based redirect map
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_REDIRECTS: Record<UserRole, string> = {
  claims_agent: '/agent/dashboard',
  authorization_officer: '/authorization/queue',
  operations_manager: '/operations/dashboard',
  qc_analyst: '/qc/browser',
  cxo: '/executive',
  super_admin: '/admin/users',
};

// ─────────────────────────────────────────────────────────────────────────────
// Demo quick-login roles
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_ROLES = [
  { label: 'Claims Agent', email: 'priya.sharma@meridian.ai', icon: FileCheck, color: '#3B82F6' },
  { label: 'Auth Officer', email: 'rajesh.menon@meridian.ai', icon: Shield, color: '#10B981' },
  { label: 'Ops Manager', email: 'vikram.singh@meridian.ai', icon: BarChart3, color: '#F59E0B' },
  { label: 'QC Analyst', email: 'ananya.gupta@meridian.ai', icon: CheckCircle2, color: '#8B5CF6' },
  { label: 'CXO Executive', email: 'james.richardson@meridian.ai', icon: Globe, color: '#F43F5E' },
  { label: 'Super Admin', email: 'admin@aistra.com', icon: Zap, color: '#14B8A6' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedStat({ end, suffix, label, duration = 2000 }: { end: number; suffix: string; label: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white font-mono tracking-tight">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-blue-200/60 mt-1 font-medium">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const success = login(email.trim(), password);
    setIsLoading(false);

    if (success) {
      const user = useAuthStore.getState().user;
      if (user) router.push(ROLE_REDIRECTS[user.role]);
    } else {
      setError('Invalid credentials. Click a role below for quick access.');
    }
  };

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError(null);
    // Auto-submit after a beat
    setTimeout(() => {
      const success = login(demoEmail, 'demo1234');
      if (success) {
        const user = useAuthStore.getState().user;
        if (user) router.push(ROLE_REDIRECTS[user.role]);
      }
    }, 300);
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-[#060d1b]">
      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT PANEL — Hero / Brand / Stats
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col">
        {/* Background image — high-altitude aerial of aircraft wing + clouds */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109db05?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(6,13,27,0.92) 0%, rgba(15,27,45,0.85) 40%, rgba(6,13,27,0.88) 100%)',
            }}
          />
          {/* Blue radial glow */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(37,99,235,0.15) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Content over image */}
        <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Plane className="w-5 h-5 text-white -rotate-45" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 opacity-30 blur-sm" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-[0.18em] text-white" style={{ fontFamily: 'var(--font-display)' }}>
                MERIDIAN
              </span>
              <span className="block text-[9px] font-semibold tracking-[0.2em] text-blue-400/60 -mt-0.5">
                BY AISTRA
              </span>
            </div>
          </div>

          {/* Hero copy */}
          <div className={`mt-auto mb-auto transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-300 tracking-wide">AI-Powered Claims Intelligence</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] max-w-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Transform airline claims processing with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                intelligent automation
              </span>
            </h1>

            <p className="mt-5 text-base text-slate-400 max-w-md leading-relaxed">
              Reduce processing time by 70%, eliminate manual errors, and maintain full regulatory compliance across EU261, DOT, DGCA, and GCAA frameworks.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                'AI Document Extraction',
                'Confidence-Based Routing',
                'Immutable Audit Trail',
                'Business Rules Engine',
              ].map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-blue-200/80 bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400/70" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className={`transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="grid grid-cols-4 gap-6 pt-8 border-t border-white/[0.06]">
              <AnimatedStat end={70} suffix="%" label="Faster Processing" />
              <AnimatedStat end={100} suffix="%" label="Audit Compliance" />
              {/* SOC 2 badge */}
              <div className="text-center flex flex-col items-center justify-center gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-300 tracking-wide whitespace-nowrap">SOC 2 Type II</span>
                </div>
                <div className="text-xs text-blue-200/60 font-medium">Certified</div>
              </div>
              {/* Enterprise badge */}
              <div className="text-center flex flex-col items-center justify-center gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-sm font-bold text-blue-300 tracking-wide whitespace-nowrap">Enterprise</span>
                </div>
                <div className="text-xs text-blue-200/60 font-medium">Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          RIGHT PANEL — Login Form
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 lg:px-16 relative">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        {/* Top glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.3) 0%, transparent 70%)' }}
        />

        {/* Mobile logo (shown on small screens) */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Plane className="w-4.5 h-4.5 text-white -rotate-45" />
          </div>
          <span className="text-xl font-extrabold tracking-[0.18em] text-white" style={{ fontFamily: 'var(--font-display)' }}>
            MERIDIAN
          </span>
        </div>

        <div className={`relative z-10 w-full max-w-[400px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Welcome back
            </h2>
            <p className="text-sm text-slate-400 mt-1.5">Sign in to your Meridian workspace</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 animate-[scaleIn_0.2s_ease-out]">
              <div className="w-1 h-8 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@meridian.ai"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-xl text-sm text-white placeholder-slate-500
                    bg-white/[0.04] border border-white/[0.08]
                    focus:bg-white/[0.07] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
                    outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 pl-11 pr-11 rounded-xl text-sm text-white placeholder-slate-500
                    bg-white/[0.04] border border-white/[0.08]
                    focus:bg-white/[0.07] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
                    outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-12 rounded-xl font-semibold text-sm text-white mt-1
                bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                transition-all duration-200 active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Quick Access</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Role quick-login grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.email}
                  type="button"
                  onClick={() => quickLogin(role.email)}
                  className="group flex items-center gap-3 px-3.5 py-3 rounded-xl
                    bg-white/[0.03] border border-white/[0.06]
                    hover:bg-white/[0.06] hover:border-white/[0.12]
                    transition-all duration-200 text-left"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${role.color}15`, color: role.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                      {role.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {role.email.split('@')[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-600 mt-8">
            Protected by enterprise-grade security · SOC 2 · ISO 27001
          </p>
        </div>
      </div>
    </div>
  );
}
