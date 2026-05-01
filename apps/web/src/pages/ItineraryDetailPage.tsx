import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchItinerary,
  fetchEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  updateItinerary,
  deleteItinerary,
  fetchShares,
  createShare,
  updateShare,
  deleteShare,
} from '@/store/itinerarySlice';
import EntriesList from '@/components/EntriesList';
import { differenceInCalendarDays, eachDayOfInterval, format, parseISO } from 'date-fns';

interface TripEntry {
  id: string;
  category: string;
  customDetails?: Record<string, any>;
}

export function ItineraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const { selected: itinerary, entries, shares, loading } = useAppSelector((state) => state.itineraries);
  const [showTripEditForm, setShowTripEditForm] = useState(false);
  const [isCreatingEntries, setIsCreatingEntries] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareAccess, setShareAccess] = useState<'view' | 'edit'>('view');
  const [tripForm, setTripForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const totalTripDays =
    differenceInCalendarDays(parseISO(itinerary?.endDate || ''), parseISO(itinerary?.startDate || '')) +
    1;

  const allTripDates =
    itinerary?.startDate && itinerary?.endDate
      ? eachDayOfInterval({
          start: parseISO(itinerary.startDate),
          end: parseISO(itinerary.endDate),
        }).map((d) => format(d, 'yyyy-MM-dd'))
      : [];

  const flyingDates = new Set(
    entries
      .filter((e: any) => e?.customDetails?.type === 'flight' || e.category === 'transport')
      .map((e: any) => e.date)
  );
  const flyingDaysCount = flyingDates.size;
  const totalFlightsCount = entries.filter((e: any) => e?.customDetails?.type === 'flight').length;

  const activityDates = new Set(
    entries
      .filter((e: any) => e.category === 'activity' || e?.customDetails?.type === 'activity')
      .map((e: any) => e.date)
  );

  const activityCountByDate = entries.reduce((acc: Record<string, number>, e: any) => {
    if (e.category === 'activity' || e?.customDetails?.type === 'activity') {
      acc[e.date] = (acc[e.date] || 0) + 1;
    }
    return acc;
  }, {});

  const isFlightEvent = (e: any) => {
    const title = String(e?.title || '');
    return (
      e?.customDetails?.type === 'flight' ||
      title.startsWith('Flight:') ||
      title.startsWith('Return Flight:')
    );
  };

  const flightCountByDate = entries.reduce((acc: Record<string, number>, e: any) => {
    if (isFlightEvent(e)) {
      acc[e.date] = (acc[e.date] || 0) + 1;
    }
    return acc;
  }, {});

  const totalEventCountByDate = entries.reduce((acc: Record<string, number>, e: any) => {
    if (e?.date) {
      acc[e.date] = (acc[e.date] || 0) + 1;
    }
    return acc;
  }, {});

  const hecticDaysCount = allTripDates.filter((date) => {
    const hasFlightAndTwoOrMoreTotalEvents =
      (flightCountByDate[date] || 0) > 0 && (totalEventCountByDate[date] || 0) >= 2;
    const hasMoreThanFourActivities = (activityCountByDate[date] || 0) > 4;
    return hasFlightAndTwoOrMoreTotalEvents || hasMoreThanFourActivities;
  }).length;

  const restDaysCount = allTripDates.filter(
    (date) => !flyingDates.has(date) && !activityDates.has(date)
  ).length;

  const activityOrJourneyDates = new Set(
    entries
      .filter((e: any) => e.category === 'activity' || e.category === 'transport')
      .map((e: any) => e.date)
  );
  const cozyDaysCount = allTripDates.filter((date) => !activityOrJourneyDates.has(date)).length;

  const stayDates = new Set(
    entries
      .filter((e: any) => e?.customDetails?.type === 'hotel' || e.category === 'accommodation')
      .map((e: any) => e.date)
  );
  const noStayDaysCount = allTripDates.filter((date) => !stayDates.has(date)).length;

  const toInputDate = (dateValue: string) => dateValue?.split('T')[0] || '';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (id) {
      dispatch(fetchItinerary(id));
      dispatch(fetchEntries(id));
      dispatch(fetchShares(id));
    }
  }, [dispatch, id, token, navigate]);

  const buildFormattedText = () => {
    const lines: string[] = [];
    lines.push(`Itinerary: ${itinerary?.title || 'Untitled Trip'}`);
    if (itinerary?.description) lines.push(`Description: ${itinerary.description}`);
    lines.push(
      `Trip Window: ${format(parseISO(itinerary?.startDate || ''), 'MMM dd, yyyy')} - ${format(
        parseISO(itinerary?.endDate || ''),
        'MMM dd, yyyy'
      )}`
    );
    lines.push('');

    const sortedEntries = [...entries].sort((a: any, b: any) => {
      if (a.date === b.date) return (a.timeStart || '').localeCompare(b.timeStart || '');
      return a.date.localeCompare(b.date);
    });

    let currentDate = '';
    sortedEntries.forEach((e: any) => {
      if (e.date !== currentDate) {
        currentDate = e.date;
        lines.push(`Date: ${currentDate}`);
      }
      const timeRange = e.timeStart || e.timeEnd ? ` [${e.timeStart || '-'} - ${e.timeEnd || '-'}]` : '';
      lines.push(`- ${e.title}${timeRange}`);
      if (e.location) lines.push(`  Location: ${e.location}`);
      if (e.description) lines.push(`  Notes: ${e.description}`);
    });

    return lines.join('\n');
  };

  const handleCopyFormattedText = async () => {
    try {
      await navigator.clipboard.writeText(buildFormattedText());
      window.alert('Formatted itinerary copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy text:', err);
      window.alert('Copy failed. Please try again.');
    }
  };

  const handleExportPdf = () => {
    const content = buildFormattedText().replace(/\n/g, '<br/>');
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      window.alert('Unable to open print window. Please allow popups.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${itinerary?.title || 'Itinerary'} - PDF</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; line-height: 1.5; }
            h1 { margin-bottom: 12px; }
            .content { white-space: normal; }
          </style>
        </head>
        <body>
          <h1>${itinerary?.title || 'Itinerary'}</h1>
          <div class="content">${content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleGrantShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !shareEmail.trim()) {
      window.alert('Please enter an email address.');
      return;
    }
    try {
      await dispatch(
        createShare({ itineraryId: id, email: shareEmail.trim(), access: shareAccess })
      ).unwrap();
      setShareEmail('');
    } catch (err) {
      console.error('Failed to create share:', err);
      window.alert('Failed to grant access.');
    }
  };

  const handleShareAccessChange = async (shareId: string, access: 'view' | 'edit') => {
    if (!id) return;
    try {
      await dispatch(updateShare({ itineraryId: id, shareId, access })).unwrap();
    } catch (err) {
      console.error('Failed to update share access:', err);
      window.alert('Failed to update access.');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!id) return;
    try {
      await dispatch(deleteShare({ itineraryId: id, shareId })).unwrap();
    } catch (err) {
      console.error('Failed to remove share:', err);
      window.alert('Failed to remove access.');
    }
  };

  useEffect(() => {
    if (!itinerary) return;
    setTripForm({
      title: itinerary.title || '',
      description: itinerary.description || '',
      startDate: toInputDate(itinerary.startDate),
      endDate: toInputDate(itinerary.endDate),
    });
  }, [itinerary]);

  const handleCreateEntries = async (newEntries: any[]) => {
    if (!id || newEntries.length === 0) return;

    setIsCreatingEntries(true);
    try {
      await Promise.all(
        newEntries.map((entry) =>
          dispatch(
            createEntry({
              itineraryId: id,
              entry,
            })
          ).unwrap()
        )
      );
    } catch (err) {
      console.error('Failed to create entries:', err);
      window.alert('Failed to create one or more entries. Please try again.');
    } finally {
      setIsCreatingEntries(false);
    }
  };

  const handleUpdateEntry = async (entryId: string, updates: any) => {
    try {
      await dispatch(updateEntry({
        id: entryId,
        updates,
      })).unwrap();
    } catch (err) {
      console.error('Failed to update entry:', err);
      window.alert('Failed to update entry. Please try again.');
    }
  };

  const handleDeleteEntry = async (entry: TripEntry) => {
    const details = entry.customDetails || {};

    if (details.type === 'hotel') {
      const relatedHotelEntries = entries.filter((e: any) => {
        const d = e.customDetails || {};
        if (d.type !== 'hotel') return false;

        return (
          (d.hotelName || '') === (details.hotelName || '') &&
          (d.checkInDate || '') === (details.checkInDate || '') &&
          (d.checkOutDate || '') === (details.checkOutDate || '') &&
          (d.reservationNumber || '') === (details.reservationNumber || '')
        );
      });

      const count = relatedHotelEntries.length || 1;
      if (!window.confirm(`Delete this hotel stay and all ${count} related day entries?`)) {
        return;
      }

      try {
        await Promise.all(
          relatedHotelEntries.map((hotelEntry: any) =>
            dispatch(deleteEntry(hotelEntry.id)).unwrap()
          )
        );
      } catch (err) {
        console.error('Failed to delete hotel stay entries:', err);
        window.alert('Failed to delete one or more hotel entries. Please try again.');
      }
      return;
    }

    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await dispatch(deleteEntry(entry.id)).unwrap();
      } catch (err) {
        console.error('Failed to delete entry:', err);
      }
    }
  };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (tripForm.startDate > tripForm.endDate) {
      window.alert('End date must be on or after start date.');
      return;
    }

    try {
      await dispatch(
        updateItinerary({
          id,
          updates: {
            title: tripForm.title,
            description: tripForm.description,
            startDate: tripForm.startDate,
            endDate: tripForm.endDate,
          },
        })
      ).unwrap();

      setShowTripEditForm(false);
    } catch (err) {
      console.error('Failed to update itinerary:', err);
      window.alert('Failed to update itinerary. Please try again.');
    }
  };

  const handleDeleteTrip = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this trip? This will also remove all entries.')) {
      return;
    }

    try {
      await dispatch(deleteItinerary(id)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete itinerary:', err);
      window.alert('Failed to delete trip. Please try again.');
    }
  };

  if (loading || !itinerary) {
    return <div className="container mx-auto px-6 py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 px-4 py-2 text-indigo-700 bg-indigo-50 rounded-full hover:bg-indigo-100 font-semibold transition"
      >
        ← Back to Dashboard
      </button>

      <div className="p-[1px] rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 mb-8 shadow-2xl shadow-violet-200/60">
        <div className="bg-white/95 backdrop-blur rounded-2xl p-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            {itinerary.title}
          </h1>
          {itinerary.description && <p className="text-gray-700 mb-4">{itinerary.description}</p>}
          <div className="text-sm text-indigo-700 font-medium space-y-1 mb-4">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
              ✨ Travel Window: {format(parseISO(itinerary.startDate), 'MMM dd, yyyy')} -{' '}
              {format(parseISO(itinerary.endDate), 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setShowTripEditForm(!showTripEditForm);
              }}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full hover:from-violet-700 hover:to-fuchsia-700 font-semibold shadow-lg shadow-fuchsia-200 transition"
            >
              {showTripEditForm ? 'Cancel Trip Edit' : 'Edit Trip'}
            </button>
            <button
              onClick={handleDeleteTrip}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-full hover:from-rose-600 hover:to-red-700 font-semibold shadow-lg shadow-rose-200 transition"
            >
              Delete Trip
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {showTripEditForm ? (
            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Trip Details</h2>
                <form onSubmit={handleUpdateTrip} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-violet-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={tripForm.title}
                      onChange={(e) => setTripForm((prev) => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-violet-700 mb-1">Description</label>
                    <textarea
                      value={tripForm.description}
                      onChange={(e) =>
                        setTripForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-violet-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={tripForm.startDate}
                        onChange={(e) =>
                          setTripForm((prev) => ({ ...prev, startDate: e.target.value }))
                        }
                        required
                        className="w-full px-4 py-2 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-violet-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={tripForm.endDate}
                        onChange={(e) => setTripForm((prev) => ({ ...prev, endDate: e.target.value }))}
                        required
                        className="w-full px-4 py-2 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:bg-gray-400 font-semibold"
                  >
                    {loading ? 'Updating Trip...' : 'Update Trip'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTripEditForm(false)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          ) : null}

          <EntriesList
            entries={entries}
            startDate={itinerary.startDate}
            endDate={itinerary.endDate}
            onCreateEntries={handleCreateEntries}
            onUpdateEntry={handleUpdateEntry}
            onDelete={handleDeleteEntry}
            isLoading={loading || isCreatingEntries}
          />
        </div>

        <div className="col-span-1">
          <div className="p-[1px] rounded-2xl bg-gradient-to-b from-cyan-400 via-violet-500 to-fuchsia-500 sticky top-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-extrabold bg-gradient-to-r from-violet-700 to-cyan-600 bg-clip-text text-transparent mb-4">
                Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-emerald-700 font-semibold">Trip Days</p>
                  <p className="text-2xl font-extrabold text-emerald-600">
                    {totalTripDays > 0 ? totalTripDays : 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                  <p className="text-sky-700 font-semibold inline-flex items-center gap-2">
                    You are flying on {flyingDaysCount} {flyingDaysCount === 1 ? 'day' : 'days'}
                    <span className="relative group inline-flex">
                      <span
                        className="w-5 h-5 inline-flex items-center justify-center text-[11px] font-bold rounded-full bg-sky-200 text-sky-700 cursor-help"
                        aria-label="Flights info"
                      >
                        i
                      </span>
                      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-[11px] font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                        You are flying {totalFlightsCount} flights
                      </span>
                    </span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                  <p className="text-rose-700 font-semibold inline-flex items-center gap-2">
                    Your Cozy days are {cozyDaysCount} {cozyDaysCount === 1 ? 'day' : 'days'}
                    <span className="relative group inline-flex">
                      <span
                        className="w-5 h-5 inline-flex items-center justify-center text-[11px] font-bold rounded-full bg-rose-200 text-rose-700 cursor-help"
                        aria-label="Cozy days info"
                      >
                        i
                      </span>
                      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-[11px] font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                        Cozy days with no activity or journey
                      </span>
                    </span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-amber-700 font-semibold inline-flex items-center gap-2">
                    No Stay Days - {noStayDaysCount} {noStayDaysCount === 1 ? 'day' : 'days'}
                    <span className="relative group inline-flex">
                      <span
                        className="w-5 h-5 inline-flex items-center justify-center text-[11px] font-bold rounded-full bg-amber-200 text-amber-700 cursor-help"
                        aria-label="No stay days info"
                      >
                        i
                      </span>
                      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-[11px] font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                        Are you travelling over night for these days! Safe Travels!
                      </span>
                    </span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-lime-50 border border-lime-100">
                  <p className="text-lime-700 font-semibold">
                    Rest Days - {restDaysCount} {restDaysCount === 1 ? 'day' : 'days'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                  <p className="text-orange-700 font-semibold">
                    Hectic Days - {hecticDaysCount} {hecticDaysCount === 1 ? 'day' : 'days'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 space-y-3">
                  <p className="text-violet-700 font-semibold">Share & Export</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyFormattedText}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-violet-600 text-white hover:bg-violet-700"
                    >
                      Copy Formatted Text
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-cyan-600 text-white hover:bg-cyan-700"
                    >
                      Export PDF
                    </button>
                  </div>

                  <form onSubmit={handleGrantShare} className="space-y-2">
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-violet-200"
                      required
                    />
                    <div className="flex gap-2">
                      <select
                        value={shareAccess}
                        onChange={(e) => setShareAccess(e.target.value as 'view' | 'edit')}
                        className="flex-1 px-3 py-2 rounded border border-violet-200"
                      >
                        <option value="view">View access</option>
                        <option value="edit">Edit access</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-2 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Grant Access
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2 max-h-48 overflow-auto pr-1">
                    {shares.length === 0 ? (
                      <p className="text-xs text-violet-600">No shared users yet.</p>
                    ) : (
                      shares.map((share: any) => (
                        <div key={share.id} className="p-2 rounded border border-violet-200 bg-white space-y-2">
                          <p className="text-xs font-medium text-gray-700 break-all">{share.email}</p>
                          <div className="flex gap-2">
                            <select
                              value={share.access}
                              onChange={(e) =>
                                handleShareAccessChange(share.id, e.target.value as 'view' | 'edit')
                              }
                              className="flex-1 px-2 py-1 text-xs rounded border border-violet-200"
                            >
                              <option value="view">View</option>
                              <option value="edit">Edit</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveShare(share.id)}
                              className="px-2 py-1 text-xs rounded bg-rose-600 text-white hover:bg-rose-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItineraryDetailPage;

