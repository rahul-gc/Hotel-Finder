import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase, clearAuthStorage, STORAGE_KEY } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";

type UserRole = "user" | "hotel_owner" | "admin";

interface AuthContextType {
  user: User | null;
  profile: { id: string; role: UserRole; name: string; email: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isHotelOwner: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    // Clear any stuck locks before fetching
    clearAuthStorage();
    
    const { data, error } = await supabase
      .from("users")
      .select("id, role, name, email")
      .eq("id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as AuthContextType["profile"];
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile]);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // Clear any stuck locks before getting session
        clearAuthStorage();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          // Clear everything on error
          clearAuthStorage();
          setUser(null);
          setProfile(null);
        } else if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        clearAuthStorage();
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [fetchProfile]);

  // Subscribe to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          // Immediately clear state on signout
          setUser(null);
          setProfile(null);
          clearAuthStorage();
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    // IMMEDIATELY clear local state first (fixes UI lag)
    setUser(null);
    setProfile(null);
    setIsLoading(true);
    
    // Clear all storage
    clearAuthStorage();
    
    try {
      // Call Supabase signOut
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("Supabase signOut error:", error.message);
      }
    } catch (error: any) {
      console.warn("SignOut exception:", error?.message || error);
    } finally {
      // Double-check everything is cleared
      clearAuthStorage();
      
      // Force a small delay to ensure state updates propagate
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === "admin",
    isHotelOwner: profile?.role === "hotel_owner" || profile?.role === "admin",
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth(redirectTo: string = "/login") {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(`${redirectTo}?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, redirectTo]);

  return { isAuthenticated, isLoading };
}
