import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2, MapPin, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  price_per_night: number;
  average_rating: number;
  review_count: number;
  status: "pending" | "verified" | "rejected";
  images?: { image_url: string; is_primary: boolean }[];
}

const MyHotels = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, profile, isLoading } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login?redirect=/my-hotels");
      return;
    }
    if (isAuthenticated && profile) {
      fetchMyHotels();
    }
  }, [isAuthenticated, profile, isLoading, navigate]);

  const fetchMyHotels = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from("hotels")
        .select(`
          *,
          images:hotel_images(image_url, is_primary)
        `)
        .eq("owner_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHotels(data || []);
    } catch (error: any) {
      toast({ 
        title: "Failed to load hotels", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("hotels").delete().eq("id", id);
      if (error) throw error;
      
      toast({ title: "Hotel deleted successfully" });
      fetchMyHotels();
    } catch (error: any) {
      toast({ 
        title: "Failed to delete hotel", 
        description: error.message,
        variant: "destructive" 
      });
    }
    setDeleteId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-700">Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPrimaryImage = (hotel: Hotel) => {
    const primary = hotel.images?.find(img => img.is_primary);
    return primary?.image_url || hotel.images?.[0]?.image_url || 
      `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400`;
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Hotels</h1>
          <Link to="/register-hotel">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add New Hotel
            </Button>
          </Link>
        </div>

        {hotels.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't registered any hotels yet.</p>
              <Link to="/register-hotel">
                <Button>Register Your First Hotel</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {hotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-48 flex-shrink-0">
                    <img
                      src={getPrimaryImage(hotel)}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{hotel.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {hotel.city}
                        </p>
                      </div>
                      {getStatusBadge(hotel.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {hotel.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="font-bold text-primary">
                        रु {hotel.price_per_night.toLocaleString()}/night
                      </span>
                      {hotel.average_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {hotel.average_rating.toFixed(1)} ({hotel.review_count})
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit2 className="h-3 w-3" /> Edit
                      </Button>
                      
                      <AlertDialog open={deleteId === hotel.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 text-red-600 hover:text-red-700"
                            onClick={() => setDeleteId(hotel.id)}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Hotel?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{hotel.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(hotel.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Link to={`/hotel/${hotel.id}`} className="ml-auto">
                        <Button variant="secondary" size="sm">View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHotels;
