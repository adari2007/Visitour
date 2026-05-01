import React, { useState } from 'react';

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
}

interface EntryFormProps {
  itineraryId: string;
  entry?: Entry;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const categories = [
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'activity', label: 'Activity' },
  { value: 'meal', label: 'Meal' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
];

export function EntryForm({ entry, onSubmit, isLoading = false }: EntryFormProps) {
  const [formData, setFormData] = useState({
    dayNumber: entry?.dayNumber || 1,
    date: entry?.date || '',
    title: entry?.title || '',
    description: entry?.description || '',
    location: entry?.location || '',
    timeStart: entry?.timeStart || '',
    timeEnd: entry?.timeEnd || '',
    category: entry?.category || 'activity',
    customDetails: entry?.customDetails || {},
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day Number</label>
          <input
            type="number"
            name="dayNumber"
            value={formData.dayNumber}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          maxLength={255}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="e.g., Breakfast at hotel"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Additional details about this entry"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Hotel ABC"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            name="timeStart"
            value={formData.timeStart}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            name="timeEnd"
            value={formData.timeEnd}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Saving...' : entry ? 'Update Entry' : 'Add Entry'}
      </button>
    </form>
  );
}

export default EntryForm;

