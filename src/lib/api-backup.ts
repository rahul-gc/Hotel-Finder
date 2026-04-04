import { supabase } from './supabase';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  // Hotels
  async getHotels(params: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select(`
          *,
          owner:users(name, email),
          images:hotel_images(*),
          reviews:hotel_reviews(*)
        `, { count: 'exact' });

      if (error) throw new Error(error.message);

      return {
        hotels: data || [],
        pagination: {
          current: 1,
          pages: 1,
          total: data?.length || 0,
          limit: 10
        }
      };
    } catch (error) {
      throw new ApiError(500, error instanceof Error ? error.message : 'Failed to fetch hotels');
    }
  }

  async getHotelById(id: string) {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select(`
          *,
          owner:users(name, email, phone),
          images:hotel_images(*),
          reviews:hotel_reviews(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ApiError(404, 'Hotel not found');
        }
        throw new Error(error.message);
      }

      return { hotel: data };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, error instanceof Error ? error.message : 'Failed to fetch hotel');
    }
  }

  // Authentication
  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            role: userData.role || 'user'
          }
        }
      });

      if (error) throw new Error(error.message);

      // Create user profile
      if (data.user) {
        await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role || 'user'
          });
      }

      return {
        message: 'User registered successfully',
        user: {
          id: data.user?.id,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'user'
        }
      };
    } catch (error) {
      throw new ApiError(500, error instanceof Error ? error.message : 'Registration failed');
    }
  }

  async login(credentials: { email: string; password: string }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw new Error(error.message);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      return {
        message: 'Login successful',
        token: data.session?.access_token,
        user: profile
      };
    } catch (error) {
      throw new ApiError(401, error instanceof Error ? error.message : 'Login failed');
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        throw new ApiError(404, 'User profile not found');
      }

      return { user: profile };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to get current user');
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      return { message: 'Logout successful' };
    } catch (error) {
      throw new ApiError(500, error instanceof Error ? error.message : 'Logout failed');
    }
  }

  // Bookings
  async createBooking(bookingData: any) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select(`
          *,
          hotel:hotels(name, address, city),
          user:users(name, email)
        `)
        .single();

      if (error) throw new Error(error.message);

      return { booking: data };
    } catch (error) {
      throw new ApiError(500, error instanceof Error ? error.message : 'Failed to create booking');
    }
  }

  async getMyBookings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          hotel:hotels(name, address, city, images)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return { bookings: data || [] };
    } catch (error) {
      throw new ApiError(500, error instanceof Error ? error.message : 'Failed to fetch bookings');
    }
  }
}

export const apiService = new ApiService();
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request(`/hotels${queryString ? `?${queryString}` : ''}`);
  }

  async getHotel(id: string) {
    return this.request(`/hotels/${id}`);
  }

  async createHotel(hotelData: any) {
    return this.request('/hotels', {
      method: 'POST',
      body: JSON.stringify(hotelData),
    });
  }

  async updateHotel(id: string, hotelData: any) {
    return this.request(`/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hotelData),
    });
  }

  async addReview(hotelId: string, reviewData: {
    cleanliness_rating: number;
    location_rating: number;
    service_rating: number;
    overall_rating: number;
    comment?: string;
    user_name?: string;
  }) {
    return this.request(`/hotels/${hotelId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getMyHotels() {
    return this.request('/hotels/owner/my-hotels');
  }

  async verifyHotel(id: string, status: 'verified' | 'rejected', rejectionReason?: string) {
    return this.request(`/hotels/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejection_reason: rejectionReason }),
    });
  }

  // Booking endpoints
  async createBooking(bookingData: {
    hotel_id: string;
    check_in_date: string;
    check_out_date: string;
    num_rooms: number;
    num_guests: number;
    guest_details: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
    special_requests?: string;
  }) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings(params: { status?: string; page?: number; limit?: number } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request(`/bookings/my-bookings${queryString ? `?${queryString}` : ''}`);
  }

  async getBooking(id: string) {
    return this.request(`/bookings/${id}`);
  }

  async updateBookingStatus(id: string, status: 'confirmed' | 'cancelled') {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getHotelBookings(hotelId: string, params: { status?: string; page?: number; limit?: number } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request(`/bookings/hotel/${hotelId}${queryString ? `?${queryString}` : ''}`);
  }

  // User endpoints (admin)
  async getUsers(params: { page?: number; limit?: number; role?: string; search?: string } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(userData: { name?: string; phone?: string }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
}

export const apiService = new ApiService();
export { ApiError };
