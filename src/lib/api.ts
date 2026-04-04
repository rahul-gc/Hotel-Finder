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
      let query = supabase
        .from('hotels')
        .select(`
          *,
          images:hotel_images(*),
          reviews:hotel_reviews(*)
        `, { count: 'exact' });

      // Apply filters
      if (params.city) {
        query = query.eq('city', params.city);
      }
      if (params.minPrice) {
        query = query.gte('price_per_night', params.minPrice);
      }
      if (params.maxPrice) {
        query = query.lte('price_per_night', params.maxPrice);
      }
      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      // Only show verified hotels
      query = query.eq('status', 'verified');

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      return {
        hotels: data || [],
        pagination: {
          current: params.page || 1,
          pages: Math.ceil((count || 0) / (params.limit || 10)),
          total: count || 0,
          limit: params.limit || 10
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

      return {
        message: 'Login successful',
        token: data.session?.access_token,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: data.user?.user_metadata?.name || 'User'
        }
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

      return { 
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'User'
        }
      };
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
}

export const apiService = new ApiService();
export { ApiError };
