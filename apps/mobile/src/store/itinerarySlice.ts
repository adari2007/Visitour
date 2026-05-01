import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { itinerariesAPI, entriesAPI } from '@/services/api';

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
  customDetails: Record<string, any>;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface Itinerary {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  entries?: Entry[];
}

interface ItineraryState {
  items: Itinerary[];
  selected: Itinerary | null;
  entries: Entry[];
  loading: boolean;
  error: string | null;
}

const initialState: ItineraryState = {
  items: [],
  selected: null,
  entries: [],
  loading: false,
  error: null,
};

export const fetchItineraries = createAsyncThunk('itineraries/fetchAll', async () => {
  const response = await itinerariesAPI.getAll();
  return response.data.itineraries;
});

export const fetchItinerary = createAsyncThunk('itineraries/fetchOne', async (id: string) => {
  const response = await itinerariesAPI.getById(id);
  return response.data.itinerary;
});

export const createItinerary = createAsyncThunk(
  'itineraries/create',
  async (data: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    isPublic?: boolean;
  }) => {
    const response = await itinerariesAPI.create(data);
    return response.data.itinerary;
  }
);

export const updateItinerary = createAsyncThunk(
  'itineraries/update',
  async (data: { id: string; updates: any }) => {
    const response = await itinerariesAPI.update(data.id, data.updates);
    return response.data.itinerary;
  }
);

export const deleteItinerary = createAsyncThunk('itineraries/delete', async (id: string) => {
  await itinerariesAPI.delete(id);
  return id;
});

export const fetchEntries = createAsyncThunk(
  'itineraries/fetchEntries',
  async (itineraryId: string) => {
    const response = await entriesAPI.getByItinerary(itineraryId);
    return response.data.entries;
  }
);

export const createEntry = createAsyncThunk(
  'itineraries/createEntry',
  async (data: { itineraryId: string; entry: any }) => {
    const response = await entriesAPI.create(data.itineraryId, data.entry);
    return response.data.entry;
  }
);

export const updateEntry = createAsyncThunk(
  'itineraries/updateEntry',
  async (data: { id: string; updates: any }) => {
    const response = await entriesAPI.update(data.id, data.updates);
    return response.data.entry;
  }
);

export const deleteEntry = createAsyncThunk('itineraries/deleteEntry', async (id: string) => {
  await entriesAPI.delete(id);
  return id;
});

const itinerarySlice = createSlice({
  name: 'itineraries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItineraries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItineraries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItineraries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch itineraries';
      })
      .addCase(fetchItinerary.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createItinerary.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateItinerary.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(deleteItinerary.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.entries = action.payload;
      })
      .addCase(createEntry.fulfilled, (state, action) => {
        state.entries.push(action.payload);
      })
      .addCase(updateEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex((entry) => entry.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
      })
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter((entry) => entry.id !== action.payload);
      });
  },
});

export default itinerarySlice.reducer;

