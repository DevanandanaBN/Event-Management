import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Users, DollarSign, Search, Loader2 } from 'lucide-react';
import { EventItem } from '../types';
import { api } from '../services/api';

interface AdminEventsTabProps {
  events: EventItem[];
  onRefresh: () => void;
}

export const AdminEventsTab: React.FC<AdminEventsTabProps> = ({ events, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<EventItem>>({
    title: '',
    category: 'Tech',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    endTime: '17:00',
    venue: '',
    locationAddress: '',
    capacity: 100,
    ticketPrice: 0,
    status: 'upcoming',
    image: '/src/assets/images/hero_event_summit_1791908450453.jpg',
    organizer: 'EventSphere Core Team',
    tags: ['Conference', 'Innovation'],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableImages = [
    { label: 'Conference & Auditorium', path: '/src/assets/images/hero_event_summit_1791908450453.jpg' },
    { label: 'Design Workshop & Prototyping', path: '/src/assets/images/event_design_workshop_1791908451200.jpg' },
    { label: 'Music & Cultural Gala', path: '/src/assets/images/event_music_festival_1791908451287.jpg' },
    { label: 'Hackathon & Dev Sprint', path: '/src/assets/images/event_hackathon_1791908451113.jpg' },
  ];

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistered = events.reduce((sum, e) => sum + e.registeredCount, 0);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      category: 'Tech',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      endTime: '17:00',
      venue: '',
      locationAddress: '',
      capacity: 150,
      ticketPrice: 0,
      status: 'upcoming',
      image: availableImages[0].path,
      organizer: 'EventSphere Organization',
      tags: ['Innovation', 'Community'],
    });
    setEditingEvent(null);
    setIsCreating(true);
    setError(null);
  };

  const handleOpenEdit = (event: EventItem) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      category: event.category,
      description: event.description,
      date: event.date,
      time: event.time,
      endTime: event.endTime || '',
      venue: event.venue,
      locationAddress: event.locationAddress,
      capacity: event.capacity,
      ticketPrice: event.ticketPrice,
      status: event.status,
      image: event.image,
      organizer: event.organizer,
      tags: event.tags,
    });
    setIsCreating(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.date || !formData.venue?.trim()) {
      setError('Title, date, and venue are mandatory.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      if (editingEvent) {
        await api.updateEvent(editingEvent._id, formData);
        setEditingEvent(null);
      } else {
        await api.createEvent(formData);
        setIsCreating(false);
      }
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event: EventItem) => {
    if (!window.confirm(`Delete event "${event.title}" and its MongoDB document? This cannot be undone.`)) {
      return;
    }

    try {
      setIsDeletingId(event._id);
      await api.deleteEvent(event._id);
      await onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Total Managed Events</span>
          <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">{events.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Total Capacity</span>
          <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">{totalCapacity}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Total Registered</span>
          <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">{totalRegistered}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Overall Fill Rate</span>
          <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by name, venue, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Event & Category</th>
                <th className="py-3 px-4">Date & Schedule</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4 text-right">Capacity</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredEvents.map((evt) => {
                const fill = Math.round((evt.registeredCount / evt.capacity) * 100);
                return (
                  <tr key={evt._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{evt.title}</div>
                      <div className="text-[11px] text-neutral-500">
                        <span>{evt.category}</span> · <span>{evt.organizer}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-700">
                      <div>{evt.date}</div>
                      <div className="text-[11px] text-neutral-500">{evt.time} {evt.endTime ? `- ${evt.endTime}` : ''}</div>
                    </td>
                    <td className="py-3 px-4 text-neutral-700 max-w-xs truncate">
                      {evt.venue}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span className="font-semibold text-neutral-900">{evt.registeredCount}</span>
                      <span className="text-neutral-400"> / {evt.capacity}</span>
                      <div className="text-[10px] text-neutral-500">({fill}%)</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-900">
                      {evt.ticketPrice === 0 ? 'Free' : `$${evt.ticketPrice}`}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(evt)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                        title="Edit Event"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(evt)}
                        disabled={isDeletingId === evt._id}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingEvent) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <h3 className="text-sm font-bold text-neutral-900">
                {editingEvent ? 'Update Event Details' : 'Create New Event'}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingEvent(null);
                }}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AI & Cloud Architecture Summit 2026"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Design">Design</option>
                    <option value="Music">Music</option>
                    <option value="Business">Business</option>
                    <option value="Community">Community</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Organizer</label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Venue Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Grand Horizon Hall"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.locationAddress}
                    onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                    placeholder="e.g. 500 Market St, Suite 2"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Ticket Price ($0 for Free)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Header Visual Preset</label>
                <select
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                >
                  {availableImages.map((img) => (
                    <option key={img.path} value={img.path}>
                      {img.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingEvent ? 'Save Changes' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
