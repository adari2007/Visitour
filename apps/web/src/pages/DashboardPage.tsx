import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchItineraries, createItinerary } from '@/store/itinerarySlice';
import { format, parseISO } from 'date-fns';

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

  const ownedItineraries = itineraries.filter(
    (itinerary) =>
      !itinerary.ownerId || itinerary.ownerId === user?.id || itinerary.ownerEmail === user?.email
  );
  const sharedItineraries = itineraries.filter(
    (itinerary) =>
      itinerary.ownerId && itinerary.ownerId !== user?.id && itinerary.ownerEmail !== user?.email
  );

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
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Itineraries</h2>
            {ownedItineraries.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500 text-lg">No itineraries yet. Create your first one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedItineraries.map((itinerary) => (
                  <Link
                    key={itinerary.id}
                    to={`/itinerary/${itinerary.id}`}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{itinerary.title}</h3>
                    {itinerary.description && <p className="text-gray-600 mb-3 line-clamp-2">{itinerary.description}</p>}
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>📅 {format(parseISO(itinerary.startDate), 'MMM dd, yyyy')}</p>
                      <p>📍 to {format(parseISO(itinerary.endDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {sharedItineraries.length > 0 ? (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Shared with me</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedItineraries.map((itinerary) => (
                  <Link
                    key={itinerary.id}
                    to={`/itinerary/${itinerary.id}`}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-violet-100"
                  >
                    <p className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-violet-100 text-violet-700 mb-2">
                      Shared
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{itinerary.title}</h3>
                    {itinerary.description && <p className="text-gray-600 mb-3 line-clamp-2">{itinerary.description}</p>}
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>📅 {format(parseISO(itinerary.startDate), 'MMM dd, yyyy')}</p>
                      <p>📍 to {format(parseISO(itinerary.endDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

