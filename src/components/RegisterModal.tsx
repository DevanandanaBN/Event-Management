import React, { useState } from 'react';
import { X, CheckCircle2, Ticket, QrCode, Calendar, MapPin, User as UserIcon, Mail, Phone, Loader2 } from 'lucide-react';
import { EventItem, User, Registration } from '../types';
import { api } from '../services/api';

interface RegisterModalProps {
  event: EventItem | null;
  currentUser: User | null;
  onClose: () => void;
  onSuccess: (reg: Registration) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  event,
  currentUser,
  onClose,
  onSuccess,
}) => {
  if (!event) return null;

  const [attendeeName, setAttendeeName] = useState(currentUser?.name || '');
  const [attendeeEmail, setAttendeeEmail] = useState(currentUser?.email || '');
  const [attendeePhone, setAttendeePhone] = useState(currentUser?.phone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedReg, setConfirmedReg] = useState<Registration | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setError('Please provide your full name and valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.registerForEvent(event._id, {
        userId: currentUser?._id,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        notes,
      });
      setConfirmedReg(res.registration);
      onSuccess(res.registration);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {confirmedReg ? 'Registration Confirmed' : 'Event Registration'}
            </span>
            <h3 className="text-base font-bold text-neutral-900 leading-tight truncate max-w-sm">
              {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {confirmedReg ? (
            /* Digital Ticket Confirmation Pass */
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">Pass Issued & Confirmed in MongoDB!</div>
                  <div className="text-emerald-700">
                    A confirmation record was saved for <span className="font-semibold">{confirmedReg.attendeeEmail}</span>.
                  </div>
                </div>
              </div>

              {/* Digital Pass Card */}
              <div className="border border-neutral-300 rounded-xl overflow-hidden bg-neutral-900 text-white shadow-lg">
                <div className="p-5 border-b border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                    <span className="uppercase tracking-widest text-[10px] font-semibold text-neutral-400">Official Attendee Pass</span>
                    <span className="font-mono tabular-nums text-emerald-400 font-semibold">VERIFIED</span>
                  </div>
                  <h4 className="text-lg font-bold tracking-tight mb-1 text-white">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span>{event.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{event.venue}</span>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-2 gap-4 text-xs bg-neutral-950/60">
                  <div>
                    <span className="text-neutral-400 text-[11px] block">Attendee</span>
                    <span className="font-semibold text-neutral-100">{confirmedReg.attendeeName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[11px] block">Event Date</span>
                    <span className="font-semibold font-mono tabular-nums text-neutral-100">{event.date} · {event.time}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[11px] block">Ticket Code</span>
                    <span className="font-mono font-bold text-sm tracking-wider text-indigo-300 tabular-nums">
                      {confirmedReg.ticketCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[11px] block">Access Tier</span>
                    <span className="font-semibold text-neutral-100">
                      {event.ticketPrice === 0 ? 'Complimentary' : 'General Admission'}
                    </span>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="px-5 py-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 opacity-70">
                    <div className="w-1 h-6 bg-white"></div>
                    <div className="w-2 h-6 bg-white"></div>
                    <div className="w-0.5 h-6 bg-white"></div>
                    <div className="w-1.5 h-6 bg-white"></div>
                    <div className="w-1 h-6 bg-white"></div>
                    <div className="w-3 h-6 bg-white"></div>
                    <div className="w-0.5 h-6 bg-white"></div>
                    <div className="w-2 h-6 bg-white"></div>
                    <div className="w-1 h-6 bg-white"></div>
                    <div className="w-0.5 h-6 bg-white"></div>
                    <div className="w-2 h-6 bg-white"></div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                    SECURE-TOKEN-HASH-VERIFIED
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 leading-relaxed">
                  {error}
                </div>
              )}

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-900 block">{event.venue}</span>
                  <span className="font-mono tabular-nums text-neutral-500">{event.date} at {event.time}</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 block">Pass Price</span>
                  <span className="font-mono font-bold text-neutral-900 tabular-nums">
                    {event.ticketPrice === 0 ? 'Free' : `$${event.ticketPrice}`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="attendee@example.com"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  />
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Your ticket and verification code will be linked to this email.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={attendeePhone}
                  onChange={(e) => setAttendeePhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Special Requirements or Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dietary requirements, accessibility needs, or workshop track preferences"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Issuing Pass...</span>
                    </>
                  ) : (
                    <span>Confirm Registration</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
