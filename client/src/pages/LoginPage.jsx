import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../hooks/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form);
    if (ok) navigate('/');
  };

  const fillDemo = () => setForm({ email: 'demo@ipotrack.com', password: 'Demo@1234' });

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-surface-card border-r border-surface-border p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
                <path d="M3 17l4-8 4 4 4-6 4 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="19" cy="11" r="2" fill="#00d09c"/>
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-white">IPO<span className="text-brand-400">Track</span></span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold text-white leading-tight">
            India's Smartest<br />
            <span className="text-brand-400">IPO Intelligence</span><br />
            Platform
          </motion.h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Track live subscriptions, GMP, allotments, and portfolio performance in one premium dashboard.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '📊', label: '50+ Live IPOs', sub: 'Real-time updates' },
              { icon: '⚡', label: 'Instant Alerts', sub: 'Opening soon' },
              { icon: '💼', label: 'Portfolio Tracker', sub: 'P&L analytics' },
              { icon: '🔥', label: 'GMP Data', sub: 'Grey market premium' },
            ].map((f) => (
              <div key={f.label} className="bg-surface-hover/50 border border-surface-border rounded-xl p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-gray-500">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 relative z-10">© 2026 IPOTrack. Built for Indian markets.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                  <path d="M3 17l4-8 4 4 4-6 4 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-white">IPO<span className="text-brand-400">Track</span></span>
            </Link>
            <h2 className="font-display text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-gray-400 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email address</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" className="input-field" autoComplete="email" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-gray-400">Password</label>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" className="input-field pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 text-sm font-semibold">
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo login */}
          <div className="mt-4 p-4 bg-surface-hover/60 border border-surface-border rounded-xl">
            <p className="text-xs text-gray-500 mb-2">Try with demo credentials:</p>
            <button onClick={fillDemo} className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-mono">
              demo@ipotrack.com / Demo@1234
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
