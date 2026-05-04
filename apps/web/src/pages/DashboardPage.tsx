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
      await dispatch(createItinerary({ ...newItinerary, isPublic: false })).unwrap();
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
      await sharesAPI.create(itineraryId, { email: shareEmail.trim(), access: shareAccess });
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
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-10 h-10 border-3 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading your trips…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
                My Itineraries
              </h1>
              <p className="text-slate-500 text-sm">
                {ownedItineraries.length === 0
                  ? 'Create your first trip to get started'
                  : `${ownedItineraries.length} trip${ownedItineraries.length !== 1 ? 's' : ''} planned`}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all w-full sm:w-auto ${
                showForm
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'btn-primary'
              }`}
            >
              {showForm ? '✕ Cancel' : '＋ New Trip'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Create form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-card border border-violet-100 overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-fuchsia-50">
              <h2 className="text-lg font-bold text-slate-900">Plan a New Trip</h2>
            </div>
            <form onSubmit={handleCreateItinerary} className="p-6 space-y-4">
              <div>
                <label className="form-label">Trip Title</label>
                <input
                  type="text"
                  value={newItinerary.title}
                  onChange={(e) => setNewItinerary((p) => ({ ...p, title: e.target.value }))}
                  required
                  className="input-field"
                  placeholder="e.g., Paris Spring 2025"
                />
              </div>
              <div>
                <label className="form-label">Description <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea
                  value={newItinerary.description}
                  onChange={(e) => setNewItinerary((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="A quick summary of your trip"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={newItinerary.startDate}
                    onChange={(e) => setNewItinerary((p) => ({ ...p, startDate: e.target.value }))}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    value={newItinerary.endDate}
                    onChange={(e) => setNewItinerary((p) => ({ ...p, endDate: e.target.value }))}
                    required
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="submit"
                  className="btn-primary flex-1 sm:flex-none py-3"
                >
                  Create Trip
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-sm">Loading trips…</p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Owned itineraries */}
            <section>
              <h2 className="text-base font-bold text-slate-500 uppercase tracking-wider mb-5">
                Your Trips
              </h2>

              {ownedItineraries.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-3xl mx-auto mb-4">
                    🗺️
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No trips yet</h3>
                  <p className="text-slate-500 text-sm mb-5">
                    Create your first itinerary to start planning your adventure.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary px-6 py-2.5 text-sm"
                  >
                    ＋ New Trip
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ownedItineraries.map((itinerary) => (
                    <div
                      key={itinerary.id}
                      className="relative bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-visible"
                    >
                      {/* Top accent bar */}
                      <div className="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-t-2xl" />

                      <div className="p-5">
                        {/* Public badge */}
                        {itinerary.isPublic && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-3">
                            🌐 Public
                          </span>
                        )}

                        <h3 className="text-lg font-bold text-slate-900 mb-1.5 leading-snug">
                          {itinerary.title}
                        </h3>
                        {itinerary.description && (
                          <p className="text-slate-500 text-sm mb-3 line-clamp-2 leading-relaxed">
                            {itinerary.description}
                          </p>
                        )}

                        <div className="flex flex-col gap-1 text-xs text-slate-500 mb-4">
                          <span className="flex items-center gap-1.5">
                            <span className="text-violet-400">📅</span>
                            {format(parseISO(itinerary.startDate), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-fuchsia-400">🏁</span>
                            {format(parseISO(itinerary.endDate), 'MMM dd, yyyy')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <Link
                            to={`/itinerary/${itinerary.id}`}
                            className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
                          >
                            Open Trip →
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveShareItineraryId((prev) =>
                                prev === itinerary.id ? null : itinerary.id
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-fuchsia-600 hover:text-fuchsia-700 transition-colors"
                          >
                            <span>🔗</span> Share
                          </button>
                        </div>
                      </div>

                      {/* Share popup */}
                      {activeShareItineraryId === itinerary.id && (
                        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-violet-200 bg-white p-4 shadow-2xl shadow-violet-100/50 space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-violet-700">Share & Export</p>
                            <button
                              type="button"
                              onClick={() => setActiveShareItineraryId(null)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold transition-colors"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleCopyTripLink(itinerary.id)}
                              className="px-3 py-2 text-xs font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-all"
                            >
                              Copy Link
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleCopyFormattedText(itinerary)}
                              className="px-3 py-2 text-xs font-semibold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50 transition-all"
                            >
                              Copy Text
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleExportPdf(itinerary)}
                              className="col-span-2 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all"
                            >
                              Export PDF
                            </button>
                          </div>

                          <form
                            onSubmit={(e) => handleGrantShare(itinerary.id, e)}
                            className="space-y-2 pt-2 border-t border-violet-100"
                          >
                            <p className="text-xs font-semibold text-slate-600">Grant Access</p>
                            <input
                              type="email"
                              placeholder="user@example.com"
                              value={shareEmail}
                              onChange={(e) => setShareEmail(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-violet-400"
                              required
                            />
                            <div className="flex gap-2">
                              <select
                                value={shareAccess}
                                onChange={(e) => setShareAccess(e.target.value as 'view' | 'edit')}
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50"
                              >
                                <option value="view">View only</option>
                                <option value="edit">Can edit</option>
                              </select>
                              <button
                                type="submit"
                                disabled={actionLoading}
                                className="px-3 py-2 text-xs font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                              >
                                Grant
                              </button>
                            </div>
                          </form>

                          <div className="pt-2 border-t border-violet-100">
                            <button
                              onClick={() => handleTogglePublic(itinerary)}
                              disabled={actionLoading}
                              className={`w-full px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                itinerary.isPublic
                                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                              }`}
                            >
                              {itinerary.isPublic ? '🔒 Make Private' : '🌐 Make Public'}
                            </button>
                            {itinerary.isPublic && (
                              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                                Public URL:{' '}
                                <span className="text-violet-600 font-medium break-all">
                                  {`${window.location.origin}/itinerary/${itinerary.id}`}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Shared itineraries */}
            {sharedItineraries.length > 0 && (
              <section>
                <h2 className="text-base font-bold text-slate-500 uppercase tracking-wider mb-5">
                  Shared with Me
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sharedItineraries.map((itinerary) => (
                    <Link
                      key={itinerary.id}
                      to={`/itinerary/${itinerary.id}`}
                      className="block bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
                    >
                      <div className="h-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-t-2xl" />
                      <div className="p-5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-3">
                          👥 Shared
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5 leading-snug group-hover:text-violet-700 transition-colors">
                          {itinerary.title}
                        </h3>
                        {itinerary.description && (
                          <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                            {itinerary.description}
                          </p>
                        )}
                        <div className="flex flex-col gap-1 text-xs text-slate-500">
                          <span>📅 {format(parseISO(itinerary.startDate), 'MMM dd, yyyy')}</span>
                          <span>🏁 {format(parseISO(itinerary.endDate), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
