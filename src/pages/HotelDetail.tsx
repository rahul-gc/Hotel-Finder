import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Shield, MapPin, Phone, Mail, Wifi, Car, Utensils, Waves, Dumbbell, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MOCK_HOTELS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/geo";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi, Parking: Car, Restaurant: Utensils, Pool: Waves, Gym: Dumbbell,
};

const HotelDetail = () => {
  const { id } = useParams();
  const hotel = MOCK_HOTELS.find((h) => h.id === id);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !hotel) return;
    const map = L.map(mapRef.current).setView([hotel.latitude, hotel.longitude], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    L.marker([hotel.latitude, hotel.longitude]).addTo(map).bindPopup(hotel.name).openPopup();
    return () => { map.remove(); };
  }, [hotel]);

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Hotel className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">Hotel not found</h2>
          <Link to="/search"><Button>Back to Search</Button></Link>
        </div>
      </div>
    );
  }

  const avgCleanliness = hotel.reviews?.reduce((s, r) => s + r.cleanliness_rating, 0)! / (hotel.reviews?.length || 1);
  const avgLocation = hotel.reviews?.reduce((s, r) => s + r.location_rating, 0)! / (hotel.reviews?.length || 1);
  const avgService = hotel.reviews?.reduce((s, r) => s + r.service_rating, 0)! / (hotel.reviews?.length || 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/search"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-semibold text-foreground truncate">{hotel.name}</h1>
        </div>
      </div>

      {/* Image gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 max-h-80 overflow-hidden">
        {hotel.images.map((img, i) => (
          <div key={img.id} className={i === 0 ? "col-span-2 row-span-2 md:col-span-2" : ""}>
            <img src={img.image_url} alt={`${hotel.name} ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>

      <div className="container py-6 space-y-6 max-w-4xl">
        {/* Title section */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{hotel.name}</h1>
                {hotel.status === "verified" && (
                  <Badge className="bg-success text-success-foreground gap-1">
                    <Shield className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <p className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" /> {hotel.address}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{formatPrice(hotel.price_per_night)}</p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-semibold">{hotel.average_rating?.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({hotel.review_count} reviews)</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{hotel.num_rooms} rooms</span>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">About this hotel</h2>
          <p className="text-muted-foreground leading-relaxed">{hotel.description}</p>
        </div>

        {/* Amenities */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {hotel.amenities.map((amenity) => {
              const Icon = AMENITY_ICONS[amenity] || Hotel;
              return (
                <div key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" /> {amenity}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Location</h2>
          <div ref={mapRef} className="h-48 md:h-64 rounded-lg border" />
        </div>

        {/* Contact */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" /> {hotel.phone}
            </div>
            {hotel.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" /> {hotel.email}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
            <Button size="sm">Write a Review</Button>
          </div>

          {hotel.reviews && hotel.reviews.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Cleanliness", score: avgCleanliness },
                  { label: "Location", score: avgLocation },
                  { label: "Service", score: avgService },
                ].map((cat) => (
                  <div key={cat.label} className="text-center">
                    <p className="text-2xl font-bold text-foreground">{cat.score.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">{cat.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {hotel.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{review.user_name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm">{review.overall_rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
