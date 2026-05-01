export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  entries?: ItineraryEntry[];
}

export interface ItineraryEntry {
  id: string;
  itineraryId: string;
  dayNumber: number;
  date: string;
  title: string;
  description?: string;
  location?: string;
  timeStart?: string;
  timeEnd?: string;
  category: 'accommodation' | 'activity' | 'meal' | 'transport' | 'other';
  customDetails: Record<string, any>;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItineraryRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isPublic?: boolean;
}

export interface CreateEntryRequest {
  dayNumber: number;
  date: string;
  title: string;
  description?: string;
  location?: string;
  timeStart?: string;
  timeEnd?: string;
  category: 'accommodation' | 'activity' | 'meal' | 'transport' | 'other';
  customDetails?: Record<string, any>;
}

