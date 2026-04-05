import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

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
  const fetchProfile = async (userId: string) => {
    // Clear any stuck locks before fetching
    try {
      localStorage.removeItem('lock:sb-qkylzwrpttwlldmydleg-auth-token');
      localStorage.removeItem('lock:sb-auth-token');
    } catch {
      // Ignore
    }
    
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
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Check current session on mount
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.warn("SignOut error (continuing with local cleanup):", error?.message || error);
    } finally {
      // Always clear local state regardless of server response
      setUser(null);
      setProfile(null);
      // Force clear any stuck auth locks from localStorage
      try {
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.startsWith('sb-') || key.includes('supabase') || key.includes('lock:')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (e) {
        console.warn("Could not clear localStorage:", e);
      }
    }
  };

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

import { useNavigate, useLocation } from "react-router-dom";
