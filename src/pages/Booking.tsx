import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, CreditCard, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface BookingFormData {
  hotelId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  totalPrice: number;
}

const BookingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    guests: 2,
    rooms: 1,
    guestName: profile?.name || "",
    guestEmail: profile?.email || "",
  });

  // Get hotel info from URL params or state
  const searchParams = new URLSearchParams(window.location.search);
  const hotelId = searchParams.get("hotelId");
  const hotelName = searchParams.get("hotelName") || "Hotel";
  const pricePerNight = parseInt(searchParams.get("price") || "5000");

  // Redirect if not authenticated
  if (!isAuthenticated) {
    toast({
      title: "Login Required",
      description: "Please login to book a hotel.",
      variant: "destructive",
    });
    navigate(`/login?redirect=/booking?hotelId=${hotelId}`);
    return null;
  }

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 1;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const rooms = formData.rooms || 1;
    return nights * rooms * pricePerNight;
  };

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!hotelId || !user) return;

    setLoading(true);
    try {
      const nights = calculateNights();
      const totalAmount = calculateTotal();

      const bookingData = {
        user_id: user.id,
        hotel_id: hotelId,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        num_guests: formData.guests,
        num_rooms: formData.rooms,
        total_amount: totalAmount,
        status: "pending",
        special_requests: formData.specialRequests,
        guest_name: formData.guestName,
        guest_email: formData.guestEmail,
        guest_phone: formData.guestPhone,
      };

      const { data, error } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Booking confirmed!" });
      navigate("/my-bookings");
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Book {hotelName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      <Calendar className="h-4 w-4 inline mr-1" /> Check-in
                    </Label>
                    <Input
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) =>
                        handleInputChange("checkIn", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      <Calendar className="h-4 w-4 inline mr-1" /> Check-out
                    </Label>
                    <Input
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) =>
                        handleInputChange("checkOut", e.target.value)
                      }
                      min={formData.checkIn}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      <Users className="h-4 w-4 inline mr-1" /> Guests
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.guests}
                      onChange={(e) =>
                        handleInputChange("guests", parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rooms</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.rooms}
                      onChange={(e) =>
                        handleInputChange("rooms", parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>
                      रु {pricePerNight.toLocaleString()} x {calculateNights()}{" "}
                      nights
                    </span>
                    <span>रु {(pricePerNight * calculateNights()).toLocaleString()}</span>
                  </div>
                  {formData.rooms && formData.rooms > 1 && (
                    <div className="flex justify-between text-sm mt-1">
                      <span>x {formData.rooms} rooms</span>
                    </div>
                  )}
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      रु {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full"
                  disabled={!formData.checkIn || !formData.checkOut}
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Guest Name</Label>
                    <Input
                      value={formData.guestName}
                      onChange={(e) =>
                        handleInputChange("guestName", e.target.value)
                      }
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) =>
                        handleInputChange("guestEmail", e.target.value)
                      }
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.guestPhone}
                      onChange={(e) =>
                        handleInputChange("guestPhone", e.target.value)
                      }
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Special Requests (optional)</Label>
                    <Input
                      value={formData.specialRequests}
                      onChange={(e) =>
                        handleInputChange("specialRequests", e.target.value)
                      }
                      placeholder="Any special requirements..."
                    />
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Booking Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {hotelName}
                  </p>
                  <p className="text-sm">
                    {formData.checkIn} → {formData.checkOut}
                  </p>
                  <p className="text-sm">
                    {formData.guests} guests, {formData.rooms} room
                    {formData.rooms && formData.rooms > 1 ? "s" : ""}
                  </p>
                  <p className="font-bold mt-2 text-lg">
                    Total: रु {calculateTotal().toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={
                      loading ||
                      !formData.guestName ||
                      !formData.guestEmail ||
                      !formData.guestPhone
                    }
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" /> Confirm Booking
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
