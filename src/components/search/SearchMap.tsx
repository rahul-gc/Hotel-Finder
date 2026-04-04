import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Hotel } from "@/lib/types";

interface SearchMapProps {
  hotels: (Hotel & { distance?: number })[];
  userLocation: { lat: number; lng: number } | null;
}

const SearchMap = ({ hotels, userLocation }: SearchMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [ready, setReady] = useState(false);

  // Wait for DOM element to be available
  useEffect(() => {
    if (mapContainerRef.current) {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || !mapContainerRef.current) return;

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.off();
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const container = mapContainerRef.current;

    // Ensure container is clean
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    const center: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [27.7172, 85.324];

    try {
      const map = L.map(container, {
        center,
        zoom: 12,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // User location marker with pulsing effect
      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div style="position:relative">
            <div style="width:16px;height:16px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(37,99,235,0.5);position:relative;z-index:2"></div>
            <div style="width:40px;height:40px;background:rgba(37,99,235,0.15);border-radius:50%;position:absolute;top:-12px;left:-12px;z-index:1;animation:pulse 2s infinite"></div>
          </div>`,
          className: "",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("<strong>📍 Your Location</strong>");
      }

      // Hotel markers
      const bounds = L.latLngBounds([]);
      if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);

      hotels.forEach((hotel) => {
        const hotelIcon = L.divIcon({
          html: `<div style="width:12px;height:12px;background:#16A34A;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
          className: "",
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([hotel.latitude, hotel.longitude], { icon: hotelIcon }).addTo(map);
        marker.bindPopup(
          `<div style="min-width:160px;font-family:system-ui">
            <strong>${hotel.name}</strong><br/>
            ⭐ ${hotel.average_rating?.toFixed(1) ?? "N/A"} · ${hotel.review_count ?? 0} reviews<br/>
            💰 रु ${hotel.price_per_night.toLocaleString()}/night<br/>
            ${hotel.distance != null ? `📍 ${hotel.distance < 1 ? Math.round(hotel.distance * 1000) + "m" : hotel.distance.toFixed(1) + "km"} away<br/>` : ""}
            <a href="/hotel/${hotel.id}" style="color:#2563EB;font-weight:500">View Details →</a>
          </div>`
        );
        bounds.extend([hotel.latitude, hotel.longitude]);
      });

      if (bounds.isValid()) {
        setTimeout(() => {
          map.invalidateSize();
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }, 100);
      }
    } catch (e) {
      console.error("Map init error:", e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [ready, hotels, userLocation]);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.6; }
        }
      `}</style>
      <div ref={mapContainerRef} className="h-full w-full" />
    </>
  );
};

export default SearchMap;
