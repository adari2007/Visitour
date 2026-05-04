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
  date: string;
  title: string;
  category: string;
  customDetails?: Record<string, any>;
}

export function ItineraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = new URLSearchParams(window.location.search);
  const isPublicView = searchParams.get('public') === 'true';
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, user } = useAppSelector((state) => state.auth);
  const { selected: itinerary, entries, shares, loading } = useAppSelector((state) => state.itineraries);
  const [showTripEditForm, setShowTripEditForm] = useState(false);
  const [isCreatingEntries, setIsCreatingEntries] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareAccess, setShareAccess] = useState<'view' | 'edit'>('view');
  const [hideDetails, setHideDetails] = useState(false);
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

  // Transform entries to hide sensitive details if in public view with hideDetails enabled
  const transformedEntries = entries.map((entry) => {
    if (!isPublicView || !hideDetails) return entry;

    const details = entry.customDetails || {};
    if (details.type === 'flight' || entry.category === 'transport') {
      return {
        ...entry,
        title: '✈️ Travel',
        description: undefined,
        customDetails: {
          ...details,
          pnr: undefined,
          flightNumber: undefined,
          origin: undefined,
          destination: undefined,
        },
      };
    }
    if (details.type === 'hotel' || entry.category === 'accommodation') {
      return {
        ...entry,
        title: '🏨 Stay at Cozy Place',
        description: undefined,
        customDetails: {
          ...details,
          hotelName: undefined,
          address: undefined,
          contactNumber: undefined,
          reservationNumber: undefined,
        },
      };
    }
    return entry;
  });

   // Use transformed entries for display when in public hideDetails mode
   const displayEntries = isPublicView && hideDetails ? transformedEntries : entries;
   const isOwner = Boolean(user?.id && itinerary?.ownerId && user.id === itinerary.ownerId);
   const isReadOnlyPublicView = Boolean(itinerary?.isPublic && !isOwner);

   // Check if user has view-only (not edit) access to a shared itinerary
   const userShareAccess = shares.length > 0
     ? shares.find((s: any) => s.email === user?.email)?.access
     : undefined;
   const hasViewOnlyAccess = Boolean(!isOwner && userShareAccess === 'view');

   const canManageEntries = !isReadOnlyPublicView && !hasViewOnlyAccess;
   const canEditTrip = !isReadOnlyPublicView && !hasViewOnlyAccess;
   const canManageShares = !isReadOnlyPublicView; // Only owner can manage shares

  const flyingDates = new Set(
    displayEntries
      .filter((e: any) => e?.customDetails?.type === 'flight' || e.category === 'transport')
      .map((e: any) => e.date)
  );
  const flyingDaysCount = flyingDates.size;
  const totalFlightsCount = displayEntries.filter((e: any) => e?.customDetails?.type === 'flight').length;

  const activityDates = new Set(
    displayEntries
      .filter((e: any) => e.category === 'activity' || e?.customDetails?.type === 'activity')
      .map((e: any) => e.date)
  );

  const activityCountByDate = displayEntries.reduce((acc: Record<string, number>, e: any) => {
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

  const flightCountByDate = displayEntries.reduce((acc: Record<string, number>, e: any) => {
    if (isFlightEvent(e)) {
      acc[e.date] = (acc[e.date] || 0) + 1;
    }
    return acc;
  }, {});

  const totalEventCountByDate = displayEntries.reduce((acc: Record<string, number>, e: any) => {
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
    displayEntries
      .filter((e: any) => e.category === 'activity' || e.category === 'transport')
      .map((e: any) => e.date)
  );
  const cozyDaysCount = allTripDates.filter((date) => !activityOrJourneyDates.has(date)).length;

  const stayDates = new Set(
    displayEntries
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
    }
  }, [dispatch, id, token, navigate]);

   useEffect(() => {
     if (!token || !id || !itinerary) return;
     // Always fetch shares to check user's access level for shared itineraries
     dispatch(fetchShares(id));
   }, [dispatch, id, token, itinerary]);

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

    const sortedEntries = [...displayEntries].sort((a: any, b: any) => {
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

  const handleCopyPublicUrl = async () => {
    if (!itinerary?.isPublic) {
      window.alert('This itinerary is private. Make it public to share a public URL.');
      return;
    }

    const itineraryId = id || itinerary.id;
    if (!itineraryId) {
      window.alert('Unable to generate public URL.');
      return;
    }

    try {
      const publicUrl = `${window.location.origin}/itinerary/${itineraryId}?public=true`;
      await navigator.clipboard.writeText(publicUrl);
      window.alert('Public itinerary URL copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy public itinerary URL:', err);
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
    if (!canManageShares) {
      window.alert('Only the itinerary owner can grant access.');
      return;
    }
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
    if (!canManageShares) {
      window.alert('Only the itinerary owner can manage access.');
      return;
    }
    if (!id) return;
    try {
      await dispatch(updateShare({ itineraryId: id, shareId, access })).unwrap();
    } catch (err) {
      console.error('Failed to update share access:', err);
      window.alert('Failed to update access.');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!canManageShares) {
      window.alert('Only the itinerary owner can manage access.');
      return;
    }
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
    if (!canManageEntries) {
      window.alert('This public itinerary is read-only for non-owners.');
      return;
    }
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
    if (!canManageEntries) {
      window.alert('This public itinerary is read-only for non-owners.');
      return;
    }
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

  const handleDeleteEntryById = async (entryId: string) => {
    if (!canManageEntries) {
      window.alert('This public itinerary is read-only for non-owners.');
      return;
    }
    try {
      await dispatch(deleteEntry(entryId)).unwrap();
    } catch (err) {
      console.error('Failed to delete entry by id:', err);
      window.alert('Failed to delete one or more related transport entries. Please try again.');
    }
  };

    const handleDeleteEntry = async (entry: TripEntry) => {
      if (!canManageEntries) {
        window.alert('This public itinerary is read-only for non-owners.');
        return;
      }
      console.log('handleDeleteEntry called with:', entry);
      const details = entry.customDetails || {};
      console.log('Entry details:', details);
  
      if (details.type === 'hotel') {
        // Get hotel identifiers from the entry being deleted
        const hotelName = details.hotelName || entry.title.replace('Hotel: ', '');
        const checkInDate = details.checkInDate || entry.date;
        const checkOutDate = details.checkOutDate || entry.date;
  
        // Find all related hotel entries across the entire stay date range
        const relatedHotelEntries = entries.filter((e: any) => {
          const d = e.customDetails || {};
          if (d.type !== 'hotel') return false;
  
          const entryHotelName = d.hotelName || e.title.replace('Hotel: ', '');
          const entryCheckInDate = d.checkInDate || e.date;
          const entryCheckOutDate = d.checkOutDate || e.date;
  
          // Match all entries that belong to the same hotel stay
          return (
            entryHotelName === hotelName &&
            entryCheckInDate === checkInDate &&
            entryCheckOutDate === checkOutDate
          );
        });
  
        console.log('Hotel entries to delete:', relatedHotelEntries.map((e: any) => e.id));
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
          console.log('Hotel entries deleted successfully');
        } catch (err) {
          console.error('Failed to delete hotel stay entries:', err);
          window.alert('Failed to delete one or more hotel entries. Please try again.');
        }
        return;
      }

      if (details.type === 'flight' || entry.category === 'transport') {
        // Get flight identifiers from the entry being deleted
        const pnr = details.pnr;
        const outboundDate =
          details.leg === 'inbound' || details.leg === 'transit'
            ? details.linkedOutboundDate || entry.date
            : entry.date;
        const leg = details.leg || 'outbound';

        // Find all related flight entries for this transport trip
        const relatedFlightEntries = entries.filter((e: any) => {
          const d = e.customDetails || {};
          
          // Include both detailed flight types and simple transport category entries
          if (d.type !== 'flight' && e.category !== 'transport') return false;

          // Match entries that are part of the same transport booking by PNR
          if (pnr && d.pnr === pnr) {
            return true;
          }

          // If no PNR, match by linked date and leg
          if (d.leg === 'outbound' && e.date === outboundDate) {
            return true;
          }
          if (d.leg === 'inbound' && d.linkedOutboundDate === outboundDate) {
            return true;
          }
          if (d.leg === 'transit' && d.linkedOutboundDate === outboundDate) {
            return true;
          }

          // For simple transport entries (no detailed flight info), match same date and similar title/origin/destination
          if (!d.type && e.category === 'transport' && e.date === entry.date) {
            // Include this transport entry if it has no detailed type info
            return true;
          }

          return false;
        });

        const clickedEntryFromList = entries.find((e: any) => e.id === entry.id);
        const entriesToDelete = relatedFlightEntries.length
          ? relatedFlightEntries
          : clickedEntryFromList
            ? [clickedEntryFromList]
            : [entry];

        console.log('Transport entries to delete:', entriesToDelete.map((e: any) => e.id));
        const count = entriesToDelete.length;
        if (!window.confirm(`Delete this ${leg} flight and all ${count} related entries?`)) {
          return;
        }

        try {
          await Promise.all(
            entriesToDelete.map((flightEntry: any) =>
              dispatch(deleteEntry(flightEntry.id)).unwrap()
            )
          );
          console.log('Transport entries deleted successfully');
        } catch (err) {
          console.error('Failed to delete flight entries:', err);
          window.alert('Failed to delete one or more flight entries. Please try again.');
        }
        return;
      }

      console.log('Other entry type - single delete');
      if (window.confirm('Are you sure you want to delete this entry?')) {
        try {
          console.log('Dispatching deleteEntry for:', entry.id);
          await dispatch(deleteEntry(entry.id)).unwrap();
          console.log('Entry deleted successfully');
        } catch (err) {
          console.error('Failed to delete entry:', err);
          window.alert('Failed to delete entry. Please try again.');
        }
      }
    };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!canEditTrip) {
      window.alert('This public itinerary is read-only for non-owners.');
      return;
    }

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
    if (!canEditTrip) {
      window.alert('This public itinerary is read-only for non-owners.');
      return;
    }
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
    return <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-4 sm:mb-6 px-4 py-2 text-indigo-700 bg-indigo-50 rounded-full hover:bg-indigo-100 font-semibold transition text-sm sm:text-base"
      >
        ← Back to Dashboard
      </button>

      <div className="p-[1px] rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 mb-8 shadow-2xl shadow-violet-200/60">
        <div className="bg-white/95 backdrop-blur rounded-2xl p-4 sm:p-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent mb-2 break-words">
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
            {canEditTrip ? (
              <button
                onClick={() => {
                  setShowTripEditForm(!showTripEditForm);
                }}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full hover:from-violet-700 hover:to-fuchsia-700 font-semibold shadow-lg shadow-fuchsia-200 transition"
              >
                {showTripEditForm ? 'Cancel Trip Edit' : 'Edit Trip'}
              </button>
            ) : null}
            {canEditTrip ? (
              <button
                onClick={handleDeleteTrip}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-full hover:from-rose-600 hover:to-red-700 font-semibold shadow-lg shadow-rose-200 transition"
              >
                Delete Trip
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          {canEditTrip && showTripEditForm ? (
            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 mb-8">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            entries={displayEntries}
            startDate={itinerary.startDate}
            endDate={itinerary.endDate}
            canManageEntries={canManageEntries}
            onCreateEntries={handleCreateEntries}
            onUpdateEntry={handleUpdateEntry}
            onDelete={handleDeleteEntry}
            onDeleteEntryById={handleDeleteEntryById}
            isLoading={loading || isCreatingEntries}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="p-[1px] rounded-2xl bg-gradient-to-b from-cyan-400 via-violet-500 to-fuchsia-500 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl">
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
                <div id="share-export" className="p-3 rounded-xl bg-violet-50 border border-violet-100 space-y-3">
                  <p className="text-violet-700 font-semibold">Share & Export</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {itinerary.isPublic ? (
                      <button
                        type="button"
                        onClick={handleCopyPublicUrl}
                        className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto"
                      >
                        Copy Public URL
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleCopyFormattedText}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-violet-600 text-white hover:bg-violet-700 w-full sm:w-auto"
                    >
                      Copy Formatted Text
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-cyan-600 text-white hover:bg-cyan-700 w-full sm:w-auto"
                    >
                      Export PDF
                    </button>
                  </div>

                  {canManageShares ? (
                    <>
                      <form onSubmit={handleGrantShare} className="space-y-2">
                        <input
                          type="email"
                          placeholder="user@example.com"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded border border-violet-200"
                          required
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
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
                            className="px-3 py-2 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto"
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
                              <div className="flex flex-col sm:flex-row gap-2">
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
                    </>
                  ) : (
                    <p className="text-xs text-violet-600">Only the itinerary owner can grant or manage access.</p>
                  )}
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

