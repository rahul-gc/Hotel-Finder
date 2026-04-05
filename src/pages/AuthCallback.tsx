import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
        
        // Manually store the session data
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
          localStorage.removeItem('lock:sb-qkylzwrpttwlldmydleg-auth-token');
          localStorage.removeItem('lock:sb-auth-token');
          
          // Store the session
          localStorage.setItem('sb-auth-token', JSON.stringify(sessionData));
          console.log("Session stored successfully");
          
          // Set the session in Supabase so we can get user data
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          // Get user data
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            console.log("User authenticated:", user.email);
            
            // Check if user profile exists, if not create it
            const { data: profile, error: profileError } = await supabase
              .from("users")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profileError && profileError.code === "PGRST116") {
              // Profile doesn't exist, create it
              setMessage("Setting up your account...");
              console.log("Creating new user profile...");
              
              const { error: insertError } = await supabase.from("users").insert({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
                username: user.user_metadata?.preferred_username || user.email?.split("@")[0] || `user_${Date.now()}`,
                role: "user",
                is_verified: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

              if (insertError) {
                console.error("Error creating profile:", insertError);
              } else {
                console.log("User profile created successfully");
              }
            } else {
              console.log("User profile already exists");
            }
          }
          
          // Clear the hash
          window.location.hash = '';
          
          // Force reload to let the app pick up the new session
          window.location.href = '/';
          
        } catch (storageError) {
          console.error("Error storing session:", storageError);
          toast({ title: "Authentication failed", variant: "destructive" });
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
