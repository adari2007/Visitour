import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchItineraries, createItinerary } from '@/store/itinerarySlice';
import { entriesAPI, sharesAPI, itinerariesAPI } from '@/services/api';
import { format, parseISO } from 'date-fns';

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);
  const { items: itineraries, loading } = useAppSelector((state) => state.itineraries);
  const [showForm, setShowForm] = useState(false);
  const [activeShareItineraryId, setActiveShareItineraryId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareAccess, setShareAccess] = useState<'view' | 'edit'>('view');
  const [actionLoading, setActionLoading] = useState(false);
  const [hideDetailsOnPublic, setHideDetailsOnPublic] = useState<Record<string, boolean>>({});
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
      itinerary.ownerId &&
      itinerary.ownerId !== user?.id &&
      itinerary.ownerEmail !== user?.email &&
      !itinerary.isPublic
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

  const buildFormattedText = (itinerary: any, entries: any[]) => {
    const lines: string[] = [];
    lines.push(`Itinerary: ${itinerary?.title || 'Untitled Trip'}`);
    if (itinerary?.description) lines.push(`Description: ${itinerary.description}`);
    lines.push(
      `Trip Window: ${format(parseISO(itinerary.startDate), 'MMM dd, yyyy')} - ${format(
        parseISO(itinerary.endDate),
        'MMM dd, yyyy'
      )}`
    );
    lines.push('');

    const sortedEntries = [...entries].sort((a: any, b: any) => {
      if (a.date === b.date) return (a.timeStart || '').localeCompare(b.timeStart || '');
      return a.date.localeCompare(b.date);
    });

    let currentDate = '';
    sortedEntries.forEach((entry: any) => {
      if (entry.date !== currentDate) {
        currentDate = entry.date;
        lines.push(`Date: ${currentDate}`);
      }
      const timeRange =
        entry.timeStart || entry.timeEnd ? ` [${entry.timeStart || '-'} - ${entry.timeEnd || '-'}]` : '';
      lines.push(`- ${entry.title}${timeRange}`);
      if (entry.location) lines.push(`  Location: ${entry.location}`);
      if (entry.description) lines.push(`  Notes: ${entry.description}`);
    });

    return lines.join('\n');
  };

  const handleCopyTripLink = async (itineraryId: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/itinerary/${itineraryId}`);
      window.alert('Trip link copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy trip link:', err);
      window.alert('Failed to copy trip link. Please try again.');
    }
  };

  const handleCopyFormattedText = async (itinerary: any) => {
    setActionLoading(true);
    try {
      const response = await entriesAPI.getByItinerary(itinerary.id);
      const text = buildFormattedText(itinerary, response.data.entries || []);
      await navigator.clipboard.writeText(text);
      window.alert('Formatted itinerary copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy formatted text:', err);
      window.alert('Failed to copy formatted text. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportPdf = async (itinerary: any) => {
    setActionLoading(true);
    try {
      const response = await entriesAPI.getByItinerary(itinerary.id);
      const text = buildFormattedText(itinerary, response.data.entries || []);
      const content = text.replace(/\n/g, '<br/>');
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) {
        window.alert('Unable to open print window. Please allow popups.');
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>${itinerary.title || 'Itinerary'} - PDF</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; line-height: 1.5; }
              h1 { margin-bottom: 12px; }
              .content { white-space: normal; }
            </style>
          </head>
          <body>
            <h1>${itinerary.title || 'Itinerary'}</h1>
            <div class="content">${content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (err) {
      console.error('Failed to export PDF:', err);
      window.alert('Failed to export PDF. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantShare = async (itineraryId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      window.alert('Please enter an email address.');
      return;
    }

    setActionLoading(true);
    try {
      await sharesAPI.create(itineraryId, {
        email: shareEmail.trim(),
        access: shareAccess,
      });
      setShareEmail('');
      setShareAccess('view');
      window.alert('Access granted successfully.');
    } catch (err) {
      console.error('Failed to grant share access:', err);
      window.alert('Failed to grant access. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublic = async (itinerary: any) => {
    setActionLoading(true);
    try {
      await itinerariesAPI.updatePublicStatus(itinerary.id, !itinerary.isPublic);
      dispatch(fetchItineraries());
      window.alert(
        `Itinerary is now ${!itinerary.isPublic ? 'public' : 'private'}. ${
          !itinerary.isPublic ? 'It will appear in the Public Itineraries section.' : ''
        }`
      );
    } catch (err) {
      console.error('Failed to update public status:', err);
      window.alert('Failed to update itinerary visibility. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Itineraries</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          {showForm ? 'Cancel' : '+ New Itinerary'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow text-center">
                  <p className="text-gray-500 text-base sm:text-lg">No itineraries yet. Create your first one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedItineraries.map((itinerary) => (
                  <div
                    key={itinerary.id}
                    className="relative bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{itinerary.title}</h3>
                    {itinerary.description && <p className="text-gray-600 mb-3 line-clamp-2">{itinerary.description}</p>}
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>📅 {format(parseISO(itinerary.startDate), 'MMM dd, yyyy')}</p>
                      <p>📍 to {format(parseISO(itinerary.endDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Link
                        to={`/itinerary/${itinerary.id}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Open Itinerary
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveShareItineraryId((prev) =>
                            prev === itinerary.id ? null : itinerary.id
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700"
                      >
                        <span aria-hidden="true">🔗</span>
                        Share & Export
                      </button>
                    </div>

                    {activeShareItineraryId === itinerary.id ? (
                      <div className="absolute right-4 top-[calc(100%-0.25rem)] z-20 w-[min(22rem,calc(100vw-3rem))] rounded-xl border border-violet-200 bg-white p-3 shadow-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-violet-700">Share & Export</p>
                          <button
                            type="button"
                            onClick={() => setActiveShareItineraryId(null)}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                          >
                            Close
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleCopyTripLink(itinerary.id)}
                            className="px-3 py-2 text-xs font-semibold rounded bg-violet-600 text-white hover:bg-violet-700 disabled:bg-gray-400"
                          >
                            Copy Trip Link
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleCopyFormattedText(itinerary)}
                            className="px-3 py-2 text-xs font-semibold rounded bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-400"
                          >
                            Copy Formatted Text
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleExportPdf(itinerary)}
                            className="px-3 py-2 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400 sm:col-span-2"
                          >
                            Export PDF
                          </button>
                        </div>

                        <form onSubmit={(e) => handleGrantShare(itinerary.id, e)} className="space-y-2 border-t border-violet-100 pt-3">
                          <input
                            type="email"
                            placeholder="user@example.com"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded border border-violet-200 text-sm"
                            required
                          />
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={shareAccess}
                              onChange={(e) => setShareAccess(e.target.value as 'view' | 'edit')}
                              className="flex-1 px-3 py-2 rounded border border-violet-200 text-sm"
                            >
                              <option value="view">View access</option>
                              <option value="edit">Edit access</option>
                            </select>
                            <button
                              type="submit"
                              disabled={actionLoading}
                              className="px-3 py-2 text-xs font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 disabled:bg-gray-400"
                            >
                              Grant Access
                            </button>
                          </div>
                        </form>

                        <div className="border-t border-violet-100 pt-3">
                          <p className="text-sm font-semibold text-violet-700 mb-2">Public Access</p>
                          <button
                            onClick={() => handleTogglePublic(itinerary)}
                            disabled={actionLoading}
                            className="w-full px-3 py-2 text-xs font-semibold rounded bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400"
                          >
                            {itinerary.isPublic ? 'Make Private' : 'Make Public'}
                          </button>
                          {itinerary.isPublic && (
                            <div className="mt-2 text-xs text-gray-500">
                              <p>
                                This itinerary is public and can be viewed by anyone. You can share the link or embed it on your website.
                              </p>
                              <p className="mt-1 font-medium text-gray-800">
                                Link: <span className="text-blue-600">{`${window.location.origin}/itinerary/${itinerary.id}`}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
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

