import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { RegisterModal } from './components/RegisterModal';
import { MyTicketsModal } from './components/MyTicketsModal';
import { AdminEventsTab } from './components/AdminEventsTab';
import { AdminParticipantsTab } from './components/AdminParticipantsTab';
import { MongoInspectorModal } from './components/MongoInspectorModal';
import { AuthModal } from './components/AuthModal';
import { EventItem, Registration, User } from './types';
import { api } from './services/api';
import { Calendar, Users, Database, Shield, Sparkles, Filter, Ticket, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState<'events' | 'my-tickets' | 'admin-events' | 'admin-participants'>('events');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('eventsphere_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Events & Registration State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(null);
  const [showMyTicketsModal, setShowMyTicketsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showDbInspector, setShowDbInspector] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Events from MongoDB API
  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await api.getEvents({
        category: selectedCategory,
        search: searchQuery,
      });
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch Current User's Passes
  const loadMyRegistrations = async () => {
    if (!currentUser) {
      setMyRegistrations([]);
      return;
    }
    try {
      const data = await api.getMyRegistrations(currentUser.email, currentUser._id);
      setMyRegistrations(data);
    } catch (err) {
      console.error('Failed to load my registrations:', err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadMyRegistrations();
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('eventsphere_user', JSON.stringify(user));
    } catch {}
    showToast(`Signed in as ${user.name} (${user.role})`);
    if (user.role === 'admin' && activeView === 'events') {
      setActiveView('admin-events');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('eventsphere_user');
    } catch {}
    setActiveView('events');
    showToast('Signed out successfully');
  };

  const handleRegistrationSuccess = (reg: Registration) => {
    loadEvents();
    loadMyRegistrations();
    showToast(`Ticket pass ${reg.ticketCode} confirmed & saved in MongoDB!`);
  };

  const registeredEventIds = new Set(myRegistrations.map((r) => r.eventId));

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-neutral-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={(view) => {
          if (view === 'my-tickets' && !currentUser) {
            setAuthMode('login');
            setShowAuthModal(true);
            return;
          }
          if (view.startsWith('admin') && currentUser?.role !== 'admin') {
            setAuthMode('login');
            setShowAuthModal(true);
            return;
          }
          setActiveView(view);
        }}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setShowAuthModal(true);
        }}
        onOpenDbInspector={() => setShowDbInspector(true)}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'events' && (
          <div>
            {/* Hero Banner with live search */}
            <HeroBanner
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              totalEventsCount={events.length}
              totalRegistrationsCount={myRegistrations.length > 0 ? myRegistrations.length : 382 + 48 + 94}
              onExploreClick={() => {
                const el = document.getElementById('events-catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Events Catalog Grid */}
            <div id="events-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                    Upcoming Available Events
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Verified conference dates, workshops, and gatherings stored in MongoDB.
                  </p>
                </div>

                {/* Quick MongoDB Status & Action */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDbInspector(true)}
                    className="flex items-center gap-1.5 text-xs text-neutral-600 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg hover:border-neutral-300 transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>MongoDB Database: Active</span>
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => setActiveView('admin-events')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin Management</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Event Cards Grid */}
              {loadingEvents ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white rounded-xl border border-neutral-200 h-96 animate-pulse p-4 space-y-4">
                      <div className="w-full h-48 bg-neutral-100 rounded-lg"></div>
                      <div className="h-4 bg-neutral-100 rounded w-1/3"></div>
                      <div className="h-6 bg-neutral-100 rounded w-3/4"></div>
                      <div className="h-12 bg-neutral-100 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-neutral-200 p-8">
                  <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-neutral-900 mb-1">No events match your search</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                    Try adjusting your category filter or search keywords.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((evt) => (
                    <EventCard
                      key={evt._id}
                      event={evt}
                      onSelect={(e) => setSelectedEvent(e)}
                      onRegister={(e) => setRegisteringEvent(e)}
                      isRegistered={registeredEventIds.has(evt._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View: My Passes */}
        {activeView === 'my-tickets' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  My Booked Passes
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Attendee: {currentUser?.name} ({currentUser?.email})
                </p>
              </div>
              <button
                onClick={() => setActiveView('events')}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white"
              >
                ← Back to Events
              </button>
            </div>

            {myRegistrations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-neutral-200 p-8">
                <Ticket className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-900 mb-1">No event passes registered yet</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  Browse the catalog and register for your first pass online.
                </p>
                <button
                  onClick={() => setActiveView('events')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  Browse Available Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRegistrations.map((reg) => (
                  <div
                    key={reg._id}
                    className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                        <span className="font-semibold text-neutral-700 font-mono tabular-nums">
                          Code: {reg.ticketCode}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-medium">Confirmed Pass</span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-900">
                        {reg.event?.title || reg.eventTitle || 'Event'}
                      </h3>
                      <div className="text-xs text-neutral-500 mt-1 flex items-center gap-3">
                        <span className="font-mono tabular-nums">
                          Date: {reg.event?.date || reg.eventDate} ({reg.event?.time})
                        </span>
                        <span>·</span>
                        <span>Venue: {reg.event?.venue || reg.eventVenue}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          if (confirm('Cancel your pass for this event?')) {
                            await api.cancelRegistration(reg._id);
                            await loadMyRegistrations();
                            await loadEvents();
                            showToast('Registration cancelled');
                          }
                        }}
                        className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                      >
                        Cancel Pass
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View: Admin Events & Participants Portal */}
        {(activeView === 'admin-events' || activeView === 'admin-participants') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Admin Header with Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-neutral-900" />
                  <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                    Admin Management Console
                  </h1>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Manage events, capacities, and registered participants stored in MongoDB.
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg">
                <button
                  onClick={() => setActiveView('admin-events')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeView === 'admin-events'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Manage Events ({events.length})
                </button>
                <button
                  onClick={() => setActiveView('admin-participants')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeView === 'admin-participants'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Manage Participants
                </button>
              </div>
            </div>

            {activeView === 'admin-events' ? (
              <AdminEventsTab
                events={events}
                onRefresh={() => {
                  loadEvents();
                  loadMyRegistrations();
                }}
              />
            ) : (
              <AdminParticipantsTab events={events} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-10 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px]">
              ES
            </div>
            <span className="font-bold text-neutral-900">EventSphere</span>
            <span>· Enterprise Event Management Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setShowDbInspector(true)}
              className="text-neutral-700 hover:text-neutral-900 font-mono flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>MongoDB Document Architecture</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>Node.js & Express.js REST API</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={(e) => {
            setSelectedEvent(null);
            setRegisteringEvent(e);
          }}
          isRegistered={registeredEventIds.has(selectedEvent._id)}
        />
      )}

      {registeringEvent && (
        <RegisterModal
          event={registeringEvent}
          currentUser={currentUser}
          onClose={() => setRegisteringEvent(null)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {showAuthModal && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {showDbInspector && (
        <MongoInspectorModal
          onClose={() => setShowDbInspector(false)}
          onDataReset={() => {
            loadEvents();
            loadMyRegistrations();
          }}
        />
      )}
    </div>
  );
}
