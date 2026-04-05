import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
