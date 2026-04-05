import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Shield, MapPin, Phone, Mail, Wifi, Car, Utensils, Waves, Dumbbell, Hotel, CheckCircle2, Bed, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi, Parking: Car, Restaurant: Utensils, Pool: Waves, Gym: Dumbbell,
  Spa: Hotel, Bar: Hotel, "Room Service": Hotel, "Hot Water": Hotel, AC: Hotel,
  "Safari": Hotel, "Nature Walks": Hotel, "Lake View": Hotel, "Boating": Hotel,
  "Garden": Hotel, "Live Music": Hotel, "Yoga": Hotel, "Heritage Tours": Hotel,
  "Rooftop Bar": Hotel, "Elephant Experiences": Hotel, "Cultural Programs": Hotel,
  "Meditation Spaces": Hotel, "Casino": Hotel, "Breakfast": Hotel,
};

interface Review {
  id: string;
  user_name: string;
  overall_rating: number;
  cleanliness_rating: number;
  location_rating: number;
  service_rating: number;
  comment: string;
  created_at: string;
}

interface HotelData {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  num_rooms: number;
  amenities: string[];
  phone: string;
  email?: string;
  website?: string;
  status: string;
  average_rating: number;
  review_count: number;
  images: { id: string; image_url: string; is_primary: boolean }[];
  reviews?: Review[];
}

const HotelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<HotelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hotels')
        .select(`
          *,
          images:hotel_images(id, image_url, is_primary),
          reviews:hotel_reviews(id, user_name, overall_rating, cleanliness_rating, location_rating, service_rating, comment, created_at)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        setError(error.message);
      } else {
        setHotel(data);
      }
    } catch (err) {
      setError('Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPrimaryImage = () => {
    const primary = hotel?.images?.find(img => img.is_primary);
    return primary?.image_url || hotel?.images?.[0]?.image_url || 
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container flex h-14 items-center gap-3">
            <Link to="/search"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="container py-6 space-y-6 max-w-4xl">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Hotel className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">Hotel not found</h2>
          <p className="text-muted-foreground">{error || "The hotel you're looking for doesn't exist."}</p>
          <Link to="/search"><Button>Back to Search</Button></Link>
        </div>
      </div>
    );
  }

  const avgCleanliness = hotel.reviews?.reduce((s, r) => s + r.cleanliness_rating, 0)! / (hotel.reviews?.length || 1) || 0;
  const avgLocation = hotel.reviews?.reduce((s, r) => s + r.location_rating, 0)! / (hotel.reviews?.length || 1) || 0;
  const avgService = hotel.reviews?.reduce((s, r) => s + r.service_rating, 0)! / (hotel.reviews?.length || 1) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/search"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-semibold text-foreground truncate">{hotel.name}</h1>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <img 
          src={getPrimaryImage()} 
          alt={hotel.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            {hotel.status === "verified" && (
              <Badge className="bg-green-500 text-white gap-1">
                <Shield className="h-3 w-3" /> Verified
              </Badge>
            )}
            <Badge variant="secondary" className="bg-white/90">
              <MapPin className="h-3 w-3 mr-1" /> {hotel.city}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6 max-w-4xl">
        {/* Title & Price Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{hotel.name}</h1>
              <p className="flex items-center gap-1 text-muted-foreground mt-2">
                <MapPin className="h-4 w-4" /> {hotel.address}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-3xl font-bold text-primary">{formatPrice(hotel.price_per_night)}</p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">{hotel.average_rating?.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({hotel.review_count} reviews)</span>
            </div>
            <Separator orientation="vertical" className="h-4 hidden md:block" />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Bed className="h-4 w-4" />
              {hotel.num_rooms} rooms
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{hotel.num_rooms}</p>
              <p className="text-xs text-muted-foreground">Rooms</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
              <p className="text-sm font-medium">{hotel.average_rating?.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{hotel.city}</p>
              <p className="text-xs text-muted-foreground">Location</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium">Verified</p>
              <p className="text-xs text-muted-foreground">Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">About this hotel</h2>
          <p className="text-muted-foreground leading-relaxed">{hotel.description}</p>
        </div>

        {/* Amenities */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {hotel.amenities?.map((amenity) => {
              const Icon = AMENITY_ICONS[amenity] || CheckCircle2;
              return (
                <div key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-muted/50">
                  <Icon className="h-4 w-4 text-primary" /> {amenity}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{hotel.phone}</p>
              </div>
            </div>
            {hotel.email && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{hotel.email}</p>
                </div>
              </div>
            )}
            {hotel.website && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bed className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    {hotel.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        {hotel.reviews && hotel.reviews.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Guest Reviews</h2>
              <Badge variant="outline">{hotel.review_count} reviews</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Cleanliness", score: avgCleanliness },
                { label: "Location", score: avgLocation },
                { label: "Service", score: avgService },
              ].map((cat) => (
                <div key={cat.label} className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{cat.score > 0 ? cat.score.toFixed(1) : '-'}</p>
                  <p className="text-xs text-muted-foreground">{cat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {hotel.reviews.slice(0, 3).map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{review.user_name}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{review.overall_rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Book Now Button */}
        <div className="sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-xl border shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-bold text-primary">{formatPrice(hotel.price_per_night)}</p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
            <Link to={`/booking?hotelId=${hotel.id}&hotelName=${encodeURIComponent(hotel.name)}&price=${hotel.price_per_night}`}>
              <Button size="lg" className="gap-2">
                <Calendar className="h-5 w-5" />
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
