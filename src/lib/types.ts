export type HotelStatus = "pending" | "verified" | "rejected";

export interface Hotel {
  id: string;
  name: string;
  owner_id: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  num_rooms: number;
  amenities: string[];
  phone: string;
  email?: string;
  status: HotelStatus;
  verified_at?: string;
  created_at: string;
  images: HotelImage[];
  reviews?: Review[];
  average_rating?: number;
  review_count?: number;
}

export interface HotelImage {
  id: string;
  hotel_id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Review {
  id: string;
  hotel_id: string;
  user_id: string;
  user_name?: string;
  cleanliness_rating: number;
  location_rating: number;
  service_rating: number;
  overall_rating: number;
  comment: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface SearchFilters {
  priceRange: [number, number];
  minRating: number;
  distanceRadius: number;
  amenities: string[];
  city?: string;
}

export const AMENITIES = [
  "WiFi",
  "AC",
  "Parking",
  "Pool",
  "Restaurant",
  "Gym",
  "Spa",
  "Room Service",
  "Laundry",
  "Bar",
] as const;

export const CITIES = ["Kathmandu", "Pokhara", "Chitwan", "Lumbini", "Nagarkot", "Bhaktapur"] as const;
