import React from 'react';
import { Calendar, User as UserIcon, LogOut, Database, Shield } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeView: 'events' | 'my-tickets' | 'admin-events' | 'admin-participants';
  onNavigate: (view: 'events' | 'my-tickets' | 'admin-events' | 'admin-participants') => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenDbInspector: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onOpenAuth,
  onOpenDbInspector,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('events')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
              ES
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap">
              EventSphere
            </span>
          </button>
        </div>

        {/* Zone 2: Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <button
            onClick={() => onNavigate('events')}
            className={`whitespace-nowrap transition-colors hover:text-neutral-900 ${
              activeView === 'events' ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900' : ''
            }`}
          >
            Explore Events
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth('login');
              } else {
                onNavigate('my-tickets');
              }
            }}
            className={`whitespace-nowrap transition-colors hover:text-neutral-900 ${
              activeView === 'my-tickets' ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900' : ''
            }`}
          >
            My Passes
          </button>

          <button
            onClick={() => {
              if (currentUser?.role === 'admin') {
                onNavigate('admin-events');
              } else {
                onOpenAuth('login');
              }
            }}
            className={`whitespace-nowrap flex items-center gap-1.5 transition-colors hover:text-neutral-900 ${
              activeView.startsWith('admin') ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900' : ''
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-neutral-500" />
            <span>Admin Portal</span>
          </button>

        </nav>

        {/* Zone 3: 1 Primary Action Area */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-neutral-900 leading-tight truncate max-w-[140px]">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Attendee'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors whitespace-nowrap"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors whitespace-nowrap"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
