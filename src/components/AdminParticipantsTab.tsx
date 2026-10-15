import React, { useState, useEffect } from 'react';
import { Search, Download, CheckCircle, Clock, XCircle, Filter, RefreshCw, UserCheck } from 'lucide-react';
import { Registration, EventItem } from '../types';
import { api } from '../services/api';

interface AdminParticipantsTabProps {
  events: EventItem[];
}

export const AdminParticipantsTab: React.FC<AdminParticipantsTabProps> = ({ events }) => {
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const data = await api.getParticipants({
        eventId: selectedEventId,
        status: selectedStatus,
        search,
      });
      setParticipants(data);
    } catch (err) {
      console.error('Failed to load participants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [selectedEventId, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParticipants();
  };

  const handleToggleCheckIn = async (participant: Registration) => {
    const nextStatus = participant.status === 'checked-in' ? 'confirmed' : 'checked-in';
    try {
      setUpdatingId(participant._id);
      await api.updateRegistrationStatus(participant._id, nextStatus);
      await fetchParticipants();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    if (participants.length === 0) return;
    const headers = ['Ticket Code', 'Attendee Name', 'Email', 'Phone', 'Event Title', 'Status', 'Registered At', 'Notes'];
    const rows = participants.map((p) => [
      p.ticketCode,
      `"${p.attendeeName.replace(/"/g, '""')}"`,
      p.attendeeEmail,
      p.attendeePhone || '',
      `"${(p.eventTitle || '').replace(/"/g, '""')}"`,
      p.status,
      p.registeredAt,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eventsphere_participants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const checkedInCount = participants.filter((p) => p.status === 'checked-in').length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Total Registered Participants</span>
          <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {participants.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Checked-In Attendees</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {checkedInCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Check-in Completion</span>
          <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {participants.length > 0 ? Math.round((checkedInCount / participants.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Filter and Export Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter by Event */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-2.5 py-1.5 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800 text-xs focus:outline-none"
            >
              <option value="All">All Events ({events.length})</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800 text-xs focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked In</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Search & Export */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </form>

          <button
            onClick={fetchParticipants}
            className="p-2 border border-neutral-300 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            title="Refresh participant list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportCSV}
            disabled={participants.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Ticket Pass</th>
                <th className="py-3 px-4">Participant Details</th>
                <th className="py-3 px-4">Registered Event</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4">Check-In Status</th>
                <th className="py-3 px-4 text-right">Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400">
                    No participants matched the filter criteria.
                  </td>
                </tr>
              ) : (
                participants.map((p) => {
                  const isCheckedIn = p.status === 'checked-in';
                  return (
                    <tr key={p._id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900 tabular-nums">
                        {p.ticketCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{p.attendeeName}</div>
                        <div className="text-[11px] text-neutral-500">{p.attendeeEmail}</div>
                        {p.attendeePhone && (
                          <div className="text-[10px] text-neutral-400 font-mono">{p.attendeePhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-800 max-w-xs truncate">
                        {p.eventTitle}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-neutral-500">
                        {new Date(p.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-xs ${
                            isCheckedIn
                              ? 'text-indigo-600'
                              : p.status === 'confirmed'
                              ? 'text-emerald-600'
                              : 'text-neutral-400'
                          }`}
                        >
                          {isCheckedIn ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          <span className="capitalize">{isCheckedIn ? 'Checked-In' : p.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleCheckIn(p)}
                          disabled={updatingId === p._id}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            isCheckedIn
                              ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {isCheckedIn ? 'Undo Check-in' : 'Check In'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
