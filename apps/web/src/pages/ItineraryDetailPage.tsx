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
import { useToast } from '@/components/Toast';
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
  const { toast } = useToast();
  const { token, user } = useAppSelector((state) => state.auth);
  const { selected: itinerary, entries, shares, loading } = useAppSelector((state) => state.itineraries);
  const [showTripEditForm, setShowTripEditForm] = useState(false);
  const [isCreatingEntries, setIsCreatingEntries] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareAccess, setShareAccess] = useState<'view' | 'edit'>('view');
  const [hideDetails, setHideDetails] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [highlightedDates, setHighlightedDates] = useState<Set<string> | null>(null);
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

  // Date sets for filter highlighting
  const flyingDatesSet = flyingDates;
  const cozyDatesSet = new Set(allTripDates.filter((d) => !activityOrJourneyDates.has(d)));
  const noStayDatesSet = new Set(allTripDates.filter((d) => !stayDates.has(d)));
  const restDatesSet = new Set(allTripDates.filter((d) => !flyingDates.has(d) && !activityDates.has(d)));
  const hecticDatesSet = new Set(
    allTripDates.filter((date) => {
      const hasFlightAndEvents =
        (flightCountByDate[date] || 0) > 0 && (totalEventCountByDate[date] || 0) >= 2;
      const hasManyActivities = (activityCountByDate[date] || 0) > 4;
      return hasFlightAndEvents || hasManyActivities;
    })
  );

  const handleStatClick = (filterKey: string, dates: Set<string>) => {
    if (activeFilter === filterKey) {
      setActiveFilter(null);
      setHighlightedDates(null);
    } else {
      setActiveFilter(filterKey);
      setHighlightedDates(dates);
      const firstDate = allTripDates.find((d) => dates.has(d));
      if (firstDate) {
        setTimeout(() => {
          document.getElementById(`day-${firstDate}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 80);
      }
    }
  };

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
      toast('Itinerary copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast('Copy failed. Please try again.', 'error');
    }
  };

  const handleCopyPublicUrl = async () => {
    if (!itinerary?.isPublic) {
      toast('Make this trip public first to copy its public URL.', 'warning');
      return;
    }

    const itineraryId = id || itinerary.id;
    if (!itineraryId) {
      toast('Unable to generate public URL.', 'error');
      return;
    }

    try {
      const publicUrl = `${window.location.origin}/itinerary/${itineraryId}?public=true`;
      await navigator.clipboard.writeText(publicUrl);
      toast('Public URL copied!', 'success');
    } catch (err) {
      console.error('Failed to copy public itinerary URL:', err);
      toast('Copy failed. Please try again.', 'error');
    }
  };

  const handleExportPdf = () => {
    const content = buildFormattedText().replace(/\n/g, '<br/>');
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      toast('Allow popups to export PDF.', 'warning');
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
      toast('Only the owner can grant access.', 'warning');
      return;
    }
    if (!id || !shareEmail.trim()) {
      toast('Please enter an email address.', 'warning');
      return;
    }
    try {
      await dispatch(
        createShare({ itineraryId: id, email: shareEmail.trim(), access: shareAccess })
      ).unwrap();
      setShareEmail('');
      toast('Access granted!', 'success');
    } catch (err) {
      console.error('Failed to create share:', err);
      toast('Failed to grant access.', 'error');
    }
  };

  const handleShareAccessChange = async (shareId: string, access: 'view' | 'edit') => {
    if (!canManageShares) {
      toast('Only the owner can manage access.', 'warning');
      return;
    }
    if (!id) return;
    try {
      await dispatch(updateShare({ itineraryId: id, shareId, access })).unwrap();
      toast('Access updated.', 'success');
    } catch (err) {
      console.error('Failed to update share access:', err);
      toast('Failed to update access.', 'error');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!canManageShares) {
      toast('Only the owner can manage access.', 'warning');
      return;
    }
    if (!id) return;
    try {
      await dispatch(deleteShare({ itineraryId: id, shareId })).unwrap();
      toast('Access removed.', 'success');
    } catch (err) {
      console.error('Failed to remove share:', err);
      toast('Failed to remove access.', 'error');
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
      toast('This itinerary is read-only.', 'warning');
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
      toast('Failed to create one or more entries. Please try again.', 'error');
    } finally {
      setIsCreatingEntries(false);
    }
  };

  const handleUpdateEntry = async (entryId: string, updates: any) => {
    if (!canManageEntries) {
      toast('This itinerary is read-only.', 'warning');
      return;
    }
    try {
      await dispatch(updateEntry({
        id: entryId,
        updates,
      })).unwrap();
    } catch (err) {
      console.error('Failed to update entry:', err);
      toast('Failed to update entry. Please try again.', 'error');
    }
  };

  const handleDeleteEntryById = async (entryId: string) => {
    if (!canManageEntries) {
      toast('This itinerary is read-only.', 'warning');
      return;
    }
    try {
      await dispatch(deleteEntry(entryId)).unwrap();
    } catch (err) {
      console.error('Failed to delete entry by id:', err);
      toast('Failed to delete related entries. Please try again.', 'error');
    }
  };

    const handleDeleteEntry = async (entry: TripEntry) => {
      if (!canManageEntries) {
        toast('This itinerary is read-only.', 'warning');
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
        } catch (err) {
          console.error('Failed to delete hotel stay entries:', err);
          toast('Failed to delete one or more hotel entries. Please try again.', 'error');
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
        } catch (err) {
          console.error('Failed to delete flight entries:', err);
          toast('Failed to delete one or more flight entries. Please try again.', 'error');
        }
        return;
      }

      if (window.confirm('Are you sure you want to delete this entry?')) {
        try {
          await dispatch(deleteEntry(entry.id)).unwrap();
        } catch (err) {
          console.error('Failed to delete entry:', err);
          toast('Failed to delete entry. Please try again.', 'error');
        }
      }
    };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!canEditTrip) {
      toast('This itinerary is read-only.', 'warning');
      return;
    }

    if (tripForm.startDate > tripForm.endDate) {
      toast('End date must be on or after start date.', 'warning');
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
      toast('Trip updated!', 'success');
    } catch (err) {
      console.error('Failed to update itinerary:', err);
      toast('Failed to update trip. Please try again.', 'error');
    }
  };

  const handleDeleteTrip = async () => {
    if (!id) return;
    if (!canEditTrip) {
      toast('This itinerary is read-only.', 'warning');
      return;
    }
    if (!window.confirm('Delete this trip and all its entries? This cannot be undone.')) {
      return;
    }

    try {
      await dispatch(deleteItinerary(id)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete itinerary:', err);
      toast('Failed to delete trip. Please try again.', 'error');
    }
  };

  if (loading || !itinerary) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading trip…</p>
        </div>
      </div>
    );
  }

  const accessLabel = isOwner
    ? { label: 'Owner', bg: 'bg-violet-100', text: 'text-violet-700' }
    : userShareAccess === 'edit'
    ? { label: 'Editor', bg: 'bg-cyan-100', text: 'text-cyan-700' }
    : isReadOnlyPublicView
    ? { label: 'Public View', bg: 'bg-emerald-100', text: 'text-emerald-700' }
    : { label: 'Viewer', bg: 'bg-slate-100', text: 'text-slate-600' };

  return (
    <div className="min-h-screen bg-slate-50">
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-5 sm:mb-7 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-700 bg-violet-50 rounded-xl hover:bg-violet-100 border border-violet-200 transition-all"
      >
        ← Back to Dashboard
      </button>

      {/* Read-only banner */}
      {!canManageEntries && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <span className="text-base shrink-0">👁</span>
          <span className="font-medium">
            {isReadOnlyPublicView
              ? 'You are viewing a public itinerary in read-only mode.'
              : 'You have view-only access to this shared itinerary.'}
          </span>
        </div>
      )}

      {/* Trip header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card mb-8 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500" />
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent break-words leading-tight flex-1">
              {itinerary.title}
            </h1>
            <span className={`shrink-0 mt-1 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${accessLabel.bg} ${accessLabel.text}`}>
              {accessLabel.label}
            </span>
          </div>
          {itinerary.description && (
            <p className="text-slate-600 mb-4 leading-relaxed">{itinerary.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-100 text-violet-700 text-sm font-semibold">
              ✈️ {format(parseISO(itinerary.startDate), 'MMM dd, yyyy')} –{' '}
              {format(parseISO(itinerary.endDate), 'MMM dd, yyyy')}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold">
              {totalTripDays} day{totalTripDays !== 1 ? 's' : ''}
            </span>
            {itinerary.isPublic && (
              <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
                🌐 Public
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {canEditTrip && (
              <button
                onClick={() => setShowTripEditForm(!showTripEditForm)}
                className="btn-primary px-4 py-2 text-sm"
              >
                {showTripEditForm ? '✕ Cancel Edit' : '✏️ Edit Trip'}
              </button>
            )}
            {canEditTrip && (
              <button
                onClick={handleDeleteTrip}
                className="btn-danger px-4 py-2 text-sm"
              >
                🗑 Delete Trip
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          {canEditTrip && showTripEditForm && (
            <div className="bg-white rounded-2xl border border-violet-200 shadow-card mb-8 overflow-hidden animate-fade-in">
              <div className="px-5 py-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50">
                <h2 className="text-base font-bold text-slate-900">Edit Trip Details</h2>
              </div>
              <form onSubmit={handleUpdateTrip} className="p-5 space-y-4">
                <div>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={tripForm.title}
                    onChange={(e) => setTripForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={tripForm.description}
                    onChange={(e) => setTripForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      value={tripForm.startDate}
                      onChange={(e) => setTripForm((prev) => ({ ...prev, startDate: e.target.value }))}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      value={tripForm.endDate}
                      onChange={(e) => setTripForm((prev) => ({ ...prev, endDate: e.target.value }))}
                      required
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 sm:flex-none py-3"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating…
                      </span>
                    ) : (
                      'Update Trip'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTripEditForm(false)}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

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
            highlightedDates={highlightedDates ?? undefined}
          />
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card lg:sticky lg:top-20 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-fuchsia-50">
              <h3 className="font-black text-base bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">
                Trip Summary
              </h3>
            </div>
            <div className="p-4 space-y-2.5">
              {/* Total days - big */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
                <p className="text-xs font-semibold text-violet-200 mb-1">Total Trip</p>
                <p className="text-3xl font-black">{totalTripDays > 0 ? totalTripDays : 0}</p>
                <p className="text-violet-200 text-xs">days</p>
              </div>

              {/* Stat rows — clickable filters */}
              {[
                {
                  key: 'flying',
                  icon: '✈️',
                  label: `Flying — ${flyingDaysCount} ${flyingDaysCount === 1 ? 'day' : 'days'}`,
                  sub: `${totalFlightsCount} flight${totalFlightsCount !== 1 ? 's' : ''}`,
                  bg: 'bg-sky-50',
                  border: 'border-sky-100',
                  textColor: 'text-sky-700',
                  activeBg: 'bg-sky-500',
                  dates: flyingDatesSet,
                },
                {
                  key: 'cozy',
                  icon: '🛋️',
                  label: `Cozy days — ${cozyDaysCount}`,
                  sub: 'No activities or travel',
                  bg: 'bg-rose-50',
                  border: 'border-rose-100',
                  textColor: 'text-rose-700',
                  activeBg: 'bg-rose-500',
                  dates: cozyDatesSet,
                },
                {
                  key: 'nostay',
                  icon: '🌙',
                  label: `No stay — ${noStayDaysCount} ${noStayDaysCount === 1 ? 'day' : 'days'}`,
                  sub: 'Overnight travel days',
                  bg: 'bg-amber-50',
                  border: 'border-amber-100',
                  textColor: 'text-amber-700',
                  activeBg: 'bg-amber-500',
                  dates: noStayDatesSet,
                },
                {
                  key: 'rest',
                  icon: '😴',
                  label: `Rest days — ${restDaysCount}`,
                  sub: 'No flights or activities',
                  bg: 'bg-lime-50',
                  border: 'border-lime-100',
                  textColor: 'text-lime-700',
                  activeBg: 'bg-lime-500',
                  dates: restDatesSet,
                },
                {
                  key: 'hectic',
                  icon: '⚡',
                  label: `Hectic days — ${hecticDaysCount}`,
                  sub: 'Flights + multiple events',
                  bg: 'bg-orange-50',
                  border: 'border-orange-100',
                  textColor: 'text-orange-700',
                  activeBg: 'bg-orange-500',
                  dates: hecticDatesSet,
                },
              ].map((stat) => {
                const isActive = activeFilter === stat.key;
                const hasMatches = stat.dates.size > 0;
                return (
                  <button
                    key={stat.key}
                    type="button"
                    onClick={() => hasMatches && handleStatClick(stat.key, stat.dates)}
                    disabled={!hasMatches}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                      isActive
                        ? `${stat.activeBg} border-transparent shadow-md`
                        : `${stat.bg} ${stat.border} ${hasMatches ? 'hover:brightness-95 hover:shadow-sm cursor-pointer' : 'opacity-60 cursor-default'}`
                    }`}
                  >
                    <span className="text-base shrink-0">{stat.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : stat.textColor}`}>
                        {stat.label}
                      </p>
                      <p className={`text-[10px] leading-tight mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {stat.sub}
                      </p>
                    </div>
                    {hasMatches && (
                      <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/80 ' + stat.textColor
                      }`}>
                        {isActive ? '✕' : '▼'}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Share & Export */}
              {isOwner ? (
                <div id="share-export" className="pt-2 border-t border-slate-100 space-y-3 mt-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Share & Export
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.isPublic && (
                      <button
                        type="button"
                        onClick={handleCopyPublicUrl}
                        className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
                      >
                        Copy Public URL
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyFormattedText}
                      className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all"
                    >
                      Copy Text
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition-all"
                    >
                      Export PDF
                    </button>
                  </div>

                  <form onSubmit={handleGrantShare} className="space-y-2">
                    <input
                      type="email"
                      placeholder="Grant access: user@example.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-violet-400 text-slate-900 placeholder-slate-400 text-xs"
                      required
                    />
                    <div className="flex gap-2">
                      <select
                        value={shareAccess}
                        onChange={(e) => setShareAccess(e.target.value as 'view' | 'edit')}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      >
                        <option value="view">View only</option>
                        <option value="edit">Can edit</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-2 text-xs font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-all"
                      >
                        Grant
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2 max-h-44 overflow-auto">
                    {shares.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No shared users yet.</p>
                    ) : (
                      shares.map((share: any) => (
                        <div
                          key={share.id}
                          className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-2"
                        >
                          <p className="text-xs font-semibold text-slate-700 break-all">
                            {share.email}
                          </p>
                          <div className="flex gap-2">
                            <select
                              value={share.access}
                              onChange={(e) =>
                                handleShareAccessChange(share.id, e.target.value as 'view' | 'edit')
                              }
                              className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
                            >
                              <option value="view">View</option>
                              <option value="edit">Edit</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveShare(share.id)}
                              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (hasViewOnlyAccess || isReadOnlyPublicView) && itinerary.isPublic ? (
                <div id="share-export" className="pt-2 border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={handleCopyPublicUrl}
                    className="w-full px-3 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
                  >
                    Copy Public URL
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default ItineraryDetailPage;

