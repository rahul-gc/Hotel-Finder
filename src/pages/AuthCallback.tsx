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
        
        if (!accessToken) {
          console.error("No access token found");
          toast({ title: "Authentication failed", variant: "destructive" });
          navigate("/login", { replace: true });
          return;
        }
        
        // Set the session in Supabase
        const { error: setError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (setError) {
          console.error("Error setting session:", setError);
          throw setError;
        }
        
        // Get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("No user data:", userError);
          throw new Error("Failed to get user");
        }
        
        console.log("Authenticated:", user.email);
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profileError && profileError.code === "PGRST116") {
          console.log("Creating profile...");
          // Create profile manually if trigger didn't work
          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            email: user.email,
            username: user.email?.split("@")[0] + "_" + user.id.substring(0, 4),
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            role: "user",
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
          if (insertError) {
            console.error("Error creating profile:", insertError);
          }
        }
        
        // Clear hash and redirect
        window.location.hash = '';
        toast({ title: "Login successful!" });
        navigate("/", { replace: true });
        
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
