import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export function HomePage() {
  const { token } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Plan Your Journey with <span className="text-blue-600">Visitour</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-8">
            Create detailed itineraries for your travels. Organize your days, add activities, and
            sync across all your devices.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {token ? (
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-base sm:text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-base sm:text-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-base sm:text-lg"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Organize by Day</h3>
            <p className="text-gray-600">
              Structure your entire trip day by day with custom details for each activity.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add Locations</h3>
            <p className="text-gray-600">
              Include addresses, times, and custom notes for every stop on your journey.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sync Everywhere</h3>
            <p className="text-gray-600">
              Access your itineraries on web, iOS, and Android with real-time sync.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Categories</h3>
            <p className="text-gray-600">
              Organize entries by accommodation, activities, meals, transport, and more.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Share Plans</h3>
            <p className="text-gray-600">
              Share your itineraries with travel companions and collaborate in real-time.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Ready</h3>
            <p className="text-gray-600">
              Use native iOS and Android apps for the best mobile experience on the go.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

