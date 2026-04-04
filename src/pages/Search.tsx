import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Star, Shield, SlidersHorizontal, Hotel, ArrowLeft, Search as SearchIcon, X, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_HOTELS } from "@/lib/mock-data";
import { haversineDistance, formatDistance, formatPrice, getUserLocation, rankHotels } from "@/lib/geo";
import { AMENITIES, CITIES, type SearchFilters } from "@/lib/types";
import SearchMap from "@/components/search/SearchMap";
import NearestHotels from "@/components/search/NearestHotels";

const DEFAULT_FILTERS: SearchFilters = {
  priceRange: [0, 15000],
  minRating: 0,
  distanceRadius: 50,
  amenities: [],
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get("city") || "";

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [askingLocation, setAskingLocation] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    city: cityParam || undefined,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const requestLocation = () => {
    setLocationLoading(true);
    setAskingLocation(false);
    getUserLocation()
      .then((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(false);
      })
      .catch(() => {
        setLocationError(true);
        setUserLocation({ lat: 27.7172, lng: 85.3240 });
      })
      .finally(() => setLocationLoading(false));
  };

  const skipLocation = () => {
    setAskingLocation(false);
    setLocationLoading(false);
    setUserLocation({ lat: 27.7172, lng: 85.3240 });
  };

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
  }, []);

  const hotelsWithDistance = useMemo(() => {
    return MOCK_HOTELS.filter((h) => h.status === "verified").map((hotel) => ({
      ...hotel,
      distance: userLocation
        ? haversineDistance(userLocation.lat, userLocation.lng, hotel.latitude, hotel.longitude)
        : undefined,
    }));
  }, [userLocation]);

  const filteredHotels = useMemo(() => {
    let result = hotelsWithDistance.filter((hotel) => {
      if (hotel.price_per_night < filters.priceRange[0] || hotel.price_per_night > filters.priceRange[1]) return false;
      if ((hotel.average_rating ?? 0) < filters.minRating) return false;
      if (hotel.distance != null && hotel.distance > filters.distanceRadius) return false;
      if (filters.city && hotel.city !== filters.city) return false;
      if (filters.amenities.length > 0 && !filters.amenities.every((a) => hotel.amenities.includes(a))) return false;
      if (searchQuery && !hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) && !hotel.address.toLowerCase().includes(searchQuery.toLowerCase()) && !hotel.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
    return rankHotels(result) as typeof result;
  }, [hotelsWithDistance, filters, searchQuery]);

  // Nearest 3 hotels for suggestion strip
  const nearestHotels = useMemo(() => {
    if (!userLocation) return [];
    return [...hotelsWithDistance]
      .filter((h) => h.distance != null)
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
      .slice(0, 3);
  }, [hotelsWithDistance, userLocation]);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">City</label>
        <Select value={filters.city || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, city: v === "all" ? undefined : v }))}>
          <SelectTrigger><SelectValue placeholder="All cities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Price Range: {formatPrice(filters.priceRange[0])} — {formatPrice(filters.priceRange[1])}
        </label>
        <Slider
          min={0} max={15000} step={500}
          value={filters.priceRange}
          onValueChange={(v) => setFilters((f) => ({ ...f, priceRange: v as [number, number] }))}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Minimum Rating</label>
        <div className="flex gap-2">
          {[0, 3, 3.5, 4, 4.5].map((r) => (
            <Button
              key={r} size="sm"
              variant={filters.minRating === r ? "default" : "outline"}
              onClick={() => setFilters((f) => ({ ...f, minRating: r }))}
            >
              {r === 0 ? "Any" : `${r}+`} {r > 0 && <Star className="h-3 w-3 ml-0.5" />}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Distance Radius</label>
        <div className="flex gap-2 flex-wrap">
          {[1, 5, 10, 25, 50].map((d) => (
            <Button
              key={d} size="sm"
              variant={filters.distanceRadius === d ? "default" : "outline"}
              onClick={() => setFilters((f) => ({ ...f, distanceRadius: d }))}
            >
              {d}km
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Amenities</label>
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={(checked) =>
                  setFilters((f) => ({
                    ...f,
                    amenities: checked
                      ? [...f.amenities, amenity]
                      : f.amenities.filter((a) => a !== amenity),
                  }))
                }
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={() => setFilters({ ...DEFAULT_FILTERS })}>
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hotels, cities, or areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="mt-4"><FilterContent /></div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container py-4">
        {/* Location status */}
        {locationLoading && (
          <div className="mb-4 rounded-lg border bg-primary/5 p-3 text-sm text-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Detecting your location...
          </div>
        )}
        {locationError && !locationLoading && (
          <div className="mb-4 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location access denied. Showing Kathmandu area.
            </div>
            <Button size="sm" variant="outline" onClick={requestLocation} className="gap-1">
              <Navigation className="h-3 w-3" /> Retry
            </Button>
          </div>
        )}
        {userLocation && !locationError && !locationLoading && (
          <div className="mb-4 rounded-lg border bg-success/5 p-3 text-sm text-foreground flex items-center gap-2">
            <Navigation className="h-4 w-4 text-success" />
            Location tracked — showing hotels near you
          </div>
        )}

        {/* Nearest hotel suggestions */}
        {nearestHotels.length > 0 && !locationLoading && (
          <NearestHotels hotels={nearestHotels} />
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-20 space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h3>
              <FilterContent />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 space-y-4">
            {/* Map */}
            <div className="h-64 md:h-80 rounded-lg overflow-hidden border">
              {!locationLoading && (
                <SearchMap hotels={filteredHotels} userLocation={userLocation} />
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredHotels.length} verified hotel{filteredHotels.length !== 1 ? "s" : ""} found
              </p>
              {filters.amenities.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {filters.amenities.map((a) => (
                    <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Hotel cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredHotels.map((hotel) => (
                <Link key={hotel.id} to={`/hotel/${hotel.id}`}>
                  <Card className="overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 h-full">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={hotel.images[0]?.image_url}
                        alt={hotel.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {hotel.status === "verified" && (
                        <Badge className="absolute top-2 right-2 bg-success text-success-foreground gap-1">
                          <Shield className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground line-clamp-1">{hotel.name}</h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium">{hotel.average_rating?.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({hotel.review_count})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {hotel.city}
                        {hotel.distance != null && ` · ${formatDistance(hotel.distance)}`}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">{formatPrice(hotel.price_per_night)}<span className="text-sm font-normal text-muted-foreground"> /night</span></p>
                        <div className="flex gap-1">
                          {hotel.amenities.slice(0, 3).map((a) => (
                            <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredHotels.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <Hotel className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="font-semibold text-foreground">No hotels found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search area</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer watermark */}
      <footer className="border-t py-4 mt-8">
        <div className="container text-center">
          <p className="text-xs text-muted-foreground">
            Built with ❤️ by <span className="font-semibold text-foreground">VerifiedStay Nepal</span> · © 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;
