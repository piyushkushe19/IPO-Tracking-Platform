import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../hooks/useAuthStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email address';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) errs.password = 'Must contain uppercase, lowercase and number';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await register({ name: form.name, email: form.email, password: form.password });
    if (ok) navigate('/');
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        <Link to="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow-brand">
            <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
              <path d="M3 17l4-8 4 4 4-6 4 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="19" cy="11" r="2" fill="#00d09c"/>
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-white">IPO<span className="text-brand-400">Track</span></span>
        </Link>

        <div className="card p-8">
          <div className="mb-6 text-center">
            <h2 className="font-display text-2xl font-bold text-white">Create account</h2>
            <p className="text-gray-400 text-sm mt-1">Start tracking IPOs for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" error={errors.name}>
              <input type="text" required value={form.name} onChange={set('name')}
                placeholder="Rahul Sharma" className="input-field" autoComplete="name" />
            </Field>

            <Field label="Email Address" error={errors.email}>
              <input type="email" required value={form.email} onChange={set('email')}
                placeholder="rahul@example.com" className="input-field" autoComplete="email" />
            </Field>

            <Field label="Password" error={errors.password}>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                  placeholder="Min 8 chars, mixed case + number" className="input-field pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </Field>

            <Field label="Confirm Password" error={errors.confirm}>
              <input type="password" required value={form.confirm} onChange={set('confirm')}
                placeholder="••••••••" className="input-field" />
            </Field>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 text-sm font-semibold mt-2">
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-sm text-gray-400 mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-xs text-accent-red mt-1">{error}</p>}
    </div>
  );
}
