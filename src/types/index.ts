export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone?: string;
  organization?: string;
  createdAt: string;
}

export interface EventItem {
  _id: string;
  title: string;
  category: 'Tech' | 'Design' | 'Music' | 'Business' | 'Community';
  description: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  locationAddress: string;
  capacity: number;
  registeredCount: number;
  ticketPrice: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image: string;
  organizer: string;
  tags: string[];
  createdAt: string;
}

export interface Registration {
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
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  event?: EventItem;
}

export interface MongoCollectionInfo {
  name: string;
  count: number;
  description: string;
}

export interface MongoDbStatus {
  engine: string;
  isLiveCluster: boolean;
  databaseName: string;
  connectionString: string;
  status: string;
  collections: MongoCollectionInfo[];
  timestamp: string;
}
