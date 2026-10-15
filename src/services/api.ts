import { EventItem, Registration, User, MongoDbStatus } from '../types';

export const api = {
  // Events
  async getEvents(params?: { category?: string; status?: string; search?: string }): Promise<EventItem[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/events?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getEventById(id: string): Promise<EventItem & { participantsCount?: number }> {
    const res = await fetch(`/api/events/${id}`);
    if (!res.ok) throw new Error('Failed to fetch event');
    return res.json();
  },

  async createEvent(data: Partial<EventItem>): Promise<EventItem> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create event');
    }
    return res.json();
  },

  async updateEvent(id: string, data: Partial<EventItem>): Promise<EventItem> {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update event');
    }
    return res.json();
  },

  async deleteEvent(id: string): Promise<{ eventId: string }> {
    const res = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete event');
    }
    return res.json();
  },

  // Registration
  async registerForEvent(
    eventId: string,
    payload: {
      userId?: string;
      attendeeName: string;
      attendeeEmail: string;
      attendeePhone?: string;
      notes?: string;
    }
  ): Promise<{ registration: Registration; eventTitle: string; eventDate: string; venue: string }> {
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getMyRegistrations(email?: string, userId?: string): Promise<Registration[]> {
    const query = new URLSearchParams();
    if (email) query.set('email', email);
    if (userId) query.set('userId', userId);
    const res = await fetch(`/api/my-registrations?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch registrations');
    return res.json();
  },

  async cancelRegistration(id: string): Promise<void> {
    const res = await fetch(`/api/registrations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to cancel registration');
    }
  },

  // Admin participants
  async getParticipants(params?: { eventId?: string; search?: string; status?: string }): Promise<Registration[]> {
    const query = new URLSearchParams();
    if (params?.eventId) query.set('eventId', params.eventId);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`/api/admin/participants?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch participants');
    return res.json();
  },

  async updateRegistrationStatus(id: string, status: 'confirmed' | 'checked-in' | 'cancelled'): Promise<Registration> {
    const res = await fetch(`/api/admin/registrations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update participant status');
    }
    return res.json();
  },

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; phone?: string; organization?: string; role?: 'user' | 'admin' }): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  // DB diagnostics
  async getDbStatus(): Promise<MongoDbStatus> {
    const res = await fetch('/api/db/status');
    if (!res.ok) throw new Error('Failed to fetch database status');
    return res.json();
  },

  async resetDatabase(): Promise<void> {
    const res = await fetch('/api/db/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset database');
  },
};
