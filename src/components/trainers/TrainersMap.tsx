"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// Leaflet icon fix for Next.js
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl.src,
  iconUrl: iconUrl.src,
  shadowUrl: shadowUrl.src,
});

interface TrainerForMap {
  id: string;
  name: string;
  username: string | null;
  profile: {
    latitude: number | null;
    longitude: number | null;
  } | null;
}

interface TrainersMapProps {
  trainers: TrainerForMap[];
}

export default function TrainersMap({ trainers }: TrainersMapProps) {
  const [isClient, setIsClient] = useState(false);
  const trainersWithCoords = trainers.filter(t => t.profile?.latitude && t.profile?.longitude);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    // It sets a state variable to true, triggering a re-render.
    setIsClient(true);
  }, []);

  useEffect(() => {
    // This effect runs when isClient becomes true.
    if (isClient && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: L.LatLngExpression = [position.coords.latitude, position.coords.longitude];
          if (mapRef.current) {
            mapRef.current.setView(userLocation, 13); // Use a city-level zoom
          }
        },
        (error) => {
          console.log("Geolocation error:", error.message);
          // Keep default center if permission is denied or an error occurs.
        }
      );
    }
  }, [isClient]);

  // The wrapper component handles the loading state. Here, we return null
  // during server-side rendering or the first client-side render pass.
  if (!isClient) {
    return null;
  }

  if (trainersWithCoords.length === 0) {
      return (
          <div className="flex items-center justify-center h-full">
              <p className="text-neutral-500">No trainers with location data to display on map.</p>
          </div>
      );
  }

  return (
    <MapContainer 
      center={[52.2297, 21.0122]} 
      zoom={6} 
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {trainersWithCoords.map(trainer => (
        <Marker 
            key={trainer.id} 
            position={[trainer.profile!.latitude!, trainer.profile!.longitude!]}
        >
          <Popup>
            <Link href={`/trainer/${trainer.username}`} className="font-semibold text-indigo-600 hover:underline">
              {trainer.name}
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}