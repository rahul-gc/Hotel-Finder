import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Get the correct storage key based on Supabase project ID
const getStorageKey = () => {
  try {
    const url = new URL(supabaseUrl);
    const projectId = url.hostname.split('.')[0];
    return `sb-${projectId}-auth-token`;
  } catch {
    return 'sb-auth-token';
  }
};

export const STORAGE_KEY = getStorageKey();

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: STORAGE_KEY,
  },
});

// Helper to clear all auth-related locks and storage
export const clearAuthStorage = () => {
  try {
    // Clear all known lock keys
    const lockKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('lock:sb-') || key.includes('auth-token-lock')
    );
    lockKeys.forEach(key => localStorage.removeItem(key));
    
    // Clear auth token
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('sb-auth-token');
  } catch (e) {
    console.error('Error clearing auth storage:', e);
  }
};

// Database helper functions for frontend
export const db = {
  // Authentication
  async signUp(email: string, password: string, metadata: any = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    // Clear storage first to prevent lock issues
    clearAuthStorage();
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Even if signOut fails, clear everything
      clearAuthStorage();
      throw error;
    }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getSession() {
    // Clear locks before getting session
    clearAuthStorage();
    
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Hotels
  async getHotels(filters: any = {}) {
    let query = supabase
      .from('hotels')
      .select(`
        *,
        owner:users(name, email),
        images:hotel_images(*),
        reviews:hotel_reviews(*)
      `)
      .eq('status', 'verified');

    // Apply filters
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    if (filters.minPrice) {
      query = query.gte('price_per_night', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price_per_night', filters.maxPrice);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getHotelById(hotelId: string) {
    const { data, error } = await supabase
      .from('hotels')
      .select(`
        *,
        owner:users(name, email, phone),
        images:hotel_images(*),
        reviews:hotel_reviews(*)
      `)
      .eq('id', hotelId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createHotel(hotelData: any) {
    const { data, error } = await supabase
      .from('hotels')
      .insert([hotelData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateHotel(hotelId: string, updateData: any) {
    const { data, error } = await supabase
      .from('hotels')
      .update(updateData)
      .eq('id', hotelId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMyHotels() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Reviews
  async createReview(reviewData: any) {
    const { data, error } = await supabase
      .from('hotel_reviews')
      .insert([reviewData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Bookings
  async createBooking(bookingData: any) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select(`
        *,
        hotel:hotels(name, address, city),
        user:users(name, email)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMyBookings(filters: any = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('bookings')
      .select(`
        *,
        hotel:hotels(name, address, city, images)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getBooking(bookingId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotel:hotels(name, address, city, images, owner_id),
        user:users(name, email)
      `)
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateBookingStatus(bookingId: string, status: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        payment_status: status === 'confirmed' ? 'paid' : status === 'cancelled' ? 'refunded' : 'pending'
      })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getHotelBookings(hotelId: string, filters: any = {}) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        user:users(name, email, phone)
      `)
      .eq('hotel_id', hotelId)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // User profile
  async getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUserProfile(updateData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Export types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          role: 'user' | 'hotel_owner' | 'admin';
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      hotels: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
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
          website?: string;
          status: 'pending' | 'verified' | 'rejected';
          verified_at?: string;
          rejection_reason?: string;
          average_rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hotels']['Row'], 'id' | 'created_at' | 'updated_at' | 'average_rating' | 'review_count'>;
        Update: Partial<Database['public']['Tables']['hotels']['Insert']>;
      };
      // ... other table types
    };
  };
};

export type UserRole = 'user' | 'hotel_owner' | 'admin';
