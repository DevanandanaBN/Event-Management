import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Ticket, ArrowUpRight } from 'lucide-react';
import { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
  onRegister: (event: EventItem) => void;
  isRegistered?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  onRegister,
  isRegistered = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const isFull = event.registeredCount >= event.capacity;
  const fillPercentage = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  // Format date: e.g. "Fri, Nov 14, 2026"
  const formattedDate = new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="group bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md hover:border-neutral-300">
      {/* Visual Media with fallback */}
      <div className="relative aspect-video w-full bg-neutral-100 overflow-hidden">
        {!imageError ? (
          <img
            src={event.image?.replace('/src/assets/images/', '/images/')}
            alt={event.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-300">
            <Ticket className="w-8 h-8 mb-2 opacity-60" />
            <span className="text-xs font-semibold">{event.category} Event</span>
          </div>
        )}

        {/* Quiet Price Overlay */}
        <div className="absolute top-3 right-3 bg-neutral-900/80 backdrop-blur-xs text-white text-xs font-medium px-2.5 py-1 rounded-md font-mono tabular-nums">
          {event.ticketPrice === 0 ? 'Free Pass' : `$${event.ticketPrice}`}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata with typographic separator */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-700">{event.category}</span>
            <span aria-hidden="true">·</span>
            <span>{event.organizer}</span>
          </div>

          <h3
            onClick={() => onSelect(event)}
            className="text-base font-bold text-neutral-900 hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer mb-2.5"
          >
            {event.title}
          </h3>

          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">
            {event.description}
          </p>

          {/* Schedule & Venue Metadata */}
          <div className="space-y-1.5 text-xs text-neutral-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="font-mono tabular-nums">{formattedDate}</span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="font-mono tabular-nums">{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Footer Area: Capacity & Action */}
        <div className="pt-3 border-t border-neutral-100 mt-2">
          {/* Capacity Progress Bar */}
          <div className="mb-3.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Attendance</span>
              </span>
              <span className="font-mono tabular-nums">
                {event.registeredCount} / {event.capacity} seats ({fillPercentage}%)
              </span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isFull ? 'bg-amber-600' : 'bg-neutral-900'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(event)}
              className="flex-1 py-2 px-3 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-center"
            >
              View Details
            </button>

            {isRegistered ? (
              <button
                disabled
                className="flex-1 py-2 px-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg text-center cursor-default"
              >
                Pass Confirmed
              </button>
            ) : isFull ? (
              <button
                disabled
                className="flex-1 py-2 px-3 text-xs font-medium text-neutral-400 bg-neutral-100 rounded-lg text-center cursor-not-allowed"
              >
                Event Full
              </button>
            ) : (
              <button
                onClick={() => onRegister(event)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors text-center"
              >
                Register Now
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
