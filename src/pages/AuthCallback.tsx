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
        // Parse tokens from URL hash
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
          console.error("No access token found");
          toast({ title: "Authentication failed", variant: "destructive" });
          navigate("/login", { replace: true });
          return;
        }
        
        setMessage("Setting up session...");
        
        // Clear any existing locks before setting session
        try {
          localStorage.removeItem('lock:sb-qkylzwrpttwlldmydleg-auth-token');
          localStorage.removeItem('lock:sb-auth-token');
        } catch {}
        
        // Wait for locks to clear
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use Supabase's setSession to properly store in memory storage
        setMessage("Setting up session...");
        
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            console.error("Set session error:", error);
            throw error;
          }
          
          console.log("Session set successfully");
          
          // Get user data after setting session
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Check if user profile exists, if not create it
            const { data: profile, error: profileError } = await supabase
              .from("users")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profileError && profileError.code === "PGRST116") {
              // Profile doesn't exist, create it
              setMessage("Setting up your account...");
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
              }
            }
          }
          
          // Clear the hash
          window.location.hash = '';
          
          // Navigate to home
          toast({ title: "Login successful!" });
          navigate("/", { replace: true });
          
        } catch (sessionError) {
          console.error("Error setting session:", sessionError);
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
