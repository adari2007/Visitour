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
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Visitour
        </Link>

        {token && user ? (
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <span className="text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

