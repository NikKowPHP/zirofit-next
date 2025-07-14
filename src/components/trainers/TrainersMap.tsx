"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

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
  const trainersWithCoords = trainers.filter(t => t.profile?.latitude && t.profile?.longitude);

  if (trainersWithCoords.length === 0) {
      return (
          <div className="flex items-center justify-center h-full">
              <p className="text-neutral-500">No trainers with location data to display on map.</p>
          </div>
      );
  }

  const center: L.LatLngExpression = [52.2297, 21.0122]; // Default to Warsaw

  return (
    <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
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