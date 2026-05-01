import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchItinerary, fetchEntries, createEntry, updateEntry, deleteEntry } from '@/store/itinerarySlice';
import EntryForm from '@/components/EntryForm';
import EntriesList from '@/components/EntriesList';
import { formatDate } from 'date-fns';

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

export function ItineraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const { selected: itinerary, entries, loading } = useAppSelector((state) => state.itineraries);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>();

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

  const handleAddEntry = async (data: any) => {
    if (!id) return;
    try {
      await dispatch(createEntry({
        itineraryId: id,
        entry: data,
      })).unwrap();
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create entry:', err);
    }
  };

  const handleUpdateEntry = async (data: any) => {
    if (!editingEntry) return;
    try {
      await dispatch(updateEntry({
        id: editingEntry.id,
        updates: data,
      })).unwrap();
      setEditingEntry(undefined);
    } catch (err) {
      console.error('Failed to update entry:', err);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await dispatch(deleteEntry(entryId)).unwrap();
      } catch (err) {
        console.error('Failed to delete entry:', err);
      }
    }
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setShowForm(false);
  };

  if (loading || !itinerary) {
    return <div className="container mx-auto px-6 py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{itinerary.title}</h1>
        {itinerary.description && <p className="text-gray-600 mb-4">{itinerary.description}</p>}
        <div className="text-sm text-gray-500 space-y-1 mb-4">
          <p>
            📅 {formatDate(new Date(itinerary.startDate), 'MMM dd, yyyy')} -{' '}
            {formatDate(new Date(itinerary.endDate), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingEntry(undefined);
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm && !editingEntry ? '- Cancel' : '+ Add Entry'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {showForm && !editingEntry ? (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Entry</h2>
              <EntryForm
                itineraryId={id!}
                onSubmit={handleAddEntry}
                isLoading={loading}
              />
            </div>
          ) : null}

          {editingEntry ? (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Entry</h2>
              <EntryForm
                itineraryId={id!}
                entry={editingEntry}
                onSubmit={handleUpdateEntry}
                isLoading={loading}
              />
              <button
                onClick={() => setEditingEntry(undefined)}
                className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel Editing
              </button>
            </div>
          ) : null}

          <EntriesList
            entries={entries}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            isLoading={loading}
          />
        </div>

        <div className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-blue-600">{entries.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Days</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(entries.map((e) => e.dayNumber)).size}
                </p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-gray-600 mb-2">Categories</p>
                {Object.entries(
                  entries.reduce(
                    (acc, e) => {
                      acc[e.category] = (acc[e.category] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>
                  )
                ).map(([cat, count]) => (
                  <p key={cat} className="text-sm">
                    {cat}: <span className="font-semibold">{count}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItineraryDetailPage;

