import { Link } from "react-router-dom";
import { Star, Shield, MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistance, formatPrice } from "@/lib/geo";
import type { Hotel } from "@/lib/types";

interface NearestHotelsProps {
  hotels: (Hotel & { distance?: number })[];
}

const NearestHotels = ({ hotels }: NearestHotelsProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Navigation className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">Nearest Hotels to You</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {hotels.map((hotel) => (
          <Link
            key={hotel.id}
            to={`/hotel/${hotel.id}`}
            className="min-w-[260px] max-w-[280px] shrink-0 group"
          >
            <div className="rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="relative h-28 overflow-hidden">
                <img
                  src={hotel.images[0]?.image_url}
                  alt={hotel.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
                {hotel.status === "verified" && (
                  <Badge className="absolute top-1.5 right-1.5 bg-success text-success-foreground gap-1 text-[10px] px-1.5 py-0.5">
                    <Shield className="h-2.5 w-2.5" /> Verified
                  </Badge>
                )}
                {hotel.distance != null && (
                  <div className="absolute bottom-1.5 left-1.5 bg-foreground/70 text-background text-[10px] font-medium rounded px-1.5 py-0.5 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    {formatDistance(hotel.distance)}
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-medium text-foreground text-sm line-clamp-1">{hotel.name}</h4>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs font-medium">{hotel.average_rating?.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{hotel.city}</p>
                <p className="text-sm font-semibold text-foreground">{formatPrice(hotel.price_per_night)}<span className="text-xs font-normal text-muted-foreground"> /night</span></p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NearestHotels;
