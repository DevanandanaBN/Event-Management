import React from 'react';
import { Search, MapPin, Calendar, Users, Ticket, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  totalEventsCount: number;
  totalRegistrationsCount: number;
  onExploreClick: () => void;
}

const CATEGORIES = ['All', 'Tech', 'Design', 'Music', 'Business'];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  totalEventsCount,
  totalRegistrationsCount,
  onExploreClick,
}) => {
  return (
    <section className="relative overflow-hidden bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Editorial Headline & Search */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Event Management & Registration Platform
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.15] mb-5 text-balance">
              Discover, organize, and attend premier conferences, workshops, and gatherings.
            </h1>

            <p className="text-base text-neutral-600 leading-relaxed max-w-xl mb-8">
              A unified system for attendees and organizers. Browse upcoming dates, reserve verified passes in seconds, and track real-time participant capacity backed by high-performance MongoDB storage.
            </p>

            {/* Live Search & Filter Box */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 shadow-xs max-w-xl mb-6">
              <div className="flex items-center gap-2 px-2 pb-2.5 border-b border-neutral-200">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by title, keynote, topic, or venue..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-xs text-neutral-400 hover:text-neutral-700 px-1.5 py-0.5 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Functional Segmented Filter Tabs */}
              <div className="pt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-xs text-neutral-500 pl-2 shrink-0">Filter:</span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabular Numerals Proof Metrics */}
            <div className="flex items-center gap-8 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-neutral-900 tabular-nums">
                  {totalEventsCount}
                </span>
                <span>Active Events</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-neutral-900 tabular-nums">
                  {totalRegistrationsCount}
                </span>
                <span>Confirmed Passes</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-neutral-900 tabular-nums">
                  100%
                </span>
                <span>Digital Verification</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Summit Visual Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 group shadow-md">
              <img
                src="/src/assets/images/hero_event_summit_1791908450453.jpg"
                alt="Global Tech Leadership Summit 2026 Auditorium"
                referrerPolicy="no-referrer"
                className="w-full h-72 sm:h-80 object-cover opacity-90 group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent p-6 flex flex-col justify-end text-white">
                <div className="text-xs text-neutral-300 font-medium mb-1">
                  Spotlight Event · San Francisco
                </div>
                <h3 className="text-lg font-bold leading-tight mb-2">
                  Global Tech Leadership Summit 2026
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-2 mb-3">
                  800+ engineering leads and innovators gathering for distributed systems and enterprise architecture.
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-mono tabular-nums">Nov 14, 2026 · Free Entry</span>
                  <button
                    onClick={onExploreClick}
                    className="inline-flex items-center gap-1 font-semibold text-white hover:underline"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
