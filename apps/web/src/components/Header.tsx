import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/authSlice';

export function Header() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-violet-100/60 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-violet-300/50">
            V
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
            Visitour
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {token && user ? (
            <>
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/public"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/public')
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'
                }`}
              >
                Explore
              </Link>
              <div className="flex items-center gap-2.5 ml-3 pl-3 border-l border-slate-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shadow">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-xs text-slate-500 max-w-[130px] truncate hidden md:block">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-200/70 transition-all duration-200 hover:-translate-y-px"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="sm:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-violet-50 transition-colors"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-[18px] h-0.5 bg-slate-700 rounded-full transition-all duration-300 origin-center ${
              mobileOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`block w-[18px] h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${
              mobileOpen ? 'opacity-0 scale-x-0' : ''
            }`}
          />
          <span
            className={`block w-[18px] h-0.5 bg-slate-700 rounded-full transition-all duration-300 origin-center ${
              mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-violet-100 bg-white/95 backdrop-blur-sm animate-slide-down">
          <div className="container mx-auto px-4 py-4 space-y-1.5">
            {token && user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-violet-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold w-full transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-slate-700 hover:bg-violet-50'
                  }`}
                >
                  <span className="text-base">📋</span> Dashboard
                </Link>
                <Link
                  to="/public"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold w-full transition-colors ${
                    isActive('/public')
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-slate-700 hover:bg-violet-50'
                  }`}
                >
                  <span className="text-base">🌍</span> Explore
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <span className="text-base">🚪</span> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-violet-700 border-2 border-violet-200 hover:bg-violet-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-200"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
