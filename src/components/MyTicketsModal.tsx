import React, { useState } from 'react';
import { X, Ticket, Calendar, MapPin, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Registration, EventItem } from '../types';
import { api } from '../services/api';

interface MyTicketsModalProps {
  registrations: Registration[];
  onClose: () => void;
  onRefresh: () => void;
}

export const MyTicketsModal: React.FC<MyTicketsModalProps> = ({
  registrations,
  onClose,
  onRefresh,
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async (id: string, eventTitle?: string) => {
    if (!window.confirm(`Are you sure you want to cancel your pass for "${eventTitle || 'this event'}"?`)) {
      return;
    }
    try {
      setCancellingId(id);
      setError(null);
      await api.cancelRegistration(id);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel registration');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              My Event Passes & Registrations
            </h3>
            <span className="text-xs text-neutral-500">
              {registrations.length} registered {registrations.length === 1 ? 'pass' : 'passes'} stored in MongoDB
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {registrations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                <Ticket className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900 mb-1">No event passes yet</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                Explore available conferences, masterclasses, and gatherings to register for your first pass.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Explore Events
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => {
                const ev = reg.event;
                return (
                  <div
                    key={reg._id}
                    className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-neutral-800">
                          {ev?.category || 'Event'}
                        </span>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span className="font-mono text-neutral-500 tabular-nums">
                          Code: {reg.ticketCode}
                        </span>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span
                          className={`font-medium ${
                            reg.status === 'checked-in'
                              ? 'text-indigo-600'
                              : reg.status === 'confirmed'
                              ? 'text-emerald-600'
                              : 'text-neutral-400'
                          }`}
                        >
                          {reg.status === 'checked-in' ? 'Checked In' : 'Confirmed'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-neutral-900">
                        {ev?.title || reg.eventTitle || 'Event'}
                      </h4>

                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1 font-mono tabular-nums">
                          <Calendar className="w-3.5 h-3.5" />
                          {ev?.date || reg.eventDate} {ev?.time ? `at ${ev.time}` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[200px]">{ev?.venue || reg.eventVenue}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      <button
                        onClick={() => handleCancel(reg._id, ev?.title)}
                        disabled={cancellingId === reg._id}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
