import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { itinerariesAPI, entriesAPI } from '@/services/api';

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
  const navigate = useNavigate();
  const [publicItineraries, setPublicItineraries] = useState<PublicItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideDetails, setHideDetails] = useState<Record<string, boolean>>({});

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

  const getItinerarySummary = (itinerary: PublicItinerary) => {
    const days = 1 + Math.ceil(
      (new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return `${days}-day trip`;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Public Itineraries</h1>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto text-center"
        >
          Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading public itineraries...</div>
      ) : publicItineraries.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 text-base sm:text-lg">No public itineraries available yet. (Check console for debug info)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicItineraries.map((itinerary) => (
            <Link
              key={itinerary.id}
              to={`/itinerary/${itinerary.id}?public=true`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-emerald-100"
            >
              <p className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 mb-2">
                Public
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{itinerary.title}</h3>
              {itinerary.description && (
                <p className="text-gray-600 mb-3 line-clamp-2">{itinerary.description}</p>
              )}
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <p>📅 {format(parseISO(itinerary.startDate), 'MMM dd, yyyy')}</p>
                <p>📍 to {format(parseISO(itinerary.endDate), 'MMM dd, yyyy')}</p>
                <p>⏱️ {getItinerarySummary(itinerary)}</p>
              </div>
              {itinerary.ownerEmail && (
                <p className="text-xs text-gray-400">by {itinerary.ownerEmail}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicItinerariesPage;

