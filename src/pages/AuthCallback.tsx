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
        // Clear any existing lock to prevent contention
        try {
          localStorage.removeItem('lock:sb-qkylzwrpttwlldmydleg-auth-token');
          localStorage.removeItem('lock:sb-auth-token');
        } catch (e) {
          // Ignore
        }
        
        // Wait for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get the session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log("Auth callback - Session found:", !!session);
        
        if (error) {
          throw error;
        }

        if (session?.user) {
          console.log("User authenticated:", session.user.email);
          // Check if user profile exists, if not create it
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError && profileError.code === "PGRST116") {
            // Profile doesn't exist, create it
            setMessage("Setting up your account...");
            const { error: insertError } = await supabase.from("users").insert({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email?.split("@")[0] || "User",
              username: session.user.user_metadata.preferred_username || session.user.email?.split("@")[0] || `user_${Date.now()}`,
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
          // No session found, redirect to login
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
