import { Link } from "react-router-dom";
import { Search, Hotel, MapPin, Star, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURED_CITIES = [
  {
    name: "Kathmandu",
    description: "Capital city with rich culture & heritage",
    image: "https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=600",
    hotelCount: 150,
  },
  {
    name: "Pokhara",
    description: "Lake city with stunning Himalayan views",
    image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600",
    hotelCount: 95,
  },
  {
    name: "Chitwan",
    description: "Wildlife adventures & jungle safaris",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600",
    hotelCount: 40,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Hotel className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">VerifiedStay</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
        <div className="container text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-success" />
              Trusted & Verified Hotels in Nepal
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Find Your Perfect Stay in{" "}
              <span className="text-primary">Nepal</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Discover verified hotels across Kathmandu, Pokhara, and beyond. 
              No more confusion — only trusted, authentic listings.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Cards */}
      <section className="container -mt-8 relative z-10">
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

      {/* Stats */}
      <section className="container py-16">
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
          <div>
            <p className="text-3xl font-bold text-primary">285+</p>
            <p className="text-sm text-muted-foreground mt-1">Verified Hotels</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">6</p>
            <p className="text-sm text-muted-foreground mt-1">Cities Covered</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">12K+</p>
            <p className="text-sm text-muted-foreground mt-1">Happy Travelers</p>
          </div>
        </div>
      </section>

      {/* Featured Cities */}
      <section className="container pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">Explore Popular Destinations</h2>
          <p className="mt-2 text-muted-foreground">Handpicked cities with the best verified stays</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {FEATURED_CITIES.map((city) => (
            <Link key={city.name} to={`/search?city=${city.name}`} className="group">
              <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-primary-foreground">
                    <h3 className="text-xl font-bold">{city.name}</h3>
                    <p className="text-sm opacity-90">{city.hotelCount} hotels</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {city.description}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container">
          <h2 className="text-center text-3xl font-bold text-foreground mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { icon: Search, title: "Search", desc: "Find hotels near you or in your destination city" },
              { icon: Shield, title: "Verified", desc: "Every hotel is manually verified for authenticity" },
              { icon: Star, title: "Review", desc: "Read real reviews from verified travelers" },
            ].map((step, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with watermark */}
      <footer className="border-t py-12 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Nepal Verified Stay Finder</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2026 VerifiedStay Nepal. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Built with ❤️ by <span className="font-semibold text-foreground">Rahul GC</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
