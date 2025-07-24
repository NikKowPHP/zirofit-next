"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { Trainer } from '@/lib/api/trainers';

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

interface TrainersMapProps {
  trainers: Trainer[];
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // This observer will trigger 'invalidateSize' whenever the map container's
    // dimensions change, which is crucial for maps in animated containers.
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    
    const mapContainer = map.getContainer();
    resizeObserver.observe(mapContainer);

    // Also call invalidateSize once initially to handle cases where the map
    // is rendered in a container that is already the correct size but was hidden.
    map.invalidateSize();

    return () => {
      resizeObserver.unobserve(mapContainer);
    };
  }, [map]);
  return null;
}

export default function TrainersMap({ trainers }: TrainersMapProps) {
  const [isClient, setIsClient] = useState(false);
  const trainersWithCoords = trainers.filter(t => t.profile?.latitude && t.profile?.longitude);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: L.LatLngExpression = [position.coords.latitude, position.coords.longitude];
          if (mapRef.current) {
            mapRef.current.setView(userLocation, 13);
          }
        },
        (error) => {
          console.error("Geolocation error:", error.message);
        }
      );
    }
  }, [isClient]);

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
    <>
      <style jsx global>{`
        .custom-price-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 9999px;
          padding: 10px 20px;
          font-weight: 700;
          font-size: 14px;
          color: black;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1);
          white-space: nowrap;
          transform: translate(-50%, -calc(100% + 12px));
          transition: transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          cursor: pointer;
          border: 1px solid #eee;
        }
        .leaflet-marker-icon:hover .custom-price-marker {
          transform: translate(-50%, -calc(100% + 12px)) scale(1.08);
          box-shadow: 0 6px 12px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1);
        }
        .custom-price-marker::after {
          content: '';
          position: absolute;
          bottom: -9px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 16px;
          height: 16px;
          background: white;
          border-bottom: 1px solid #eee;
          border-right: 1px solid #eee;
          z-index: -1;
        }
        .dark .custom-price-marker {
          background: #262626;
          color: white;
          border-color: #444;
        }
        .dark .custom-price-marker::after {
          background: #262626;
          border-color: #444;
        }
        .custom-dot-marker {
          background-color: var(--primary-blue);
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          transform: translate(-50%, -50%);
        }
        .dark .custom-dot-marker {
          border-color: #262626;
        }
        .leaflet-popup-content-wrapper {
            border-radius: 12px;
        }
      `}</style>
      <MapContainer 
        center={[52.2297, 21.0122]} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        data-testid="trainers-map"
      >
        <MapResizer />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {trainersWithCoords.map(trainer => {
          const price = trainer.profile?.services?.[0]?.price;
          const currencySymbol = 'zł';
          
          let iconHtml = '';
          let iconClassName = 'custom-dot-marker';
          
          if (price) {
            iconHtml = `${Math.round(parseFloat(price))} ${currencySymbol}`;
            iconClassName = 'custom-price-marker';
          }

          const customIcon = L.divIcon({
            html: iconHtml,
            className: iconClassName,
          });
          
          return (
            <Marker 
              key={trainer.id} 
              position={[trainer.profile!.latitude!, trainer.profile!.longitude!]}
              icon={customIcon}
            >
              <Popup>
                <Link href={`/trainer/${trainer.username}`} className="font-semibold text-indigo-600 hover:underline" data-testid={`map-popup-link-${trainer.username}`}>
                  {trainer.name}
                </Link>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </>
  );
}