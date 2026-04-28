import type { Booking, Garage, Review } from '../types/chat';

// Mock bookings data (sourced from MyBookings.tsx)
const BOOKINGS: Booking[] = [
  {
    id: 'BK-102938',
    userId: 'user-1',
    garage: 'Elite Auto Care',
    location: 'Downtown, Dubai',
    date: 'Oct 12, 2026',
    time: '10:00 AM',
    service: 'General Service',
    car: 'Toyota Camry (2022)',
    status: 'Confirmed',
    price: 367.50,
    type: 'upcoming',
  },
  {
    id: 'BK-102845',
    userId: 'user-1',
    garage: 'Precision Mechanics',
    location: 'Al Quoz, Dubai',
    date: 'Sep 20, 2026',
    time: '02:30 PM',
    service: 'Oil Change',
    car: 'Toyota Camry (2022)',
    status: 'Completed',
    price: 250.00,
    type: 'past',
  },
  {
    id: 'BK-102712',
    userId: 'user-1',
    garage: 'The Garage Co.',
    location: 'Jumeirah',
    date: 'Aug 15, 2026',
    time: '09:00 AM',
    service: 'Brake Repair',
    car: 'Toyota Camry (2022)',
    status: 'Cancelled',
    price: 420.00,
    type: 'past',
  },
];

// Mock garages data (sourced from GarageDetails.tsx)
const GARAGES: Garage[] = [
  {
    id: 1,
    name: 'Elite Auto Care',
    location: '123 Downtown St, Los Angeles, CA 90012',
    rating: 4.8,
    reviews: 1240,
    services: [
      { id: 1, name: 'General Service', price: 350, duration: '2-3 hours' },
      { id: 2, name: 'Full Service', price: 850, duration: '4-5 hours' },
      { id: 3, name: 'Brake Repair', price: 450, duration: '1-2 hours' },
      { id: 4, name: 'AC Service', price: 250, duration: '1 hour' },
    ],
  },
  {
    id: 2,
    name: 'Precision Mechanics',
    location: 'Al Quoz, Dubai',
    rating: 4.6,
    reviews: 850,
    services: [
      { id: 1, name: 'Oil Change', price: 150, duration: '30 mins' },
      { id: 2, name: 'Brake Repair', price: 400, duration: '1-2 hours' },
      { id: 3, name: 'General Service', price: 320, duration: '2-3 hours' },
    ],
  },
  {
    id: 3,
    name: 'The Garage Co.',
    location: 'Jumeirah, Dubai',
    rating: 4.5,
    reviews: 620,
    services: [
      { id: 1, name: 'Full Service', price: 800, duration: '4-5 hours' },
      { id: 2, name: 'AC Service', price: 220, duration: '1 hour' },
      { id: 3, name: 'Electrical Repair', price: 350, duration: '1-3 hours' },
    ],
  },
];

// Mock reviews data (sourced from AdminReviews.tsx)
const REVIEWS: Review[] = [
  {
    id: 1,
    user: 'John Doe',
    vendor: 'Elite Auto Care',
    rating: 5,
    date: '2 days ago',
    comment: 'Excellent service! The team at Elite Motors was very professional and transparent about the costs.',
    status: 'published',
  },
  {
    id: 2,
    user: 'Sarah Smith',
    vendor: 'Precision Mechanics',
    rating: 4,
    date: '1 week ago',
    comment: 'Good experience, but the waiting lounge was a bit crowded. The brake repair was done perfectly though.',
    status: 'published',
  },
  {
    id: 3,
    user: 'Mike Johnson',
    vendor: 'Elite Auto Care',
    rating: 2,
    date: '2 weeks ago',
    comment: 'The service took much longer than expected and the staff was quite rude when I asked for an update.',
    status: 'flagged',
  },
  {
    id: 4,
    user: 'Emily Davis',
    vendor: 'The Garage Co.',
    rating: 5,
    date: '3 weeks ago',
    comment: 'Best garage in town! Highly recommended for any electrical issues.',
    status: 'published',
  },
];

/**
 * Returns all bookings belonging to the given user ID.
 * Returns an empty array if no bookings are found — never throws.
 */
export function getBookingsByUserId(userId: string): Booking[] {
  try {
    return BOOKINGS.filter((b) => b.userId === userId);
  } catch {
    return [];
  }
}

/**
 * Returns all reviews for the garage whose name matches the given garage ID
 * by looking up the garage name first, then filtering reviews by vendor.
 * Returns an empty array if no reviews are found — never throws.
 */
export function getReviewsByGarageId(garageId: string): Review[] {
  try {
    const garage = GARAGES.find((g) => String(g.id) === String(garageId));
    if (!garage) return [];
    return REVIEWS.filter(
      (r) => r.vendor.toLowerCase() === garage.name.toLowerCase(),
    );
  } catch {
    return [];
  }
}

/**
 * Returns all reviews whose vendor name matches the given garage name
 * (case-insensitive).
 * Returns an empty array if no reviews are found — never throws.
 */
export function getReviewsByGarageName(garageName: string): Review[] {
  try {
    const target = garageName.toLowerCase();
    return REVIEWS.filter((r) => r.vendor.toLowerCase() === target);
  } catch {
    return [];
  }
}

/**
 * Returns all garages that offer at least one service whose name contains
 * the given service type string (case-insensitive partial match).
 * Returns an empty array if no garages are found — never throws.
 */
export function getGaragesByServiceType(serviceType: string): Garage[] {
  try {
    const target = serviceType.toLowerCase();
    return GARAGES.filter((g) =>
      g.services.some((s) => s.name.toLowerCase().includes(target)),
    );
  } catch {
    return [];
  }
}
