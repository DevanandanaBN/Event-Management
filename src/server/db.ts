import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { MongoClient, Db } from 'mongodb';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  phone?: string;
  organization?: string;
  createdAt: string;
}

export interface EventDoc {
  _id: string;
  title: string;
  category: 'Tech' | 'Design' | 'Music' | 'Business' | 'Community';
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime?: string;
  venue: string;
  locationAddress: string;
  capacity: number;
  registeredCount: number;
  ticketPrice: number; // 0 for free
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image: string;
  organizer: string;
  tags: string[];
  createdAt: string;
}

export interface RegistrationDoc {
  _id: string;
  eventId: string;
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  ticketCode: string;
  status: 'confirmed' | 'checked-in' | 'cancelled';
  registeredAt: string;
  notes?: string;
}

interface MongoDbData {
  users: UserDoc[];
  events: EventDoc[];
  registrations: RegistrationDoc[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'mongodb_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let liveClient: MongoClient | null = null;
let liveDb: Db | null = null;
let activeMongoUri: string | null = process.env.MONGODB_URI || null;
console.log('[MongoDB] URI loaded:', Boolean(activeMongoUri));

export async function initMongo() {
  if (activeMongoUri) {
    try {
      console.log('[MongoDB] Attempting to connect to provided MONGODB_URI...');
      liveClient = new MongoClient(activeMongoUri, {
        serverSelectionTimeoutMS: 4000,
      });
      await liveClient.connect();
liveDb = liveClient.db('eventsphere_db');

console.log(
  '[MongoDB] Connected successfully to live MongoDB cluster:',
  liveDb.databaseName
);

// Insert sample events if the collection is empty
const eventsCount = await liveDb.collection('events').countDocuments();

if (eventsCount === 0) {
  const seed = getSeedData();

  await liveDb.collection('events').insertMany(
  seed.events.map((event) => ({
    ...event,
    _id: event._id.toString(),
  })) as any[]
);

  console.log('[MongoDB] Sample events inserted:', seed.events.length);
}

console.log(
  '[MongoDB] Events currently in Atlas:',
  await liveDb.collection('events').countDocuments()
);

return;
    } catch (err: any) {
      console.warn('[MongoDB] Live connection failed, falling back to Local Persistent Document Store:', err.message);
      liveClient = null;
      liveDb = null;
    }
  }
  initLocalStore();
}

function getSeedData(): MongoDbData {
  const now = new Date().toISOString();
  return {
    users: [
      {
        _id: 'usr_admin_01',
        name: 'Sarah Chen (Admin)',
        email: 'admin@eventsphere.io',
        passwordHash: 'admin123',
        role: 'admin',
        phone: '+1 (555) 234-5678',
        organization: 'EventSphere Core Team',
        createdAt: now,
      },
      {
        _id: 'usr_demo_01',
        name: 'Alex Rivera',
        email: 'alex@example.com',
        passwordHash: 'user123',
        role: 'user',
        phone: '+1 (555) 987-6543',
        organization: 'Apex Interactive Studio',
        createdAt: now,
      },
      {
        _id: 'usr_demo_02',
        name: 'Maya Patel',
        email: 'maya.patel@designlab.co',
        passwordHash: 'user123',
        role: 'user',
        phone: '+1 (555) 412-8920',
        organization: 'DesignLab Global',
        createdAt: now,
      }
    ],
    events: [
      {
        _id: 'evt_tech_summit_2026',
        title: 'Global Tech Leadership Summit 2026',
        category: 'Tech',
        description: 'Keynote insights and architectural blueprints for the next era of high-scale cloud platforms, distributed systems, and product engineering. Connect with 800+ engineering leads and innovators.',
        date: '2026-11-14',
        time: '09:00',
        endTime: '17:30',
        venue: 'Grand Horizon Convention Center, Hall A',
        locationAddress: '742 Enterprise Boulevard, San Francisco, CA',
        capacity: 450,
        registeredCount: 382,
        ticketPrice: 0,
        status: 'upcoming',
        image: '/src/assets/images/hero_event_summit_1791908450453.jpg',
        organizer: 'Cloud Scale Forum',
        tags: ['Engineering', 'Cloud Architecture', 'Leadership'],
        createdAt: now,
      },
      {
        _id: 'evt_design_ux_workshop',
        title: 'Design Systems & Product Prototyping Masterclass',
        category: 'Design',
        description: 'An intensive, hands-on workshop guiding product designers through tokens, design systems, accessible micro-interactions, and component architecture for mission-critical web applications.',
        date: '2026-11-20',
        time: '10:00',
        endTime: '16:00',
        venue: 'The Foundry Loft & Studio Lab',
        locationAddress: '108 Industrial Way, Suite 400, Brooklyn, NY',
        capacity: 60,
        registeredCount: 48,
        ticketPrice: 45,
        status: 'upcoming',
        image: '/src/assets/images/event_design_workshop_1791908451200.jpg',
        organizer: 'Studio Prototype Collective',
        tags: ['UX Design', 'Design Systems', 'Workshops'],
        createdAt: now,
      },
      {
        _id: 'evt_acoustic_jazz_gala',
        title: 'Nordic Jazz & Chamber Ensemble Evening',
        category: 'Music',
        description: 'A curated evening of contemporary acoustic jazz and ambient double bass compositions set in an acoustic architectural hall with intimate low-light staging.',
        date: '2026-12-05',
        time: '19:30',
        endTime: '22:00',
        venue: 'The Timber & Glass Pavilion',
        locationAddress: '320 Waterfront Promenade, Seattle, WA',
        capacity: 120,
        registeredCount: 94,
        ticketPrice: 30,
        status: 'upcoming',
        image: '/src/assets/images/event_music_festival_1791908451287.jpg',
        organizer: 'Acoustic Arts Foundation',
        tags: ['Live Music', 'Acoustic', 'Cultural'],
        createdAt: now,
      },
      {
        _id: 'evt_open_hackathon_2026',
        title: 'Open Source Resilience Hackathon 2026',
        category: 'Tech',
        description: '48-hour collaborative engineering sprint to build fault-tolerant web tools, offline-first applications, and open community utilities with mentor support and sponsor prize tracks.',
        date: '2026-12-12',
        time: '08:30',
        endTime: '18:00',
        venue: 'Metro Innovation Commons',
        locationAddress: '500 Tech Square, Cambridge, MA',
        capacity: 200,
        registeredCount: 165,
        ticketPrice: 0,
        status: 'upcoming',
        image: '/src/assets/images/event_hackathon_1791908451113.jpg',
        organizer: 'Open Tech Alliance',
        tags: ['Hackathon', 'Open Source', 'Full Stack'],
        createdAt: now,
      }
    ],
    registrations: [
      {
        _id: 'reg_demo_01',
        eventId: 'evt_tech_summit_2026',
        userId: 'usr_demo_01',
        attendeeName: 'Alex Rivera',
        attendeeEmail: 'alex@example.com',
        attendeePhone: '+1 (555) 987-6543',
        ticketCode: 'EVT-7729-TK84',
        status: 'confirmed',
        registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        notes: 'VIP pass with workshop track access',
      },
      {
        _id: 'reg_demo_02',
        eventId: 'evt_design_ux_workshop',
        userId: 'usr_demo_02',
        attendeeName: 'Maya Patel',
        attendeeEmail: 'maya.patel@designlab.co',
        attendeePhone: '+1 (555) 412-8920',
        ticketCode: 'EVT-9311-PL12',
        status: 'confirmed',
        registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        notes: 'Bringing personal MacBook with Figma configuration',
      },
      {
        _id: 'reg_demo_03',
        eventId: 'evt_tech_summit_2026',
        userId: 'usr_demo_02',
        attendeeName: 'Maya Patel',
        attendeeEmail: 'maya.patel@designlab.co',
        attendeePhone: '+1 (555) 412-8920',
        ticketCode: 'EVT-4402-NX99',
        status: 'checked-in',
        registeredAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      }
    ],
  };
}

function initLocalStore() {
  if (!fs.existsSync(DATA_FILE)) {
    const seed = getSeedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    console.log('[MongoDB Engine] Initialized local MongoDB document store with sample dataset at', DATA_FILE);
  }
}

function readLocalStore(): MongoDbData {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      initLocalStore();
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[MongoDB Engine] Failed reading local store:', err);
    return getSeedData();
  }
}

function writeLocalStore(data: MongoDbData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[MongoDB Engine] Failed writing local store:', err);
  }
}

// Collection APIs mirroring MongoDB Collections
export const db = {
  users: {
    find: async (filter?: Partial<UserDoc>): Promise<UserDoc[]> => {
      if (liveDb) {
        return (await liveDb.collection<UserDoc>('users').find(filter || {}).toArray()) as UserDoc[];
      }
      const data = readLocalStore();
      if (!filter || Object.keys(filter).length === 0) return data.users;
      return data.users.filter((item) => {
        return Object.entries(filter).every(([k, v]) => (item as any)[k] === v);
      });
    },
    findOne: async (filter: Partial<UserDoc>): Promise<UserDoc | null> => {
      if (liveDb) {
        return (await liveDb.collection<UserDoc>('users').findOne(filter)) as UserDoc | null;
      }
      const data = readLocalStore();
      return (
        data.users.find((item) => {
          return Object.entries(filter).every(([k, v]) => (item as any)[k] === v);
        }) || null
      );
    },
    insertOne: async (doc: Omit<UserDoc, '_id'> & { _id?: string }): Promise<UserDoc> => {
      const fullDoc: UserDoc = {
        _id: doc._id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...doc,
      };
      if (liveDb) {
        await liveDb.collection('users').insertOne(fullDoc as any);
        return fullDoc;
      }
      const data = readLocalStore();
      data.users.push(fullDoc);
      writeLocalStore(data);
      return fullDoc;
    },
    updateOne: async (filter: Partial<UserDoc>, update: Partial<UserDoc>): Promise<boolean> => {
      if (liveDb) {
        const res = await liveDb.collection('users').updateOne(filter as any, { $set: update });
        return res.modifiedCount > 0;
      }
      const data = readLocalStore();
      const idx = data.users.findIndex((item) =>
        Object.entries(filter).every(([k, v]) => (item as any)[k] === v)
      );
      if (idx === -1) return false;
      data.users[idx] = { ...data.users[idx], ...update };
      writeLocalStore(data);
      return true;
    },
    countDocuments: async (): Promise<number> => {
      if (liveDb) return await liveDb.collection('users').countDocuments();
      return readLocalStore().users.length;
    },
  },

  events: {
    find: async (query?: {
      category?: string;
      status?: string;
      search?: string;
    }): Promise<EventDoc[]> => {
      let list: EventDoc[] = [];
      if (liveDb) {
        const mongoFilter: any = {};
        if (query?.category && query.category !== 'All') mongoFilter.category = query.category;
        if (query?.status && query.status !== 'All') mongoFilter.status = query.status;
        list = (await liveDb.collection<EventDoc>('events').find(mongoFilter).toArray()) as EventDoc[];
      } else {
        const data = readLocalStore();
        list = [...data.events];
      }

      // Filter in memory for text search and category
      if (query?.category && query.category !== 'All') {
        list = list.filter((e) => e.category.toLowerCase() === query.category!.toLowerCase());
      }
      if (query?.status && query.status !== 'All') {
        list = list.filter((e) => e.status.toLowerCase() === query.status!.toLowerCase());
      }
      if (query?.search && query.search.trim()) {
        const q = query.search.toLowerCase().trim();
        list = list.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.venue.toLowerCase().includes(q) ||
            e.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      // Sort by date ascending
      return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    findOne: async (filter: Partial<EventDoc>): Promise<EventDoc | null> => {
      if (liveDb) {
        return (await liveDb.collection<EventDoc>('events').findOne(filter)) as EventDoc | null;
      }
      const data = readLocalStore();
      return (
        data.events.find((item) =>
          Object.entries(filter).every(([k, v]) => (item as any)[k] === v)
        ) || null
      );
    },
    insertOne: async (doc: Omit<EventDoc, '_id'> & { _id?: string }): Promise<EventDoc> => {
      const fullDoc: EventDoc = {
        _id: doc._id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...doc,
      };
      if (liveDb) {
        await liveDb.collection('events').insertOne(fullDoc as any);
        return fullDoc;
      }
      const data = readLocalStore();
      data.events.unshift(fullDoc);
      writeLocalStore(data);
      return fullDoc;
    },
    updateOne: async (filter: Partial<EventDoc>, update: Partial<EventDoc>): Promise<boolean> => {
      if (liveDb) {
        const res = await liveDb.collection('events').updateOne(filter as any, { $set: update });
        return res.modifiedCount > 0;
      }
      const data = readLocalStore();
      const idx = data.events.findIndex((item) =>
        Object.entries(filter).every(([k, v]) => (item as any)[k] === v)
      );
      if (idx === -1) return false;
      data.events[idx] = { ...data.events[idx], ...update };
      writeLocalStore(data);
      return true;
    },
    deleteOne: async (filter: Partial<EventDoc>): Promise<boolean> => {
      if (liveDb) {
        const res = await liveDb.collection('events').deleteOne(filter as any);
        return res.deletedCount > 0;
      }
      const data = readLocalStore();
      const initialLen = data.events.length;
      data.events = data.events.filter(
        (item) => !Object.entries(filter).every(([k, v]) => (item as any)[k] === v)
      );
      if (data.events.length !== initialLen) {
        writeLocalStore(data);
        return true;
      }
      return false;
    },
    countDocuments: async (): Promise<number> => {
      if (liveDb) return await liveDb.collection('events').countDocuments();
      return readLocalStore().events.length;
    },
  },

  registrations: {
    find: async (filter?: Partial<RegistrationDoc>): Promise<RegistrationDoc[]> => {
      if (liveDb) {
        return (await liveDb
          .collection<RegistrationDoc>('registrations')
          .find(filter || {})
          .toArray()) as RegistrationDoc[];
      }
      const data = readLocalStore();
      if (!filter || Object.keys(filter).length === 0) return data.registrations;
      return data.registrations.filter((item) =>
        Object.entries(filter).every(([k, v]) => (item as any)[k] === v)
      );
    },
    findOne: async (filter: Partial<RegistrationDoc>): Promise<RegistrationDoc | null> => {
      if (liveDb) {
        return (await liveDb
          .collection<RegistrationDoc>('registrations')
          .findOne(filter)) as RegistrationDoc | null;
      }
      const data = readLocalStore();
      return (
        data.registrations.find((item) =>
          Object.entries(filter).every(([k, v]) => (item as any)[k] === v)
        ) || null
      );
    },
    insertOne: async (
      doc: Omit<RegistrationDoc, '_id'> & { _id?: string }
    ): Promise<RegistrationDoc> => {
      const fullDoc: RegistrationDoc = {
        _id: doc._id || `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...doc,
      };
      if (liveDb) {
        await liveDb.collection('registrations').insertOne(fullDoc as any);
        return fullDoc;
      }
      const data = readLocalStore();
      data.registrations.unshift(fullDoc);
      writeLocalStore(data);
      return fullDoc;
    },
    updateOne: async (
      filter: Partial<RegistrationDoc>,
      update: Partial<RegistrationDoc>
    ): Promise<boolean> => {
      if (liveDb) {
        const res = await liveDb
          .collection('registrations')
          .updateOne(filter as any, { $set: update });
        return res.modifiedCount > 0;
      }
      const data = readLocalStore();
      const idx = data.registrations.findIndex((item) =>
        Object.entries(filter).every(([k, v]) => (item as any)[k] === v)
      );
      if (idx === -1) return false;
      data.registrations[idx] = { ...data.registrations[idx], ...update };
      writeLocalStore(data);
      return true;
    },
    deleteOne: async (filter: Partial<RegistrationDoc>): Promise<boolean> => {
      if (liveDb) {
        const res = await liveDb.collection('registrations').deleteOne(filter as any);
        return res.deletedCount > 0;
      }
      const data = readLocalStore();
      const initialLen = data.registrations.length;
      data.registrations = data.registrations.filter(
        (item) => !Object.entries(filter).every(([k, v]) => (item as any)[k] === v)
      );
      if (data.registrations.length !== initialLen) {
        writeLocalStore(data);
        return true;
      }
      return false;
    },
    countDocuments: async (): Promise<number> => {
      if (liveDb) return await liveDb.collection('registrations').countDocuments();
      return readLocalStore().registrations.length;
    },
  },
};

export async function getDbStatus() {
  const userCount = await db.users.countDocuments();
  const eventCount = await db.events.countDocuments();
  const regCount = await db.registrations.countDocuments();

  return {
    engine: liveDb ? 'Live MongoDB Cluster' : 'Local Persistent MongoDB Document Engine',
    isLiveCluster: !!liveDb,
    databaseName: liveDb ? liveDb.databaseName : 'eventsphere_db',
    connectionString: activeMongoUri ? `${activeMongoUri.replace(/:[^:]*@/, ':****@')}` : 'mongodb://localhost:27017/eventsphere_db (Emulated)',
    status: 'Connected & Operational',
    collections: [
      { name: 'events', count: eventCount, description: 'Events collection with schedules, capacity, and venues' },
      { name: 'users', count: userCount, description: 'User documents with role-based access (admin/attendee)' },
      { name: 'registrations', count: regCount, description: 'Participant tickets, digital codes & check-in state' },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function resetDemoData() {
  const seed = getSeedData();
  writeLocalStore(seed);
  return seed;
}
