import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

const features = [
  {
    icon: '📅',
    title: 'Organize by Day',
    description: 'Structure your entire trip day by day with custom details for each activity.',
    gradient: 'from-violet-500 to-fuchsia-500',
    lightBg: 'from-violet-50 to-fuchsia-50',
    border: 'border-violet-100',
  },
  {
    icon: '📍',
    title: 'Add Locations',
    description: 'Include addresses, times, and custom notes for every stop on your journey.',
    gradient: 'from-cyan-500 to-blue-500',
    lightBg: 'from-cyan-50 to-blue-50',
    border: 'border-cyan-100',
  },
  {
    icon: '🔄',
    title: 'Sync Everywhere',
    description: 'Access your itineraries on web, iOS, and Android with real-time sync.',
    gradient: 'from-emerald-500 to-teal-500',
    lightBg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-100',
  },
  {
    icon: '🎯',
    title: 'Categories',
    description: 'Organize entries by accommodation, activities, meals, transport, and more.',
    gradient: 'from-amber-500 to-orange-500',
    lightBg: 'from-amber-50 to-orange-50',
    border: 'border-amber-100',
  },
  {
    icon: '👥',
    title: 'Share Plans',
    description: 'Share your itineraries with travel companions and collaborate in real-time.',
    gradient: 'from-rose-500 to-pink-500',
    lightBg: 'from-rose-50 to-pink-50',
    border: 'border-rose-100',
  },
  {
    icon: '📱',
    title: 'Mobile Ready',
    description: 'Use native iOS and Android apps for the best mobile experience on the go.',
    gradient: 'from-indigo-500 to-violet-500',
    lightBg: 'from-indigo-50 to-violet-50',
    border: 'border-indigo-100',
  },
];

const stats = [
  { value: '10K+', label: 'Trips Planned' },
  { value: '50+', label: 'Countries' },
  { value: '99%', label: 'Happy Travelers' },
];

export function HomePage() {
  const { token } = useAppSelector((state) => state.auth);

  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      <div className="relative min-h-[88vh] flex items-center bg-gradient-to-br from-violet-950 via-indigo-900 to-cyan-900 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-32 w-96 h-96 bg-violet-600/25 rounded-full blur-[80px] animate-pulse-slow" />
          <div
            className="absolute bottom-0 -right-24 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px] animate-pulse-slow"
            style={{ animationDelay: '1.5s' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-fuchsia-500/8 rounded-full blur-[120px]" />
        </div>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative container mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-8 backdrop-blur-sm">
              <span>✈️</span> Your smart travel planner
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-[1.08] tracking-tight">
              Plan Your Journey{' '}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/65 mb-10 max-w-2xl mx-auto leading-relaxed">
              Create detailed itineraries, organize your days, add flights &amp; hotels, and share
              with your travel companions — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {token ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold text-lg hover:from-violet-700 hover:to-fuchsia-700 shadow-2xl shadow-violet-900/50 transition-all hover:-translate-y-0.5"
                >
                  Go to Dashboard
                  <span className="text-xl">→</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold text-lg hover:from-violet-700 hover:to-fuchsia-700 shadow-2xl shadow-violet-900/50 transition-all hover:-translate-y-0.5"
                  >
                    Get Started Free
                    <span className="text-xl">→</span>
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border border-white/25 rounded-2xl font-semibold text-lg hover:bg-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-10 sm:gap-16 mt-16">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-black text-white">{stat.value}</p>
                  <p className="text-white/55 text-sm mt-0.5 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 72L1440 72L1440 36C1200 72 960 0 720 36C480 72 240 0 0 36L0 72Z" fill="#f8fafc" />
          </svg>
        </div>
      </div>

      {/* ── Features ── */}
      <div className="bg-slate-50 py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-4">
              ⚡ Everything you need
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 leading-tight">
              Travel smarter,{' '}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                not harder
              </span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
              Everything you need to plan the perfect trip, all in one beautifully simple app.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative bg-gradient-to-br ${feature.lightBg} p-6 sm:p-8 rounded-2xl border ${feature.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-5 shadow-md`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                <div
                  className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-[0.08] rounded-full`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="bg-gradient-to-br from-violet-900 via-fuchsia-900 to-indigo-900 py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-400/15 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight">
            Ready to explore the world?
          </h2>
          <p className="text-white/65 text-lg mb-10 max-w-lg mx-auto">
            Join thousands of travelers who plan smarter, more memorable trips with Visitour.
          </p>
          {!token && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-700 rounded-2xl font-bold text-lg hover:bg-violet-50 shadow-2xl shadow-violet-900/40 transition-all hover:-translate-y-0.5"
              >
                Start for Free
              </Link>
              <Link
                to="/public"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5"
              >
                Browse Trips
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
