import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { itinerariesAPI } from '@/services/api';

interface PublicItinerary {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  ownerEmail?: string;
}

export function PublicItinerariesPage() {
  const [publicItineraries, setPublicItineraries] = useState<PublicItinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicItineraries = async () => {
      try {
        const response = await itinerariesAPI.getPublic();
        console.log('Public itineraries response:', response);
        setPublicItineraries(response.data.itineraries || []);
      } catch (err) {
        console.error('Failed to fetch public itineraries:', err);
        console.error('Error details:', (err as any)?.response?.data || (err as any)?.message);
        setPublicItineraries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicItineraries();
  }, []);

  const getTripDays = (itinerary: PublicItinerary) => {
    const days =
      1 +
      Math.ceil(
        (new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
                Explore Trips
              </h1>
              <p className="text-slate-500 text-sm">
                {loading
                  ? 'Loading…'
                  : publicItineraries.length === 0
                    ? 'No public trips available yet'
                    : `${publicItineraries.length} trip${publicItineraries.length !== 1 ? 's' : ''} shared by the community`}
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all w-full sm:w-auto justify-center"
            >
              ← My Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-sm">Loading trips…</p>
            </div>
          </div>
        ) : publicItineraries.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl mx-auto mb-4">
              🌍
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No public trips yet</h3>
            <p className="text-slate-500 text-sm">
              Be the first to share a trip with the community!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicItineraries.map((itinerary) => (
              <Link
                key={itinerary.id}
                to={`/itinerary/${itinerary.id}?public=true`}
                className="group block bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                {/* Accent bar */}
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-t-2xl" />

                <div className="p-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-3">
                    🌐 Public
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 mb-1.5 leading-snug group-hover:text-violet-700 transition-colors">
                    {itinerary.title}
                  </h3>

                  {itinerary.description && (
                    <p className="text-slate-500 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {itinerary.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-1 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <span className="text-emerald-400">📅</span>
                      {format(parseISO(itinerary.startDate), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-teal-400">🏁</span>
                      {format(parseISO(itinerary.endDate), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>⏱️</span>
                      {getTripDays(itinerary)}
                    </span>
                  </div>

                  {itinerary.ownerEmail && (
                    <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                      by {itinerary.ownerEmail}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicItinerariesPage;
