import React from 'react';
import { X, Calendar, Clock, MapPin, Users, Ticket, Check, ShieldCheck, Share2 } from 'lucide-react';
import { EventItem } from '../types';

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onRegister: (event: EventItem) => void;
  isRegistered?: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onRegister,
  isRegistered = false,
}) => {
  if (!event) return null;

  const formattedDate = new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
  const isFull = spotsLeft === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header Media */}
        <div className="relative aspect-video w-full bg-neutral-900">
          <img
            src={event.image}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-neutral-950/70 hover:bg-neutral-950 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 bg-neutral-900/80 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-md font-mono tabular-nums">
            {event.ticketPrice === 0 ? 'Free Attendance' : `$${event.ticketPrice} Standard Pass`}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            {/* Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
              <span className="font-semibold text-neutral-800">{event.category}</span>
              <span aria-hidden="true">·</span>
              <span>Organized by {event.organizer}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{spotsLeft} spots remaining</span>
            </div>

            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-3">
              {event.title}
            </h2>

            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-700">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">Date & Time</div>
                <div className="font-semibold text-neutral-900 mt-0.5">{formattedDate}</div>
                <div className="text-neutral-600 font-mono tabular-nums">
                  {event.time} {event.endTime ? `– ${event.endTime}` : ''}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-700">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">Venue Location</div>
                <div className="font-semibold text-neutral-900 mt-0.5">{event.venue}</div>
                <div className="text-neutral-600 line-clamp-1">{event.locationAddress}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-700">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">Capacity Status</div>
                <div className="font-semibold text-neutral-900 mt-0.5 font-mono tabular-nums">
                  {event.registeredCount} / {event.capacity} Registered
                </div>
                <div className="text-neutral-600">
                  {isFull ? 'Waitlist only' : `${spotsLeft} seats available now`}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">Ticket Access</div>
                <div className="font-semibold text-neutral-900 mt-0.5">Instant Digital Pass</div>
                <div className="text-neutral-600">Verification code generated immediately</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-500">Topics:</span>
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Back to List
            </button>

            {isRegistered ? (
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs bg-emerald-50 px-4 py-2.5 rounded-lg border border-emerald-200">
                <Check className="w-4 h-4" />
                <span>You have a confirmed pass for this event</span>
              </div>
            ) : isFull ? (
              <button
                disabled
                className="px-5 py-2.5 text-xs font-semibold text-neutral-400 bg-neutral-200 rounded-lg cursor-not-allowed"
              >
                Capacity Reached
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onRegister(event);
                }}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-sm"
              >
                Register for Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
