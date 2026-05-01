import React from 'react';
import { formatDate, differenceInDays } from 'date-fns';

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
}

interface EntriesListProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const categoryColors: Record<string, string> = {
  accommodation: 'bg-purple-100 text-purple-800',
  activity: 'bg-blue-100 text-blue-800',
  meal: 'bg-yellow-100 text-yellow-800',
  transport: 'bg-green-100 text-green-800',
  other: 'bg-gray-100 text-gray-800',
};

export function EntriesList({ entries, onEdit, onDelete, isLoading = false }: EntriesListProps) {
  const groupedByDay = entries.reduce(
    (acc, entry) => {
      const day = entry.dayNumber;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(entry);
      return acc;
    },
    {} as Record<number, Entry[]>
  );

  const sortedDays = Object.keys(groupedByDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {sortedDays.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No entries yet. Add your first entry!</p>
      ) : (
        sortedDays.map((day) => (
          <div key={day} className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Day {day} - {groupedByDay[day][0]?.date && formatDate(new Date(groupedByDay[day][0].date), 'MMM dd, yyyy')}
            </h3>

            <div className="space-y-3">
              {groupedByDay[day].map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                      {entry.location && <p className="text-sm text-gray-600">📍 {entry.location}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[entry.category] || categoryColors.other}`}>
                      {entry.category}
                    </span>
                  </div>

                  {entry.description && <p className="text-sm text-gray-700 mb-2">{entry.description}</p>}

                  {(entry.timeStart || entry.timeEnd) && (
                    <p className="text-sm text-gray-600 mb-3">
                      ⏰ {entry.timeStart} {entry.timeEnd ? `- ${entry.timeEnd}` : ''}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(entry)}
                      disabled={isLoading}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(entry.id)}
                      disabled={isLoading}
                      className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default EntriesList;

