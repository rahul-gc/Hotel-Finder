import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Booking {
  id: string;
  hotel_id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  num_rooms: number;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  special_requests: string;
  created_at: string;
  hotel: {
    name: string;
    city: string;
    images: { image_url: string }[];
  };
}

const MyBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/my-bookings");
      return;
    }
    fetchBookings();
  }, [isAuthenticated, user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          hotel:hotels(name, city, images:hotel_images(image_url))
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({ title: "Failed to load bookings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
      
      toast({ title: "Booking cancelled" });
      fetchBookings();
    } catch (error: any) {
      toast({ title: "Failed to cancel", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700"><AlertCircle className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" /> Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No bookings yet</p>
                <Link to="/search">
                  <Button>Search Hotels</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 flex flex-col md:flex-row gap-4"
                  >
                    <div className="w-full md:w-32 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {booking.hotel?.images?.[0] ? (
                        <img
                          src={booking.hotel.images[0].image_url}
                          alt={booking.hotel.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <MapPin className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{booking.hotel?.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {booking.hotel?.city}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {booking.check_in} → {booking.check_out}
                      </div>
                      <div className="mt-1 text-sm">
                        {booking.num_guests} guests, {booking.num_rooms} room
                        {booking.num_rooms > 1 ? "s" : ""}
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="font-bold text-lg">
                          रु {booking.total_amount.toLocaleString()}
                        </span>
                        {booking.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelBooking(booking.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyBookings;
