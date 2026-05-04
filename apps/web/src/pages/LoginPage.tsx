import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/authSlice';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-950 via-indigo-900 to-cyan-900 p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-violet-500/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />
        </div>
        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-2xl shadow-violet-900/50">
            V
          </div>
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            Welcome back, traveler
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Your adventures await. Sign in to access your itineraries and continue planning your
            next great journey.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['✈️ Flights', '🏨 Hotels', '🎯 Activities', '🗺️ Itineraries'].map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/75 text-xs font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 sm:px-8 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-sm font-black shadow">
              V
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              Visitour
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1.5">Sign in</h1>
              <p className="text-slate-500 text-sm">Enter your credentials to continue</p>
            </div>

            {sessionExpired && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                <span className="shrink-0">🔒</span>
                <span>Your session has expired. Please sign in again to continue.</span>
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                <span className="text-base shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Your password"
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in →'
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700 underline underline-offset-2">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
