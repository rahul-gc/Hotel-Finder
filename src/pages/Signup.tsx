import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hotel, ArrowLeft, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/supabase";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "hotel_owner">("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    
    try {
      // Sign up with Supabase - trigger will auto-create profile
      const data = await db.signUp(email, password, { name: fullName, role: role });
      
      if (data.user) {
        toast({ title: "Account created! Please check your email to verify, then log in." });
        navigate("/login");
      }
    } catch (error: any) {
      toast({ 
        title: "Signup failed", 
        description: error.message || "Something went wrong",
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
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>Join VerifiedStay Nepal today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
              </div>
              
              <div className="space-y-2">
                <Label>I want to</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as "user" | "hotel_owner")} className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-colors ${role === 'user' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" /> Find Hotels
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-colors ${role === 'hotel_owner' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="hotel_owner" id="hotel_owner" />
                    <Label htmlFor="hotel_owner" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="h-4 w-4" /> List My Hotel
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
