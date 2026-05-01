import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchItineraries, createItinerary } from '@/store/itinerarySlice';
import { formatDate } from 'date-fns';

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);
  const { items: itineraries, loading } = useAppSelector((state) => state.itineraries);
  const [showForm, setShowForm] = useState(false);
  const [newItinerary, setNewItinerary] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchItineraries());
  }, [dispatch, token, navigate]);

  const handleCreateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createItinerary({
        ...newItinerary,
        isPublic: false,
      })).unwrap();
      setNewItinerary({ title: '', description: '', startDate: '', endDate: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create itinerary:', err);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">My Itineraries</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ New Itinerary'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Itinerary</h2>
          <form onSubmit={handleCreateItinerary} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newItinerary.title}
                onChange={(e) => setNewItinerary((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Paris Trip 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newItinerary.description}
                onChange={(e) => setNewItinerary((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Describe your trip"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newItinerary.startDate}
                  onChange={(e) => setNewItinerary((prev) => ({ ...prev, startDate: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newItinerary.endDate}
                  onChange={(e) => setNewItinerary((prev) => ({ ...prev, endDate: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Itinerary
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading itineraries...</div>
      ) : itineraries.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg mb-4">No itineraries yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary) => (
            <Link
              key={itinerary.id}
              to={`/itinerary/${itinerary.id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{itinerary.title}</h3>
              {itinerary.description && <p className="text-gray-600 mb-3 line-clamp-2">{itinerary.description}</p>}
              <div className="text-sm text-gray-500 space-y-1">
                <p>📅 {formatDate(new Date(itinerary.startDate), 'MMM dd, yyyy')}</p>
                <p>📍 to {formatDate(new Date(itinerary.endDate), 'MMM dd, yyyy')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

