import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/authSlice';

export function Header() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600">
          Visitour
        </Link>

        {token && user ? (
          <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">
              Dashboard
            </Link>
            <Link to="/public" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">
              Public Itineraries
            </Link>
            <span className="text-gray-600 text-sm break-all">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex w-full sm:w-auto gap-2 sm:gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-center flex-1 sm:flex-none"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center flex-1 sm:flex-none"
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;

