import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Hotel, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db, supabase } from "@/lib/supabase";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmail, setIsEmail] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get redirect path from query params
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    
    try {
      // Try to login with identifier as email first
      // If it doesn't contain @, we'll try to look up the email by username
      let emailToUse = identifier;
      
      if (!identifier.includes('@')) {
        // It's a username, look up the email
        const { data: userData, error: lookupError } = await supabase
          .from('users')
          .select('email')
          .eq('username', identifier)
          .single();
        
        if (lookupError || !userData) {
          toast({ 
            title: "User not found", 
            description: "No user found with that username",
            variant: "destructive" 
          });
          setLoading(false);
          return;
        }
        
        emailToUse = userData.email;
      }
      
      const data = await db.signIn(emailToUse, password);
      if (data.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          toast({ 
            title: "Email not verified", 
            description: "Please check your email and click the confirmation link before logging in.",
            variant: "destructive" 
          });
          setLoading(false);
          return;
        }
        toast({ title: "Login successful!" });
        navigate(redirectTo);
      }
    } catch (error: any) {
      toast({ 
        title: "Login failed", 
        description: error.message || "Invalid credentials",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <Card>
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Hotel className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Log in to your VerifiedStay account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Email or Username</Label>
                <Input 
                  type="text" 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  placeholder="Enter email or username" 
                />
                <p className="text-xs text-muted-foreground">
                  Enter your email or username to login
                </p>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
