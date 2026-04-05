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
        // Check for code in query params (PKCE flow)
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        
        // Check for tokens in hash (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log("Auth callback - code present:", !!code);
        console.log("Auth callback - access_token present:", !!accessToken);
        
        // Handle PKCE code exchange
        if (code) {
          setMessage("Completing authentication...");
          console.log("Exchanging code for session...");
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Code exchange error:", error);
            throw error;
          }
          
          if (data.session) {
            console.log("Session obtained from code exchange");
            await completeAuthFlow();
            return;
          }
        }
        
        // Handle implicit flow with access_token
        if (accessToken) {
          setMessage("Setting up session...");
          console.log("Using access token from hash...");
          
          // Clear any existing locks before setting session
          try {
            localStorage.removeItem('lock:sb-qkylzwrpttwlldmydleg-auth-token');
            localStorage.removeItem('lock:sb-auth-token');
          } catch {}
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            console.error("Set session error:", error);
            throw error;
          }
          
          console.log("Session set successfully");
          window.location.hash = '';
          await completeAuthFlow();
          return;
        }
        
        // No code or token found
        console.error("No authentication code or token found");
        toast({ title: "Authentication failed", variant: "destructive" });
        navigate("/login", { replace: true });
        
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
    
    // Helper function to complete auth flow after session is established
    const completeAuthFlow = async () => {
      // Get user data
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user profile exists, if not create it
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
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
        
        toast({ title: "Login successful!" });
        navigate("/", { replace: true });
      } else {
        toast({ title: "Authentication failed", variant: "destructive" });
        navigate("/login", { replace: true });
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
