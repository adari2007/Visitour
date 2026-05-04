import React from 'react';
import { differenceInCalendarDays, eachDayOfInterval, format, parseISO } from 'date-fns';

interface Entry {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  description?: string;
  location?: string;
  timeStart?: string;
  timeEnd?: string;
  category: string;
  customDetails?: Record<string, any>;
}

interface EntriesListProps {
  entries: Entry[];
  startDate: string;
  endDate: string;
  canManageEntries?: boolean;
  onCreateEntries: (entries: any[]) => Promise<void>;
  onUpdateEntry: (id: string, updates: any) => Promise<void>;
  onDelete: (entry: Entry) => void;
  onDeleteEntryById?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

type ComposerType = 'flight' | 'hotel' | 'activity' | null;

const RequiredMark = () => (
  <span
    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xs font-bold"
    aria-hidden="true"
    title="Mandatory"
  >
    *
  </span>
);

const categoryColors: Record<string, string> = {
  accommodation: 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow',
  activity: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow',
  meal: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow',
  transport: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow',
  other: 'bg-gradient-to-r from-slate-500 to-gray-600 text-white shadow',
};

export function EntriesList({
  entries,
  startDate,
  endDate,
  canManageEntries = true,
  onCreateEntries,
  onUpdateEntry,
  onDelete,
  onDeleteEntryById,
  isLoading = false,
}: EntriesListProps) {
  const [expandedDays, setExpandedDays] = React.useState<Record<number, boolean>>({});
  const [expandedEntryDetails, setExpandedEntryDetails] = React.useState<Record<string, boolean>>({});
  const [headerAddPicker, setHeaderAddPicker] = React.useState<{
    dayNumber: number;
    date: string;
  } | null>(null);
  const [composer, setComposer] = React.useState<{
    mode: 'create' | 'edit';
    entryId?: string;
    type: ComposerType;
    dayNumber: number;
    date: string;
  } | null>(null);
   const [flightForm, setFlightForm] = React.useState({
     origin: '',
     destination: '',
     pnr: '',
     transportType: 'flight', // 'flight' | 'bus' | 'train' | 'other'
     customTransportType: '', // for 'other' option
     outboundFlightNumber: '',
     outboundDepartureTime: '',
     outboundArrivalTime: '',
     outboundDepartureTimezone: '',
     outboundArrivalTimezone: '',
     isRoundTrip: false,
     showOnAllDays: false, // show on all days for round trip
     returnDate: '',
     returnFlightNumber: '',
     returnDepartureTime: '',
     returnArrivalTime: '',
     returnDepartureTimezone: '',
     returnArrivalTimezone: '',
   });
  const [hotelForm, setHotelForm] = React.useState({
    hotelName: '',
    checkInDate: '',
    checkOutDate: '',
    checkInTime: '',
    checkOutTime: '',
    address: '',
    contactNumber: '',
    reservationNumber: '',
  });
  const [activityForm, setActivityForm] = React.useState({
    activityName: '',
    activityDate: '',
    startTime: '',
    endTime: '',
    address: '',
    contactNumber: '',
    confirmationNumber: '',
    notes: '',
  });

  const allDates = React.useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return eachDayOfInterval({ start, end });
  }, [startDate, endDate]);

   const sortedEntriesByDate = React.useMemo(() => {
     return entries.reduce(
       (acc, entry) => {
         if (!acc[entry.date]) {
           acc[entry.date] = [];
         }
         acc[entry.date].push(entry);
         return acc;
       },
       {} as Record<string, Entry[]>
     );
   }, [entries]);

   const entriesByDate = React.useMemo(() => {
     // Sort entries within each day
     const getCategoryOrder = (entry: Entry) => {
       const details = entry.customDetails || {};
       const type = details.type || entry.category;
       if (type === 'flight' || entry.category === 'transport') return 0;
       if (type === 'hotel' || entry.category === 'accommodation') return 1;
       return 2; // activity
     };

     const sortEntries = (dayEntries: Entry[]) => {
       return [...dayEntries].sort((a, b) => {
         const aHasTime = a.timeStart || a.timeEnd;
         const bHasTime = b.timeStart || b.timeEnd;

         // Entries with time come first, sorted by timeStart
         if (aHasTime && !bHasTime) return -1;
         if (!aHasTime && bHasTime) return 1;
         if (aHasTime && bHasTime) {
           const aTime = a.timeStart || a.timeEnd || '';
           const bTime = b.timeStart || b.timeEnd || '';
           if (aTime !== bTime) return aTime.localeCompare(bTime);
         }

         // Both have no time: sort by category (Flight → Hotel → Activity)
         const aCategoryOrder = getCategoryOrder(a);
         const bCategoryOrder = getCategoryOrder(b);
         if (aCategoryOrder !== bCategoryOrder) return aCategoryOrder - bCategoryOrder;

         // Same category: sort alphabetically by title
         return (a.title || '').localeCompare(b.title || '');
       });
     };

     const sorted: Record<string, Entry[]> = {};
     Object.keys(sortedEntriesByDate).forEach((date) => {
       sorted[date] = sortEntries(sortedEntriesByDate[date]);
     });
     return sorted;
   }, [sortedEntriesByDate]);

  const dayNumberFromDate = React.useCallback(
    (date: string) => {
      return differenceInCalendarDays(parseISO(date), parseISO(startDate)) + 1;
    },
    [startDate]
  );

   const openComposer = (type: Exclude<ComposerType, null>, dayNumber: number, date: string) => {
     if (!canManageEntries) {
       window.alert('You do not have permission to add entries to this itinerary. Only users with edit access can add entries.');
       return;
     }
     setComposer({ mode: 'create', type, dayNumber, date });

     if (type === 'flight') {
       setFlightForm({
         origin: '',
         destination: '',
         pnr: '',
         transportType: 'flight',
         customTransportType: '',
         outboundFlightNumber: '',
         outboundDepartureTime: '',
         outboundArrivalTime: '',
         outboundDepartureTimezone: '',
         outboundArrivalTimezone: '',
         isRoundTrip: false,
         showOnAllDays: false,
         returnDate: date,
         returnFlightNumber: '',
         returnDepartureTime: '',
         returnArrivalTime: '',
         returnDepartureTimezone: '',
         returnArrivalTimezone: '',
       });
     }

    if (type === 'hotel') {
      setHotelForm({
        hotelName: '',
        checkInDate: date,
        checkOutDate: date,
        checkInTime: '',
        checkOutTime: '',
        address: '',
        contactNumber: '',
        reservationNumber: '',
      });
    }

    if (type === 'activity') {
      setActivityForm({
        activityName: '',
        activityDate: date,
        startTime: '',
        endTime: '',
        address: '',
        contactNumber: '',
        confirmationNumber: '',
        notes: '',
      });
    }
  };

   const openComposerForEdit = (entry: Entry) => {
     if (!canManageEntries) {
       window.alert('You do not have permission to edit entries in this itinerary. Only users with edit access can edit entries.');
       return;
     }
     const details = entry.customDetails || {};
    const type = (details.type as ComposerType) ||
      (entry.category === 'transport'
        ? 'flight'
        : entry.category === 'accommodation'
          ? 'hotel'
          : 'activity');

    if (!type) return;

    setComposer({
      mode: 'edit',
      entryId: entry.id,
      type,
      dayNumber: entry.dayNumber,
      date: entry.date,
    });

     if (type === 'flight') {
       const isCurrentOutbound = details.leg !== 'inbound';
       const outboundDate = isCurrentOutbound ? entry.date : details.linkedOutboundDate || entry.date;
       const linkedInbound = entries.find(
         (e) =>
           e.id !== entry.id &&
           e.customDetails?.type === 'flight' &&
           e.customDetails?.leg === 'inbound' &&
           e.customDetails?.linkedOutboundDate === outboundDate
       );

       setFlightForm({
         origin: details.origin || '',
         destination: details.destination || '',
         pnr: details.pnr || '',
         transportType: details.transportType || 'flight',
         customTransportType: details.customTransportType || '',
         outboundFlightNumber: details.flightNumber || '',
         outboundDepartureTime: details.departureTime || entry.timeStart || '',
         outboundArrivalTime: details.arrivalTime || entry.timeEnd || '',
         outboundDepartureTimezone: details.departureTimezone || '',
         outboundArrivalTimezone: details.arrivalTimezone || '',
         isRoundTrip: Boolean(linkedInbound),
         showOnAllDays: details.showOnAllDays || false,
         returnDate: linkedInbound?.date || entry.date,
         returnFlightNumber: linkedInbound?.customDetails?.flightNumber || '',
         returnDepartureTime:
           linkedInbound?.customDetails?.departureTime || linkedInbound?.timeStart || '',
         returnArrivalTime:
           linkedInbound?.customDetails?.arrivalTime || linkedInbound?.timeEnd || '',
         returnDepartureTimezone: linkedInbound?.customDetails?.departureTimezone || '',
         returnArrivalTimezone: linkedInbound?.customDetails?.arrivalTimezone || '',
       });
     }

    if (type === 'hotel') {
      const hotelName = details.hotelName || entry.title.replace('Hotel: ', '');
      const checkInDate = details.checkInDate || entry.date;
      const checkOutDate = details.checkOutDate || entry.date;

      const linkedHotelEntries = entries.filter((e) => {
        const d = e.customDetails || {};
        return (
          d.type === 'hotel' &&
          (d.hotelName || e.title.replace('Hotel: ', '')) === hotelName &&
          (d.checkInDate || e.date) === checkInDate &&
          (d.checkOutDate || e.date) === checkOutDate
        );
      });

      const checkInEntry = linkedHotelEntries.find((e) => e.date === checkInDate);
      const checkOutEntry = linkedHotelEntries.find((e) => e.date === checkOutDate);

      setHotelForm({
        hotelName,
        checkInDate,
        checkOutDate,
        checkInTime: details.checkInTime || checkInEntry?.timeStart || entry.timeStart || '',
        checkOutTime: details.checkOutTime || checkOutEntry?.timeEnd || entry.timeEnd || '',
        address: details.address || entry.location || '',
        contactNumber: details.contactNumber || '',
        reservationNumber: details.reservationNumber || '',
      });
    }

    if (type === 'activity') {
      setActivityForm({
        activityName: details.activityName || entry.title.replace('Activity: ', ''),
        activityDate: details.startDate || details.endDate || entry.date,
        startTime: entry.timeStart || '',
        endTime: entry.timeEnd || '',
        address: details.address || entry.location || '',
        contactNumber: details.contactNumber || '',
        confirmationNumber: details.confirmationNumber || '',
        notes: entry.description || '',
      });
    }
  };

  const closeComposer = () => {
    setComposer(null);
  };

  const buildDatesInRange = (rangeStart: string, rangeEnd: string) => {
    return eachDayOfInterval({
      start: parseISO(rangeStart),
      end: parseISO(rangeEnd),
    }).map((d) => format(d, 'yyyy-MM-dd'));
  };

   const handleCreateFlight = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!composer || composer.type !== 'flight') return;

     if (!flightForm.origin || !flightForm.destination) {
       window.alert('Please provide Origin and Destination.');
       return;
     }

     if (flightForm.isRoundTrip && !flightForm.returnDate) {
       window.alert('Please select return date for round trip.');
       return;
     }

     const transportTypeDisplay = flightForm.transportType === 'other' 
       ? flightForm.customTransportType 
       : flightForm.transportType.charAt(0).toUpperCase() + flightForm.transportType.slice(1);

     const outboundEntry = {
       dayNumber: composer.dayNumber,
       date: composer.date,
       title: `${transportTypeDisplay}: ${flightForm.origin} -> ${flightForm.destination}`,
       description: flightForm.pnr
         ? `PNR: ${flightForm.pnr}`
         : flightForm.outboundFlightNumber
           ? `#: ${flightForm.outboundFlightNumber}`
           : `${transportTypeDisplay} segment`,
       location: '',
       timeStart: flightForm.outboundDepartureTime || undefined,
       timeEnd: flightForm.outboundArrivalTime || undefined,
       category: 'transport',
       customDetails: {
         type: 'flight',
         leg: 'outbound',
         transportType: flightForm.transportType,
         customTransportType: flightForm.customTransportType,
         origin: flightForm.origin,
         destination: flightForm.destination,
         pnr: flightForm.pnr,
         flightNumber: flightForm.outboundFlightNumber || '',
         departureTime: flightForm.outboundDepartureTime || '',
         arrivalTime: flightForm.outboundArrivalTime || '',
         departureTimezone: flightForm.outboundDepartureTimezone || '',
         arrivalTimezone: flightForm.outboundArrivalTimezone || '',
         showOnAllDays: flightForm.isRoundTrip && flightForm.showOnAllDays ? true : false,
       },
     };

     const entriesToCreate: any[] = [outboundEntry];

     // If showOnAllDays is enabled for round trip, add entry for all days between outbound and return
     if (flightForm.isRoundTrip && flightForm.showOnAllDays && flightForm.returnDate) {
       const allDaysInTrip = buildDatesInRange(composer.date, flightForm.returnDate);
       
       allDaysInTrip.forEach((date) => {
         if (date !== composer.date && date !== flightForm.returnDate) {
           entriesToCreate.push({
             dayNumber: dayNumberFromDate(date),
             date,
             title: `${transportTypeDisplay}: ${flightForm.origin} -> ${flightForm.destination}`,
             description: `${transportTypeDisplay} in transit`,
             location: '',
             timeStart: undefined,
             timeEnd: undefined,
             category: 'transport',
             customDetails: {
               type: 'flight',
               leg: 'transit',
               transportType: flightForm.transportType,
               customTransportType: flightForm.customTransportType,
               origin: flightForm.origin,
               destination: flightForm.destination,
               pnr: flightForm.pnr,
               linkedOutboundDate: composer.date,
               showOnAllDays: true,
             },
           });
         }
       });
     }

     if (flightForm.isRoundTrip && flightForm.returnDate) {
       entriesToCreate.push({
         dayNumber: dayNumberFromDate(flightForm.returnDate),
         date: flightForm.returnDate,
         title: `${transportTypeDisplay}: ${flightForm.destination} -> ${flightForm.origin}`,
         description: flightForm.pnr
           ? `PNR: ${flightForm.pnr}`
           : flightForm.returnFlightNumber
             ? `#: ${flightForm.returnFlightNumber}`
             : `Return ${transportTypeDisplay} segment`,
         location: '',
         timeStart: flightForm.returnDepartureTime || undefined,
         timeEnd: flightForm.returnArrivalTime || undefined,
         category: 'transport',
         customDetails: {
           type: 'flight',
           leg: 'inbound',
           transportType: flightForm.transportType,
           customTransportType: flightForm.customTransportType,
           origin: flightForm.destination,
           destination: flightForm.origin,
           pnr: flightForm.pnr,
           flightNumber: flightForm.returnFlightNumber || '',
           departureTime: flightForm.returnDepartureTime || '',
           arrivalTime: flightForm.returnArrivalTime || '',
           departureTimezone: flightForm.returnDepartureTimezone || '',
           arrivalTimezone: flightForm.returnArrivalTimezone || '',
           linkedOutboundDate: composer.date,
           showOnAllDays: flightForm.showOnAllDays ? true : false,
         },
       });
     }

     await onCreateEntries(entriesToCreate);
     closeComposer();
   };

   const handleUpsertFlight = async (e: React.FormEvent) => {
     if (composer?.mode === 'edit') {
       e.preventDefault();
       if (!composer.entryId) return;

       if (!flightForm.origin || !flightForm.destination) {
         window.alert('Please provide Origin and Destination.');
         return;
       }

        if (flightForm.isRoundTrip && !flightForm.returnDate) {
          window.alert('Please select return date for round trip.');
          return;
        }

       const transportTypeDisplay = flightForm.transportType === 'other' 
         ? flightForm.customTransportType 
         : flightForm.transportType.charAt(0).toUpperCase() + flightForm.transportType.slice(1);

       const currentEntry = entries.find(e => e.id === composer.entryId);
       const details = currentEntry?.customDetails || {};
        const outboundDate =
          details.leg === 'inbound' || details.leg === 'transit'
            ? details.linkedOutboundDate || currentEntry?.date || composer.date
            : currentEntry?.date || composer.date;

        const relatedTransportEntries = entries.filter((e) => {
         const d = e.customDetails || {};
         if (d.type !== 'flight') return false;

          if (flightForm.pnr && d.pnr === flightForm.pnr) {
            return true;
          }

          if (d.leg === 'outbound' && !d.linkedOutboundDate) {
           return e.date === outboundDate;
         }
         if (d.leg === 'inbound' && d.linkedOutboundDate === outboundDate) {
           return true;
         }
         if (d.leg === 'transit' && d.linkedOutboundDate === outboundDate) {
           return true;
         }
         if (d.leg === 'outbound' && e.date === outboundDate) {
           return true;
         }
         return false;
       });

        const fallbackCurrent = currentEntry || entries.find((e) => e.id === composer.entryId);
        const entriesInScope =
          relatedTransportEntries.length > 0
            ? relatedTransportEntries
            : fallbackCurrent
              ? [fallbackCurrent]
              : [];

        type LegType = 'outbound' | 'transit' | 'inbound';
        type ExpectedEntry = { leg: LegType; date: string };

        const expectedEntries: ExpectedEntry[] = [{ leg: 'outbound', date: outboundDate }];

        if (flightForm.isRoundTrip && flightForm.returnDate) {
          if (flightForm.showOnAllDays) {
            const allDays = buildDatesInRange(outboundDate, flightForm.returnDate);
            allDays.forEach((date) => {
              if (date !== outboundDate && date !== flightForm.returnDate) {
                expectedEntries.push({ leg: 'transit', date });
              }
            });
          }
          expectedEntries.push({ leg: 'inbound', date: flightForm.returnDate });
        }

        const keyedExisting = new Map<string, Entry[]>();
        entriesInScope.forEach((entry) => {
          const leg = (entry.customDetails?.leg || 'outbound') as LegType;
          const key = `${leg}:${entry.date}`;
          const list = keyedExisting.get(key) || [];
          list.push(entry);
          keyedExisting.set(key, list);
        });

        const buildFlightPayload = (leg: LegType, date: string) => {
          const isOutbound = leg === 'outbound';
          const isTransit = leg === 'transit';
          const isInbound = leg === 'inbound';
          const isMultiDayShown = flightForm.isRoundTrip && flightForm.showOnAllDays;

          return {
            date,
            dayNumber: dayNumberFromDate(date),
            title: isInbound
              ? `${transportTypeDisplay}: ${flightForm.destination} -> ${flightForm.origin}`
              : `${transportTypeDisplay}: ${flightForm.origin} -> ${flightForm.destination}`,
            description: flightForm.pnr
              ? `PNR: ${flightForm.pnr}`
              : isOutbound && flightForm.outboundFlightNumber
                ? `#: ${flightForm.outboundFlightNumber}`
                : isInbound && flightForm.returnFlightNumber
                  ? `#: ${flightForm.returnFlightNumber}`
                  : isTransit
                    ? `${transportTypeDisplay} in transit`
                    : isInbound
                      ? `Return ${transportTypeDisplay} segment`
                      : `${transportTypeDisplay} segment`,
            location: '',
            timeStart: isOutbound
              ? flightForm.outboundDepartureTime || undefined
              : isInbound
                ? flightForm.returnDepartureTime || undefined
                : undefined,
            timeEnd: isOutbound
              ? flightForm.outboundArrivalTime || undefined
              : isInbound
                ? flightForm.returnArrivalTime || undefined
                : undefined,
            category: 'transport',
            customDetails: {
              type: 'flight',
              leg,
              transportType: flightForm.transportType,
              customTransportType: flightForm.customTransportType,
              origin: isInbound ? flightForm.destination : flightForm.origin,
              destination: isInbound ? flightForm.origin : flightForm.destination,
              pnr: flightForm.pnr,
              flightNumber: isOutbound
                ? flightForm.outboundFlightNumber || ''
                : isInbound
                  ? flightForm.returnFlightNumber || ''
                  : '',
              departureTime: isOutbound
                ? flightForm.outboundDepartureTime || ''
                : isInbound
                  ? flightForm.returnDepartureTime || ''
                  : '',
              arrivalTime: isOutbound
                ? flightForm.outboundArrivalTime || ''
                : isInbound
                  ? flightForm.returnArrivalTime || ''
                  : '',
              departureTimezone: isOutbound
                ? flightForm.outboundDepartureTimezone || ''
                : isInbound
                  ? flightForm.returnDepartureTimezone || ''
                  : '',
              arrivalTimezone: isOutbound
                ? flightForm.outboundArrivalTimezone || ''
                : isInbound
                  ? flightForm.returnArrivalTimezone || ''
                  : '',
              linkedOutboundDate: isOutbound ? undefined : outboundDate,
              showOnAllDays: isTransit ? true : isMultiDayShown,
            },
          };
        };

        const updates: Promise<void>[] = [];
        const creates: any[] = [];

        expectedEntries.forEach(({ leg, date }) => {
          const key = `${leg}:${date}`;
          const candidates = keyedExisting.get(key) || [];
          const existing = candidates.shift();
          if (candidates.length > 0) {
            keyedExisting.set(key, candidates);
          } else {
            keyedExisting.delete(key);
          }

          const payload = buildFlightPayload(leg, date);
          if (existing) {
            updates.push(onUpdateEntry(existing.id, payload));
          } else {
            creates.push(payload);
          }
        });

        const staleEntries = Array.from(keyedExisting.values()).flat();

        if (updates.length > 0) {
          await Promise.all(updates);
        }
        if (creates.length > 0) {
          await onCreateEntries(creates);
        }
        if (onDeleteEntryById && staleEntries.length > 0) {
          await Promise.all(staleEntries.map((entry) => onDeleteEntryById(entry.id)));
        }

       closeComposer();
       return;
     }

     await handleCreateFlight(e);
   };

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composer || composer.type !== 'hotel') return;

    if (!hotelForm.hotelName || !hotelForm.checkInDate || !hotelForm.checkOutDate) {
      window.alert('Please provide Hotel Name, Check-in Date, and Check-out Date.');
      return;
    }

    if (hotelForm.checkOutDate < hotelForm.checkInDate) {
      window.alert('Check-out date must be on or after check-in date.');
      return;
    }

    const dates = buildDatesInRange(hotelForm.checkInDate, hotelForm.checkOutDate);
    const entriesToCreate = dates.map((date) => ({
      dayNumber: dayNumberFromDate(date),
      date,
      title: `Hotel: ${hotelForm.hotelName}`,
      description: hotelForm.reservationNumber
        ? `Reservation: ${hotelForm.reservationNumber}`
        : 'Hotel stay',
      location: hotelForm.address || undefined,
      timeStart: date === hotelForm.checkInDate ? hotelForm.checkInTime || undefined : undefined,
      timeEnd: date === hotelForm.checkOutDate ? hotelForm.checkOutTime || undefined : undefined,
      category: 'accommodation',
      customDetails: {
        type: 'hotel',
        hotelName: hotelForm.hotelName,
        checkInDate: hotelForm.checkInDate,
        checkOutDate: hotelForm.checkOutDate,
        checkInTime: hotelForm.checkInTime || '',
        checkOutTime: hotelForm.checkOutTime || '',
        address: hotelForm.address,
        contactNumber: hotelForm.contactNumber,
        reservationNumber: hotelForm.reservationNumber,
      },
    }));

    await onCreateEntries(entriesToCreate);
    closeComposer();
  };

   const handleUpsertHotel = async (e: React.FormEvent) => {
     if (composer?.mode === 'edit') {
       e.preventDefault();
       if (!composer.entryId) return;
 
       if (!hotelForm.hotelName || !hotelForm.checkInDate || !hotelForm.checkOutDate) {
         window.alert('Please provide Hotel Name, Check-in Date, and Check-out Date.');
         return;
       }
 
       // Find all related hotel entries with the same stay details
       const relatedHotelEntries = entries.filter((e) => {
         const d = e.customDetails || {};
         return (
           d.type === 'hotel' &&
           (d.hotelName || e.title.replace('Hotel: ', '')) === hotelForm.hotelName &&
           (d.checkInDate || e.date) === hotelForm.checkInDate &&
           (d.checkOutDate || e.date) === hotelForm.checkOutDate
         );
       });
 
       // Update all related hotel entries with new details
       const customDetails = {
         type: 'hotel',
         hotelName: hotelForm.hotelName,
         checkInDate: hotelForm.checkInDate,
         checkOutDate: hotelForm.checkOutDate,
         checkInTime: hotelForm.checkInTime || '',
         checkOutTime: hotelForm.checkOutTime || '',
         address: hotelForm.address,
         contactNumber: hotelForm.contactNumber,
         reservationNumber: hotelForm.reservationNumber,
       };
 
       // Update each related entry
       await Promise.all(
         relatedHotelEntries.map((entry) => {
           const isCheckInDay = entry.date === hotelForm.checkInDate;
           const isCheckOutDay = entry.date === hotelForm.checkOutDate;
 
           return onUpdateEntry(entry.id, {
             date: entry.date,
             dayNumber: entry.dayNumber,
             title: `Hotel: ${hotelForm.hotelName}`,
             description: hotelForm.reservationNumber
               ? `Reservation: ${hotelForm.reservationNumber}`
               : 'Hotel stay',
             location: hotelForm.address || undefined,
             timeStart: isCheckInDay ? hotelForm.checkInTime || undefined : undefined,
             timeEnd: isCheckOutDay ? hotelForm.checkOutTime || undefined : undefined,
             category: 'accommodation',
             customDetails,
           });
         })
       );
 
       closeComposer();
       return;
     }
 
     await handleCreateHotel(e);
   };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composer || composer.type !== 'activity') return;

    if (!activityForm.activityName) {
      window.alert('Please provide Activity Name.');
      return;
    }

    const activityDate = composer.date;

    const entry = {
      dayNumber: dayNumberFromDate(activityDate),
      date: activityDate,
      title: `Activity: ${activityForm.activityName}`,
      description: activityForm.notes || 'Planned activity',
      location: activityForm.address || undefined,
      timeStart: activityForm.startTime || undefined,
      timeEnd: activityForm.endTime || undefined,
      category: 'activity',
      customDetails: {
        type: 'activity',
        activityName: activityForm.activityName,
        startDate: activityDate,
        endDate: activityDate,
        address: activityForm.address,
        contactNumber: activityForm.contactNumber,
        confirmationNumber: activityForm.confirmationNumber,
      },
    };

    await onCreateEntries([entry]);
    closeComposer();
  };

  const handleUpsertActivity = async (e: React.FormEvent) => {
    if (composer?.mode === 'edit') {
      e.preventDefault();
      if (!composer.entryId) return;

      if (!activityForm.activityName) {
        window.alert('Please provide Activity Name.');
        return;
      }

      const activityDate = composer.date;

      await onUpdateEntry(composer.entryId, {
        date: activityDate,
        dayNumber: dayNumberFromDate(activityDate),
        title: `Activity: ${activityForm.activityName}`,
        description: activityForm.notes || 'Planned activity',
        location: activityForm.address || undefined,
        timeStart: activityForm.startTime || undefined,
        timeEnd: activityForm.endTime || undefined,
        category: 'activity',
        customDetails: {
          type: 'activity',
          activityName: activityForm.activityName,
          startDate: activityDate,
          endDate: activityDate,
          address: activityForm.address,
          contactNumber: activityForm.contactNumber,
          confirmationNumber: activityForm.confirmationNumber,
        },
      });
      closeComposer();
      return;
    }

    await handleCreateActivity(e);
  };

  React.useEffect(() => {
    if (allDates.length === 0) {
      setExpandedDays({});
      return;
    }

    setExpandedDays((prev) => {
      const next: Record<number, boolean> = {};
      allDates.forEach((_, index) => {
        const dayNumber = index + 1;
        next[dayNumber] = prev[dayNumber] ?? dayNumber === 1;
      });
      return next;
    });
  }, [allDates]);

  const toggleDay = (dayNumber: number) => {
    setHeaderAddPicker(null);
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
  };

   const handleAddEntryFromHeader = (dayNumber: number, date: string) => {
     if (!canManageEntries) {
       window.alert('You do not have permission to add entries to this itinerary. Only users with edit access can add entries.');
       return;
     }
     setHeaderAddPicker((prev) =>
       prev?.dayNumber === dayNumber ? null : { dayNumber, date }
     );
   };

   const handleAddEntryTypeFromHeader = (
     dayNumber: number,
     date: string,
     type: Exclude<ComposerType, null>
   ) => {
     if (!canManageEntries) {
       window.alert('You do not have permission to add entries to this itinerary. Only users with edit access can add entries.');
       return;
     }
     setHeaderAddPicker(null);
     setExpandedDays((prev) => ({ ...prev, [dayNumber]: true }));
     openComposer(type, dayNumber, date);
   };

  const toggleEntryDetails = (entryId: string) => {
    setExpandedEntryDetails((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  const getEntryIcon = (entry: Entry) => {
    const details = entry.customDetails || {};
    if (details.type === 'flight' || entry.category === 'transport') return '✈️';
    if (details.type === 'hotel' || entry.category === 'accommodation') return '🏨';
    if (details.type === 'activity' || entry.category === 'activity') return '🎯';
    return '🧭';
  };

  const renderEntryConciseHeader = (entry: Entry) => {
    const details = entry.customDetails || {};
    const icon = getEntryIcon(entry);

    if (details.type === 'flight') {
      const legLabel = details.leg === 'inbound' ? 'Return Flight' : 'Flight';
      const route = details.origin && details.destination ? `${details.origin} -> ${details.destination}` : entry.title;
      const flightNo = details.flightNumber ? ` | #${details.flightNumber}` : '';
      return `${icon} ${legLabel}: ${route}${flightNo}`;
    }

    if (details.type === 'hotel') {
      const hotelName = details.hotelName || entry.title.replace('Hotel: ', '');
      const stayRange =
        details.checkInDate && details.checkOutDate
          ? ` (${details.checkInDate} to ${details.checkOutDate})`
          : '';
      return `${icon} Hotel: ${hotelName}${stayRange}`;
    }

    return `${icon} ${entry.title}`;
  };

  const renderEntryTimeSummary = (entry: Entry) => {
    if (entry.timeStart && entry.timeEnd) {
      return `${entry.timeStart} - ${entry.timeEnd}`;
    }
    if (entry.timeStart) {
      return `Starts ${entry.timeStart}`;
    }
    if (entry.timeEnd) {
      return `Until ${entry.timeEnd}`;
    }
    return 'Time not set';
  };

   const renderFlightDetails = (entry: Entry) => {
     const details = entry.customDetails || {};
     if (details.type !== 'flight') return null;

     const legLabel = details.leg === 'inbound' ? 'Return' : 'Outbound';
     const route = details.origin && details.destination ? `${details.origin} -> ${details.destination}` : '';
     const departureMeta = details.departureTimezone ? `${entry.timeStart || ''} (${details.departureTimezone})` : entry.timeStart || '';
     const arrivalMeta = details.arrivalTimezone ? `${entry.timeEnd || ''} (${details.arrivalTimezone})` : entry.timeEnd || '';

     return (
       <div className="mb-2 text-sm text-gray-700 space-y-1">
         <p className="font-medium text-gray-800">✈️ {legLabel}</p>
         {route && <p>Route: {route}</p>}
         {details.flightNumber && <p>{legLabel} #: {details.flightNumber}</p>}
         {details.pnr && <p>Reservation PNR: {details.pnr}</p>}
         {(entry.timeStart || details.departureTimezone) && <p>Departure: {departureMeta || '-'}</p>}
         {(entry.timeEnd || details.arrivalTimezone) && <p>Arrival: {arrivalMeta || '-'}</p>}
       </div>
     );
   };

  const renderHotelDetails = (entry: Entry) => {
    const details = entry.customDetails || {};
    if (details.type !== 'hotel') return null;

    const isCheckInDay = details.checkInDate === entry.date;
    const isCheckOutDay = details.checkOutDate === entry.date;
    const isMiddleStayDay = !isCheckInDay && !isCheckOutDay;
    const nightsRemaining =
      details.checkOutDate && entry.date
        ? Math.max(
            differenceInCalendarDays(parseISO(details.checkOutDate), parseISO(entry.date)),
            0
          )
        : null;

    return (
      <div className="mb-2 text-sm text-gray-700 space-y-1">
        {details.hotelName && <p className="font-medium text-gray-800">🏨 {details.hotelName}</p>}
        {details.address && <p>Address: {details.address}</p>}
        {details.contactNumber && <p>Contact: {details.contactNumber}</p>}
        {details.reservationNumber && <p>Reservation: {details.reservationNumber}</p>}
        {details.checkInDate && <p>Check-in Date: {details.checkInDate}</p>}
        {details.checkOutDate && <p>Check-out Date: {details.checkOutDate}</p>}
        {isCheckInDay && entry.timeStart && <p>Check-in Time: {entry.timeStart}</p>}
        {isCheckOutDay && entry.timeEnd && <p>Check-out Time: {entry.timeEnd}</p>}
        {nightsRemaining !== null && !isCheckOutDay && (
          <p>
            {nightsRemaining} {nightsRemaining === 1 ? 'night' : 'nights'} remaining
          </p>
        )}
        {isMiddleStayDay && <p className="italic text-gray-600">Enjoy the cozy stay</p>}
      </div>
    );
  };

   const summarizeEntryForDayHeader = (entry: Entry) => {
     const details = entry.customDetails || {};

     if (details.type === 'flight') {
       const from = details.origin || 'Airport';
       const to = details.destination || 'Airport';
       return `✈️ Travelling From ${from} to ${to}`;
     }

     if (details.type === 'hotel') {
       const hotelName = details.hotelName || 'hotel';
       return `🏨 Staying at ${hotelName}`;
     }

     if (details.type === 'activity') {
       const activityName = details.activityName || entry.title.replace('Activity: ', '');
       return `🎯 Activity: ${activityName}`;
     }

     if (entry.category === 'transport') return `✈️ Travelling: ${entry.title}`;
     if (entry.category === 'accommodation') return `🏨 Stay: ${entry.title}`;
     return `${getEntryIcon(entry)} ${entry.title}`;
   };

  return (
    <div className="space-y-6">
      {allDates.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No trip days found. Please check trip dates.</p>
      ) : (
        allDates.map((dateObj, index) => {
          const dayNumber = index + 1;
          const dateKey = format(dateObj, 'yyyy-MM-dd');
          const dayEntries = entriesByDate[dateKey] || [];
          const isExpanded = expandedDays[dayNumber] ?? false;
          const isPickerOpen = headerAddPicker?.dayNumber === dayNumber;
          const entryPreview =
            dayEntries.length === 0
              ? 'No entries yet'
              : dayEntries.length <= 3
                ? dayEntries.map((e) => summarizeEntryForDayHeader(e)).join(' • ')
                : `${dayEntries
                    .slice(0, 2)
                    .map((e) => summarizeEntryForDayHeader(e))
                    .join(' • ')} • +${dayEntries.length - 2} more`;

          return (
            <div
              key={dateKey}
              className={`relative bg-white/95 backdrop-blur border border-violet-100 rounded-2xl overflow-visible shadow-lg shadow-violet-100/60 ${
                isPickerOpen ? 'z-50' : 'z-0'
              }`}
            >
              <div className="w-full px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left hover:bg-violet-50/60 transition">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleDay(dayNumber)}
                    className="mt-0.5 w-7 h-7 inline-flex items-center justify-center text-sm font-bold bg-violet-100 text-violet-700 rounded-full"
                    aria-label={isExpanded ? 'Collapse day' : 'Expand day'}
                  >
                    {isExpanded ? '-' : '+'}
                  </button>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-violet-900">
                      Day {dayNumber} - {format(dateObj, 'MMM dd, yyyy')}
                    </h3>
                    <p className="text-sm text-violet-600 truncate max-w-[16rem] sm:max-w-[38rem]">{entryPreview}</p>
                  </div>
                </div>

                {!isExpanded && (
                  <div className="relative self-end sm:self-auto">
                    {canManageEntries ? (
                      <button
                        type="button"
                        onClick={() => handleAddEntryFromHeader(dayNumber, dateKey)}
                        className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full hover:from-violet-600 hover:to-fuchsia-600"
                      >
                        + Add Entry
                      </button>
                    ) : null}

                    {canManageEntries && headerAddPicker?.dayNumber === dayNumber && (
                      <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-violet-200 bg-white p-2 shadow-2xl">
                        <p className="px-2 pb-2 text-[11px] font-semibold text-violet-700">Choose entry type</p>
                        <button
                          type="button"
                          onClick={() => handleAddEntryTypeFromHeader(dayNumber, dateKey, 'flight')}
                          className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-green-50 text-green-700"
                        >
                          🚌 Transport
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddEntryTypeFromHeader(dayNumber, dateKey, 'hotel')}
                          className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-purple-50 text-purple-700"
                        >
                          🏨 Hotel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddEntryTypeFromHeader(dayNumber, dateKey, 'activity')}
                          className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-blue-50 text-blue-700"
                        >
                          🎯 Activity
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-violet-100">
                  {canManageEntries ? (
                    <div className="pt-4 pb-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openComposer('flight', dayNumber, dateKey)}
                        className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        + Transport
                      </button>
                      <button
                        type="button"
                        onClick={() => openComposer('hotel', dayNumber, dateKey)}
                        className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        + Hotel
                      </button>
                      <button
                        type="button"
                        onClick={() => openComposer('activity', dayNumber, dateKey)}
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        + Activity
                      </button>
                    </div>
                  ) : (
                    <p className="pt-4 pb-2 text-xs text-violet-600">Read-only public itinerary.</p>
                  )}

                   {canManageEntries && composer?.dayNumber === dayNumber && composer.type === 'flight' && (
                     <form onSubmit={handleUpsertFlight} className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                       <h4 className="font-semibold text-green-900">
                         {composer.mode === 'edit' ? 'Edit Transport' : `Add Transport for ${format(dateObj, 'MMM dd')}`}
                       </h4>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Transport Type</label>
                         <select
                           value={flightForm.transportType}
                           onChange={(e) => setFlightForm((p) => ({ ...p, transportType: e.target.value as any }))}
                           className="w-full px-3 py-2 border border-gray-300 rounded"
                         >
                           <option value="flight">Flight</option>
                           <option value="bus">Bus</option>
                           <option value="train">Train</option>
                           <option value="other">Other</option>
                         </select>
                       </div>
                       {flightForm.transportType === 'other' && (
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Transport Type Name</label>
                           <input
                             type="text"
                             placeholder="e.g., Car, Taxi, Ferry"
                             value={flightForm.customTransportType}
                             onChange={(e) => setFlightForm((p) => ({ ...p, customTransportType: e.target.value }))}
                             className="w-full px-3 py-2 border border-gray-300 rounded"
                             required
                           />
                         </div>
                       )}
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <div className="relative">
                           <input
                             type="text"
                             placeholder="Origin"
                             value={flightForm.origin}
                             onChange={(e) => setFlightForm((p) => ({ ...p, origin: e.target.value }))}
                             className="w-full px-3 py-2 pr-9 border border-gray-300 rounded"
                             required
                           />
                           <RequiredMark />
                         </div>
                         <div className="relative">
                           <input
                             type="text"
                             placeholder="Destination"
                             value={flightForm.destination}
                             onChange={(e) =>
                               setFlightForm((p) => ({ ...p, destination: e.target.value }))
                             }
                             className="w-full px-3 py-2 pr-9 border border-gray-300 rounded"
                             required
                           />
                           <RequiredMark />
                         </div>
                       </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Flight PNR (optional)"
                          value={flightForm.pnr}
                          onChange={(e) => setFlightForm((p) => ({ ...p, pnr: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Outbound Flight # (optional)"
                          value={flightForm.outboundFlightNumber}
                          onChange={(e) =>
                            setFlightForm((p) => ({ ...p, outboundFlightNumber: e.target.value }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="time"
                          value={flightForm.outboundDepartureTime}
                          onChange={(e) =>
                            setFlightForm((p) => ({ ...p, outboundDepartureTime: e.target.value }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                          type="time"
                          value={flightForm.outboundArrivalTime}
                          onChange={(e) =>
                            setFlightForm((p) => ({ ...p, outboundArrivalTime: e.target.value }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Departure Time Zone (optional)"
                          value={flightForm.outboundDepartureTimezone}
                          onChange={(e) =>
                            setFlightForm((p) => ({ ...p, outboundDepartureTimezone: e.target.value }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Arrival Time Zone (optional)"
                          value={flightForm.outboundArrivalTimezone}
                          onChange={(e) =>
                            setFlightForm((p) => ({ ...p, outboundArrivalTimezone: e.target.value }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>

                       <label className="flex items-center gap-2 text-sm text-gray-700">
                         <input
                           type="checkbox"
                           checked={flightForm.isRoundTrip}
                           onChange={(e) =>
                             setFlightForm((p) => ({ ...p, isRoundTrip: e.target.checked }))
                           }
                         />
                         Round trip
                       </label>

                       {flightForm.isRoundTrip && (
                         <label className="flex items-center gap-2 text-sm text-gray-700">
                           <input
                             type="checkbox"
                             checked={flightForm.showOnAllDays}
                             onChange={(e) =>
                               setFlightForm((p) => ({ ...p, showOnAllDays: e.target.checked }))
                             }
                           />
                           Show on all days between outbound and return
                         </label>
                       )}

                      {flightForm.isRoundTrip && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="relative">
                                <input
                                  type="date"
                                  min={startDate}
                                  max={endDate}
                                  value={flightForm.returnDate}
                                  onChange={(e) =>
                                    setFlightForm((p) => ({ ...p, returnDate: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 pr-9 border border-gray-300 rounded"
                                  required
                                />
                                <RequiredMark />
                              </div>
                            <input
                              type="text"
                              placeholder="Return Flight # (optional)"
                              value={flightForm.returnFlightNumber}
                              onChange={(e) =>
                                setFlightForm((p) => ({ ...p, returnFlightNumber: e.target.value }))
                              }
                              className="px-3 py-2 border border-gray-300 rounded"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="time"
                              value={flightForm.returnDepartureTime}
                              onChange={(e) =>
                                setFlightForm((p) => ({ ...p, returnDepartureTime: e.target.value }))
                              }
                              className="px-3 py-2 border border-gray-300 rounded"
                            />
                            <input
                              type="time"
                              value={flightForm.returnArrivalTime}
                              onChange={(e) =>
                                setFlightForm((p) => ({ ...p, returnArrivalTime: e.target.value }))
                              }
                              className="px-3 py-2 border border-gray-300 rounded"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Return Departure Time Zone (optional)"
                              value={flightForm.returnDepartureTimezone}
                              onChange={(e) =>
                                setFlightForm((p) => ({ ...p, returnDepartureTimezone: e.target.value }))
                              }
                              className="px-3 py-2 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              placeholder="Return Arrival Time Zone (optional)"
                              value={flightForm.returnArrivalTimezone}
                              onChange={(e) =>
                                setFlightForm((p) => ({ ...p, returnArrivalTimezone: e.target.value }))
                              }
                              className="px-3 py-2 border border-gray-300 rounded"
                            />
                          </div>
                        </>
                      )}

                       <div className="flex flex-col sm:flex-row gap-2">
                         <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400">
                           {composer.mode === 'edit' ? 'Update Transport' : 'Save Transport'}
                         </button>
                         <button type="button" onClick={closeComposer} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                           Cancel
                         </button>
                       </div>
                    </form>
                  )}

                  {canManageEntries && composer?.dayNumber === dayNumber && composer.type === 'hotel' && (
                    <form onSubmit={handleUpsertHotel} className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                      <h4 className="font-semibold text-purple-900">
                        {composer.mode === 'edit' ? 'Edit Hotel Stay' : 'Add Hotel Stay'}
                      </h4>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Hotel Name"
                          value={hotelForm.hotelName}
                          onChange={(e) => setHotelForm((p) => ({ ...p, hotelName: e.target.value }))}
                          className="w-full px-3 py-2 pr-9 border border-gray-300 rounded"
                          required
                        />
                        <RequiredMark />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <input
                            type="date"
                            min={startDate}
                            max={endDate}
                            value={hotelForm.checkInDate}
                            onChange={(e) => setHotelForm((p) => ({ ...p, checkInDate: e.target.value }))}
                            className="w-full px-3 py-2 pr-9 border border-gray-300 rounded"
                            required
                          />
                          <RequiredMark />
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            min={startDate}
                            max={endDate}
                            value={hotelForm.checkOutDate}
                            onChange={(e) => setHotelForm((p) => ({ ...p, checkOutDate: e.target.value }))}
                            className="w-full px-3 py-2 pr-9 border border-gray-300 rounded"
                            required
                          />
                          <RequiredMark />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="time"
                          value={hotelForm.checkInTime}
                          onChange={(e) => setHotelForm((p) => ({ ...p, checkInTime: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                          type="time"
                          value={hotelForm.checkOutTime}
                          onChange={(e) => setHotelForm((p) => ({ ...p, checkOutTime: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Address"
                          value={hotelForm.address}
                          onChange={(e) => setHotelForm((p) => ({ ...p, address: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Contact Number"
                          value={hotelForm.contactNumber}
                          onChange={(e) => setHotelForm((p) => ({ ...p, contactNumber: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Reservation Number"
                        value={hotelForm.reservationNumber}
                        onChange={(e) =>
                          setHotelForm((p) => ({ ...p, reservationNumber: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400">
                          {composer.mode === 'edit' ? 'Update Hotel' : 'Save Hotel'}
                        </button>
                        <button type="button" onClick={closeComposer} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {canManageEntries && composer?.dayNumber === dayNumber && composer.type === 'activity' && (
                    <form onSubmit={handleUpsertActivity} className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                      <h4 className="font-semibold text-blue-900">
                        {composer.mode === 'edit' ? 'Edit Activity' : 'Add Activity'}
                      </h4>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Activity Name"
                          value={activityForm.activityName}
                          onChange={(e) =>
                            setActivityForm((p) => ({ ...p, activityName: e.target.value }))
                          }
                          className="w-full px-3 py-2 pr-9 border border-gray-300 rounded"
                          required
                        />
                        <RequiredMark />
                      </div>
                      <p className="text-xs text-blue-700 bg-blue-100 border border-blue-200 px-3 py-2 rounded">
                        Activity Date: {format(dateObj, 'MMM dd, yyyy')} (auto-selected from this day)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="time"
                          value={activityForm.startTime}
                          onChange={(e) =>
                            setActivityForm((p) => ({ ...p, startTime: e.target.value }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                          type="time"
                          value={activityForm.endTime}
                          onChange={(e) => setActivityForm((p) => ({ ...p, endTime: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Activity Address"
                          value={activityForm.address}
                          onChange={(e) => setActivityForm((p) => ({ ...p, address: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Contact Number"
                          value={activityForm.contactNumber}
                          onChange={(e) =>
                            setActivityForm((p) => ({ ...p, contactNumber: e.target.value }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Reservation/Confirmation Number"
                        value={activityForm.confirmationNumber}
                        onChange={(e) =>
                          setActivityForm((p) => ({ ...p, confirmationNumber: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                      <textarea
                        placeholder="Notes"
                        value={activityForm.notes}
                        onChange={(e) => setActivityForm((p) => ({ ...p, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        rows={2}
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">
                          {composer.mode === 'edit' ? 'Update Activity' : 'Save Activity'}
                        </button>
                        <button type="button" onClick={closeComposer} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {dayEntries.length === 0 ? (
                    <p className="text-gray-500 py-4">No entries for this day yet.</p>
                  ) : (
                    <div className="space-y-3 pt-4">
                      {dayEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-4 bg-white border border-violet-100 rounded-xl hover:shadow-lg hover:shadow-violet-100/70 transition"
                        >
                          {(() => {
                            const details = entry.customDetails || {};
                            const hasToggleDetails = details.type === 'flight' || details.type === 'hotel';
                            const detailsExpanded = expandedEntryDetails[entry.id] ?? false;

                            if (hasToggleDetails && !detailsExpanded) {
                              return (
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-800 truncate">
                                        {renderEntryConciseHeader(entry)} • {renderEntryTimeSummary(entry)}
                                      </p>
                                      <div className="mt-1">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                            categoryColors[entry.category] || categoryColors.other
                                          }`}
                                        >
                                          {entry.category}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => toggleEntryDetails(entry.id)}
                                      className="w-7 h-7 inline-flex items-center justify-center text-sm font-bold bg-violet-100 text-violet-700 rounded-full hover:bg-violet-200"
                                      aria-label="Expand details"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <>
                                {hasToggleDetails && detailsExpanded ? (
                                  <div className="mb-3 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => toggleEntryDetails(entry.id)}
                                      className="w-7 h-7 inline-flex items-center justify-center text-sm font-bold bg-violet-100 text-violet-700 rounded-full hover:bg-violet-200"
                                      aria-label="Collapse details"
                                    >
                                      -
                                    </button>
                                  </div>
                                ) : null}

                                 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-gray-900">
                                      {getEntryIcon(entry)} {entry.title}
                                    </h4>
                                    {entry.location && <p className="text-sm text-gray-600">📍 {entry.location}</p>}
                                  </div>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                                      categoryColors[entry.category] || categoryColors.other
                                    }`}
                                  >
                                    {entry.category}
                                  </span>
                                </div>

                                {entry.description && (
                                  <p className="text-sm text-gray-700 mb-2">{entry.description}</p>
                                )}

                                {renderFlightDetails(entry)}
                                {renderHotelDetails(entry)}

                                {(entry.timeStart || entry.timeEnd) && (
                                  <p className="text-sm text-gray-600 mb-3">
                                    ⏰ {entry.timeStart} {entry.timeEnd ? `- ${entry.timeEnd}` : ''}
                                  </p>
                                )}

                                {canManageEntries ? (
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                      onClick={() => openComposerForEdit(entry)}
                                      disabled={isLoading}
                                      className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => onDelete(entry)}
                                      disabled={isLoading}
                                      className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ) : null}
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default EntriesList;

