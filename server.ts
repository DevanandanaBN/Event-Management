import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { db, initMongo, getDbStatus, resetDemoData, EventDoc } from './src/server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize MongoDB engine
await initMongo();

// Helper for generating tickets
function generateTicketCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const num = Math.floor(1000 + Math.random() * 9000);
  return `EVT-${prefix}-${num}`;
}

// ================= API ROUTES =================

// 1. Health & Database Inspector
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/db/status', async (_req: Request, res: Response) => {
  try {
    const status = await getDbStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/db/reset', async (_req: Request, res: Response) => {
  try {
    const data = resetDemoData();
    res.json({ message: 'Database reset to verified initial documents', data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Authentication (User & Admin)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, organization, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await db.users.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const newUser = await db.users.insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password, // In production enterprise, bcrypt hash
      role: role === 'admin' ? 'admin' : 'user',
      phone: phone || '',
      organization: organization || '',
      createdAt: new Date().toISOString(),
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ user: safeUser, token: `token_${safeUser._id}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.users.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser, token: `token_${safeUser._id}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/// 3. Events Endpoints
app.get('/api/events', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const events = await db.events.find({ category, status, search });

    const normalizedEvents = events.map((event: any) => ({
      ...event,
      image: event.image
        ? event.image.replace(
            /^\/?src\/assets\/images\//,
            '/images/'
          )
        : '/images/hero_event_summit_1791908450453.jpg',
    }));

    res.json(normalizedEvents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', async (req: Request, res: Response) => {
  try {
    const event = await db.events.findOne({ _id: req.params.id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    // Also include registration summary for this event
    const regs = await db.registrations.find({ eventId: event._id });
    res.json({
      ...event,
      participantsCount: regs.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create Event
app.post('/api/events', async (req: Request, res: Response) => {
  try {
    const {
      title,
      category,
      description,
      date,
      time,
      endTime,
      venue,
      locationAddress,
      capacity,
      ticketPrice,
      image,
      organizer,
      tags,
    } = req.body;

    if (!title || !date || !time || !venue || !capacity) {
      return res.status(400).json({ error: 'Missing required fields (title, date, time, venue, capacity)' });
    }

    const newEvent = await db.events.insertOne({
      title: title.trim(),
      category: category || 'Tech',
      description: description || '',
      date,
      time,
      endTime: endTime || '',
      venue: venue.trim(),
      locationAddress: locationAddress || venue,
      capacity: Number(capacity) || 100,
      registeredCount: 0,
      ticketPrice: Number(ticketPrice) || 0,
      status: 'upcoming',
      image: image || '/images/hero_event_summit_1791908450453.jpg',
      organizer: organizer || 'EventSphere Community',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newEvent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update Event
app.put('/api/events/:id', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const existing = await db.events.findOne({ _id: eventId });
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const {
      title,
      category,
      description,
      date,
      time,
      endTime,
      venue,
      locationAddress,
      capacity,
      ticketPrice,
      status,
      image,
      organizer,
      tags,
    } = req.body;

    const updates: Partial<EventDoc> = {};
    if (title !== undefined) updates.title = title.trim();
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    if (time !== undefined) updates.time = time;
    if (endTime !== undefined) updates.endTime = endTime;
    if (venue !== undefined) updates.venue = venue.trim();
    if (locationAddress !== undefined) updates.locationAddress = locationAddress;
    if (capacity !== undefined) updates.capacity = Number(capacity);
    if (ticketPrice !== undefined) updates.ticketPrice = Number(ticketPrice);
    if (status !== undefined) updates.status = status;
    if (image !== undefined) updates.image = image;
    if (organizer !== undefined) updates.organizer = organizer;
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    }

    await db.events.updateOne({ _id: eventId }, updates);
    const updated = await db.events.findOne({ _id: eventId });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete Event
app.delete('/api/events/:id', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const existing = await db.events.findOne({ _id: eventId });
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete event
    await db.events.deleteOne({ _id: eventId });

    // Also clean up or mark registrations
    const regs = await db.registrations.find({ eventId });
    for (const reg of regs) {
      await db.registrations.deleteOne({ _id: reg._id });
    }

    res.json({ message: 'Event and associated registrations deleted successfully', eventId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Online Event Registration
app.post('/api/events/:id/register', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const { userId, attendeeName, attendeeEmail, attendeePhone, notes } = req.body;

    if (!attendeeName || !attendeeEmail) {
      return res.status(400).json({ error: 'Attendee name and email are required' });
    }

    const event = await db.events.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({ error: `Cannot register for an event that is ${event.status}` });
    }

    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ error: 'This event has reached full capacity' });
    }

    // Check if already registered
    const existingReg = await db.registrations.findOne({
      eventId,
      attendeeEmail: attendeeEmail.toLowerCase().trim(),
    });

    if (existingReg && existingReg.status !== 'cancelled') {
      return res.status(409).json({
        error: 'You are already registered for this event with this email address.',
        registration: existingReg,
      });
    }

    const ticketCode = generateTicketCode();
    const newReg = await db.registrations.insertOne({
      eventId,
      userId: userId || 'guest',
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.toLowerCase().trim(),
      attendeePhone: attendeePhone || '',
      ticketCode,
      status: 'confirmed',
      registeredAt: new Date().toISOString(),
      notes: notes || '',
    });

    // Update event registeredCount
    await db.events.updateOne(
      { _id: eventId },
      { registeredCount: event.registeredCount + 1 }
    );

    res.status(201).json({
      registration: newReg,
      eventTitle: event.title,
      eventDate: event.date,
      venue: event.venue,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's registrations
app.get('/api/my-registrations', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string | undefined;
    const userId = req.query.userId as string | undefined;

    if (!email && !userId) {
      return res.status(400).json({ error: 'User email or ID required' });
    }

    let regs = await db.registrations.find();
    if (email) {
      regs = regs.filter((r) => r.attendeeEmail.toLowerCase() === email.toLowerCase());
    } else if (userId) {
      regs = regs.filter((r) => r.userId === userId);
    }

    // Attach event details
    const events = await db.events.find();
    const eventMap = new Map(events.map((e) => [e._id, e]));

    const populated = regs.map((r) => ({
      ...r,
      event: eventMap.get(r.eventId) || null,
    }));

    res.json(populated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel registration
app.delete('/api/registrations/:id', async (req: Request, res: Response) => {
  try {
    const regId = req.params.id;
    const reg = await db.registrations.findOne({ _id: regId });
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Update event registered count if confirmed
    if (reg.status === 'confirmed') {
      const event = await db.events.findOne({ _id: reg.eventId });
      if (event && event.registeredCount > 0) {
        await db.events.updateOne({ _id: reg.eventId }, { registeredCount: event.registeredCount - 1 });
      }
    }

    await db.registrations.deleteOne({ _id: regId });
    res.json({ message: 'Registration cancelled successfully', regId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin: Manage Registered Participants
app.get('/api/admin/participants', async (req: Request, res: Response) => {
  try {
    const eventId = req.query.eventId as string | undefined;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    let regs = await db.registrations.find();
    if (eventId && eventId !== 'All') {
      regs = regs.filter((r) => r.eventId === eventId);
    }
    if (status && status !== 'All') {
      regs = regs.filter((r) => r.status === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      regs = regs.filter(
        (r) =>
          r.attendeeName.toLowerCase().includes(q) ||
          r.attendeeEmail.toLowerCase().includes(q) ||
          r.ticketCode.toLowerCase().includes(q)
      );
    }

    const events = await db.events.find();
    const eventMap = new Map(events.map((e) => [e._id, e]));

    const results = regs.map((r) => {
      const ev = eventMap.get(r.eventId);
      return {
        ...r,
        eventTitle: ev?.title || 'Unknown Event',
        eventDate: ev?.date || '',
        eventVenue: ev?.venue || '',
      };
    });

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update check-in status
app.patch('/api/admin/registrations/:id/status', async (req: Request, res: Response) => {
  try {
    const regId = req.params.id;
    const { status } = req.body;
    if (!['confirmed', 'checked-in', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid registration status' });
    }

    const success = await db.registrations.updateOne({ _id: regId }, { status });
    if (!success) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const updated = await db.registrations.findOne({ _id: regId });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= FRONTEND VITE INTEGRATION =================
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
 console.log(`[EventSphere Server] Running on http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
});
