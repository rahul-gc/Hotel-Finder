import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Hotel } from "@/lib/types";

interface SearchMapProps {
  hotels: (Hotel & { distance?: number })[];
  userLocation: { lat: number; lng: number } | null;
}

const SearchMap = ({ hotels, userLocation }: SearchMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const center: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [27.7172, 85.324];

    const map = L.map(mapRef.current).setView(center, 12);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // User marker
    if (userLocation) {
      const userIcon = L.divIcon({
        html: '<div style="width:14px;height:14px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("Your location");
    }

    // Hotel markers
    const hotelIcon = L.divIcon({
      html: '<div style="width:10px;height:10px;background:#16A34A;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
      className: "",
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });

    const bounds = L.latLngBounds([]);
    if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);

    hotels.forEach((hotel) => {
      const marker = L.marker([hotel.latitude, hotel.longitude], { icon: hotelIcon }).addTo(map);
      marker.bindPopup(
        `<div style="min-width:150px"><strong>${hotel.name}</strong><br/>⭐ ${hotel.average_rating?.toFixed(1) ?? "N/A"}<br/>रु ${hotel.price_per_night.toLocaleString()}/night<br/><a href="/hotel/${hotel.id}" style="color:#2563EB">View Details →</a></div>`
      );
      bounds.extend([hotel.latitude, hotel.longitude]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [hotels, userLocation]);

  return <div ref={mapRef} className="h-full w-full" />;
};

export default SearchMap;
