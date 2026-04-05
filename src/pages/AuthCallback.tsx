import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, STORAGE_KEY, clearAuthStorage } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Clear any existing auth state first
        clearAuthStorage();

        // Parse tokens from URL hash (Google OAuth sends #access_token=...)
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');
        const tokenType = params.get('token_type') || 'bearer';
        const providerToken = params.get('provider_token');
        
        console.log("Auth callback - hash present:", !!hash);
        console.log("Auth callback - access_token present:", !!accessToken);
        
        if (!accessToken) {
          console.error("No access token found in URL hash");
          toast({ title: "Authentication failed", variant: "destructive" });
          navigate("/login", { replace: true });
          return;
        }
        
        // Manually store the session data using CORRECT storage key
        setMessage("Storing session...");
        
        const sessionData = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: parseInt(expiresIn || '3600', 10),
          expires_at: Math.floor(Date.now() / 1000) + parseInt(expiresIn || '3600', 10),
          token_type: tokenType,
          provider_token: providerToken,
          user: null // Will be fetched after storing
        };
        
        // Store in localStorage using Supabase's expected format
        try {
          // Clear any existing lock keys first
          clearAuthStorage();
          
          // Store the session with CORRECT key
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
          console.log("Session stored successfully with key:", STORAGE_KEY);
          
          // Set the session in Supabase so we can get user data
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (setSessionError) {
            console.error("Error setting session:", setSessionError);
            throw setSessionError;
          }
          
          // Get user data
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            console.error("No user data after OAuth:", userError);
            throw new Error("Failed to get user data after authentication");
          }
          
          console.log("User authenticated:", user.email);
          setMessage("Checking your profile...");
          
          // Wait for database trigger to create profile, then fetch it
          // The trigger runs automatically when auth.users row is created
          let profile = null;
          let attempts = 0;
          const maxAttempts = 5;
          
          while (!profile && attempts < maxAttempts) {
            const { data: profileData, error: profileError } = await supabase
              .from("users")
              .select("*")
              .eq("id", user.id)
              .single();
            
            if (profileError) {
              console.log(`Profile not found yet, attempt ${attempts + 1}/${maxAttempts}`);
              if (profileError.code === "PGRST116") {
                // Profile doesn't exist yet, wait for trigger
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 500));
              } else {
                console.error("Error fetching profile:", profileError);
                break;
              }
            } else {
              profile = profileData;
              console.log("Profile found:", profile);
              break;
            }
          }
          
          if (!profile) {
            console.warn("Profile not created by trigger, this may cause issues");
          }
          
          // Clear the hash
          window.location.hash = '';
          
          // Show success and redirect
          toast({ title: "Login successful!" });
          
          // Navigate to home instead of reload for smoother UX
          navigate("/", { replace: true });
          
        } catch (storageError: any) {
          console.error("Error storing session:", storageError);
          toast({ 
            title: "Authentication failed", 
            description: storageError.message,
            variant: "destructive" 
          });
          navigate("/login", { replace: true });
        }
        
      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast({ 
          title: "Authentication failed", 
          description: error.message,
          variant: "destructive" 
        });
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
