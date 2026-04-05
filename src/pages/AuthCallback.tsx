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
        // Check for OAuth hash token in URL (Google sends #access_token=...)
        const hash = window.location.hash;
        const query = window.location.search;
        
        console.log("Auth callback - hash:", hash ? "present" : "none");
        console.log("Auth callback - query:", query);
        
        // If there's a hash with access_token, Supabase should have processed it
        // Try to get session after a short delay to let Supabase process the token
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log("Session found:", !!session);
        console.log("Session error:", error);
        
        if (error) {
          throw error;
        }

        // If no session but we have a code in URL, try to exchange it
        if (!session) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          
          if (code) {
            console.log("Found code in URL, exchanging for session...");
            setMessage("Completing authentication...");
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error("Code exchange error:", exchangeError);
              throw exchangeError;
            }
            
            if (data.session) {
              console.log("Session obtained from code exchange");
              // Use the new session
              const { data: { session: newSession } } = await supabase.auth.getSession();
              if (newSession?.user) {
                // Continue with user processing below
                // We'll use newSession instead of session
                Object.assign(session || {}, newSession);
              }
            }
          }
          
          // If still no session, try parsing hash directly
          if (!session && window.location.hash) {
            console.log("Trying to parse hash for tokens...");
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            
            if (accessToken) {
              console.log("Found access_token in hash, setting session...");
              setMessage("Processing authentication...");
              
              const { data, error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
              
              if (setSessionError) {
                console.error("Set session error:", setSessionError);
              } else if (data.session) {
                console.log("Session set successfully from hash");
                // Re-fetch session to confirm
                const { data: { session: hashSession } } = await supabase.auth.getSession();
                if (hashSession) {
                  Object.assign(session || {}, hashSession);
                }
              }
            }
          }
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
