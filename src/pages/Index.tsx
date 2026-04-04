import { Link } from "react-router-dom";
import { Search, Hotel, MapPin, Star, Shield, ArrowRight, Phone, Mail, CheckCircle2, Wifi, Car, Utensils, Waves, Dumbbell, Wine, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import logoImg from "/logo.png";

const FEATURED_CITIES = [
  {
    name: "Kathmandu",
    description: "Ancient temples & vibrant culture",
    image: "https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=800",
    hotelCount: 150,
  },
  {
    name: "Pokhara",
    description: "Phewa Lake & Annapurna views",
    image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800",
    hotelCount: 95,
  },
  {
    name: "Chitwan",
    description: "Wildlife safaris & jungle lodges",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
    hotelCount: 40,
  },
  {
    name: "Lumbini",
    description: "Birthplace of Lord Buddha",
    image: "https://images.unsplash.com/photo-1605537964070-557461b1b12c?w=800",
    hotelCount: 25,
  },
];

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "WiFi": <Wifi className="h-4 w-4" />,
  "Parking": <Car className="h-4 w-4" />,
  "Restaurant": <Utensils className="h-4 w-4" />,
  "Pool": <Waves className="h-4 w-4" />,
  "Gym": <Dumbbell className="h-4 w-4" />,
  "Bar": <Wine className="h-4 w-4" />,
  "Breakfast": <Coffee className="h-4 w-4" />,
  "AC": <CheckCircle2 className="h-4 w-4" />,
};

interface HotelData {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  price_per_night: number;
  average_rating: number;
  review_count: number;
  amenities: string[];
  images?: { image_url: string; is_primary: boolean }[];
}

const Index = () => {
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ hotels: 0, cities: 4, travelers: 12450 });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hotels')
        .select(`
          *,
          images:hotel_images(image_url, is_primary)
        `)
        .eq('status', 'verified')
        .order('average_rating', { ascending: false })
        .limit(6);
      
      if (error) {
        setError(error.message);
      } else {
        setHotels(data || []);
        setStats(prev => ({ ...prev, hotels: data?.length || 0 }));
      }
    } catch (err) {
      setError('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (hotel: HotelData) => {
    const primary = hotel.images?.find(img => img.is_primary);
    return primary?.image_url || hotel.images?.[0]?.image_url || 
      `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="Nepal Hotels Finder" className="h-9 w-9 rounded-lg" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight">Nepal Hotels</span>
              <span className="text-xs text-muted-foreground leading-tight">Find Your Perfect Stay</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/search">
              <Button variant="ghost" size="sm" className="hidden sm:flex">Search Hotels</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-background" />
        <div className="container relative mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              <Star className="mr-1 h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              Trusted by 12,000+ travelers
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Discover Nepal's
              <span className="block text-primary">Finest Hotels</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Find verified hotels across Kathmandu, Pokhara, Chitwan and more. 
              Book with confidence - every hotel is manually verified.
            </p>
            
            {/* Search Bar */}
            <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
              <Link to="/search" className="flex-1">
                <Button size="lg" className="w-full gap-2 text-lg h-14">
                  <Search className="h-5 w-5" />
                  Search Hotels
                </Button>
              </Link>
              <Link to="/register-hotel" className="flex-1">
                <Button variant="outline" size="lg" className="w-full gap-2 text-lg h-14">
                  <Hotel className="h-5 w-5" />
                  List Your Hotel
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Verified Hotels</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Cards */}
      <section className="container -mt-8 relative z-10 hidden">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Link to="/search" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/30">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Find Hotels Near Me</h2>
                <p className="text-muted-foreground">
                  Search verified hotels by location, price, and amenities. See them on the map.
                </p>
                <Button className="mt-2 group-hover:gap-3 transition-all">
                  Start Searching <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/register-hotel" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/30">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="rounded-full bg-success/10 p-4">
                  <Hotel className="h-8 w-8 text-success" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Register My Hotel</h2>
                <p className="text-muted-foreground">
                  List your property on Nepal's trusted platform. Get verified and attract travelers.
                </p>
                <Button variant="outline" className="mt-2 group-hover:gap-3 transition-all">
                  Register Now <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary sm:text-4xl">{stats.hotels}+</p>
              <p className="mt-1 text-sm text-muted-foreground">Verified Hotels</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary sm:text-4xl">{stats.cities}</p>
              <p className="mt-1 text-sm text-muted-foreground">Cities Covered</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary sm:text-4xl">12K+</p>
              <p className="mt-1 text-sm text-muted-foreground">Happy Travelers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary sm:text-4xl">4.8</p>
              <p className="mt-1 text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="container py-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Featured Hotels</h2>
            <p className="mt-2 text-muted-foreground">Handpicked top-rated hotels for your stay</p>
          </div>
          <Link to="/search">
            <Button variant="outline" className="gap-2">
              View All Hotels <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-600">Failed to load hotels. Please try again later.</p>
            <Button onClick={fetchHotels} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        ) : hotels.length === 0 ? (
          <div className="rounded-lg border bg-muted/50 p-8 text-center">
            <p className="text-muted-foreground">No hotels available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <Link key={hotel.id} to={`/hotel/${hotel.id}`} className="group">
                <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={getPrimaryImage(hotel)}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-white/90 text-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          {hotel.city}
                        </Badge>
                        {hotel.average_rating > 0 && (
                          <Badge variant="secondary" className="bg-white/90">
                            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {hotel.average_rating.toFixed(1)} ({hotel.review_count})
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {hotel.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">{hotel.address}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {hotel.amenities?.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                          {AMENITY_ICONS[amenity] || <CheckCircle2 className="h-3 w-3" />}
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities?.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{hotel.amenities.length - 3} more</span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(hotel.price_per_night)}
                        </span>
                        <span className="text-xs text-muted-foreground">/night</span>
                      </div>
                      <Button size="sm" variant="secondary">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Cities */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground">Explore Popular Destinations</h2>
            <p className="mt-2 text-muted-foreground">Discover the best stays in Nepal's top cities</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURED_CITIES.map((city) => (
              <Link key={city.name} to={`/search?city=${city.name}`} className="group">
                <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{city.name}</h3>
                      <p className="text-sm opacity-90">{city.hotelCount} hotels</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      {city.description}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
          <p className="mt-2 text-muted-foreground">Find and book your perfect stay in 3 simple steps</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
          {[
            { 
              icon: Search, 
              title: "Search", 
              desc: "Browse verified hotels by location, price, and amenities" 
            },
            { 
              icon: Shield, 
              title: "Verify", 
              desc: "Every hotel is manually verified for quality & authenticity" 
            },
            { 
              icon: CheckCircle2, 
              title: "Book", 
              desc: "Secure booking with instant confirmation" 
            },
          ].map((step, i) => (
            <div key={i} className="relative text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-primary mb-1">STEP {i + 1}</div>
                <h3 className="font-semibold text-lg text-foreground">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container pb-16">
        <div className="rounded-2xl bg-primary p-8 sm:p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to List Your Hotel?</h2>
          <p className="mx-auto max-w-xl mb-6 text-primary-foreground/80">
            Join Nepal's trusted hotel platform. Reach thousands of travelers and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register-hotel">
              <Button size="lg" variant="secondary" className="gap-2">
                <Hotel className="h-5 w-5" />
                Register Your Hotel
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="Nepal Hotels Finder" className="h-8 w-8 rounded-lg" />
                <span className="font-bold text-foreground">Nepal Hotels</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Nepal's trusted platform for finding and booking verified hotels.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/search" className="hover:text-primary">Search Hotels</Link></li>
                <li><Link to="/register-hotel" className="hover:text-primary">List Your Hotel</Link></li>
                <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-primary">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-primary">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@nepalhotels.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +977-1-1234567
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2026 Nepal Hotels Finder. All rights reserved.</p>
            <p className="mt-1">Built with ❤️ by Rahul GC</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
