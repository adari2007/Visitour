import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register } from '@/store/authSlice';

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(register(formData)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-fuchsia-950 via-violet-900 to-indigo-900 p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-violet-500/15 rounded-full blur-[100px]" />
        </div>
        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-2xl shadow-violet-900/50">
            V
          </div>
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            Start your adventure
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Join thousands of travelers who use Visitour to plan smarter, more organized, and
            more memorable trips.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: '✅', text: 'Free forever' },
              { icon: '📱', text: 'iOS & Android' },
              { icon: '🔗', text: 'Easy sharing' },
              { icon: '📄', text: 'PDF export' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15"
              >
                <span className="text-sm">{item.icon}</span>
                <span className="text-white/75 text-sm font-medium">{item.text}</span>
              </div>
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
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1.5">Create account</h1>
              <p className="text-slate-500 text-sm">It's free and takes less than a minute</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                <span className="text-base shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">
                    First name <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jane"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Last name <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="input-field"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create account →'
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700 underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
