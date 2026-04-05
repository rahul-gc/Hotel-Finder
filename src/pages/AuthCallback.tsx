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
        
        // Use Supabase's setSession with retry
        let sessionSet = false;
        let retries = 3;
        
        while (retries > 0 && !sessionSet) {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (!error) {
              sessionSet = true;
              console.log("Session set successfully");
              break;
            }
            
            console.warn("Set session error:", error);
          } catch (err) {
            console.warn("Set session attempt failed:", err);
          }
          
          retries--;
          if (retries > 0) {
            // Clear lock and retry
            try {
              localStorage.removeItem('lock:sb-qkylzwrpttwlldmydleg-auth-token');
              localStorage.removeItem('lock:sb-auth-token');
            } catch {}
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!sessionSet) {
          throw new Error("Failed to set session after retries");
        }
        
        // Clear hash and navigate
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
