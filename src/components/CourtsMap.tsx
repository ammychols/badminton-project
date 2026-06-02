import React, { useEffect, useRef, useState } from 'react';
import { Court } from '../types';

interface CourtsMapProps {
  courts: Court[];
}

declare const google: any;

function isGoogleReady() {
  return typeof google !== 'undefined' && google.maps;
}

export function CourtsMap({ courts: allCourts }: CourtsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const courts = allCourts.filter(c => c.lat && c.lng);
  const [googleReady, setGoogleReady] = useState(isGoogleReady);

  useEffect(() => {
    if (googleReady) return;
    const interval = setInterval(() => {
      if (isGoogleReady()) {
        setGoogleReady(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [googleReady]);

  useEffect(() => {
    if (!googleReady || !mapRef.current) return;

    const bounds = new google.maps.LatLngBounds();
    const center = courts.length > 0
      ? { lat: courts[0].lat!, lng: courts[0].lng! }
      : { lat: 13.75, lng: 100.5 }; // Bangkok default

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    courts.forEach(court => {
      const pos = { lat: court.lat!, lng: court.lng! };
      bounds.extend(pos);

      const marker = new google.maps.Marker({
        position: pos,
        map,
        title: court.name,
        label: { text: court.name[0], color: 'white', fontWeight: 'bold' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#16a34a',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        },
      });

      const info = new google.maps.InfoWindow({
        content: `<div style="font-family:Kanit,sans-serif;padding:2px 4px">
          <p style="font-weight:600;margin:0">${court.name}</p>
          <p style="color:#6b7280;font-size:12px;margin:2px 0 0">${court.groups.length} ก๊วน</p>
        </div>`,
      });

      marker.addListener('click', () => info.open(map, marker));
    });

    if (courts.length > 1) map.fitBounds(bounds);
  }, [googleReady, courts.length]);

  if (courts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm bg-gray-50 rounded-2xl">
        ยังไม่มีสนามที่มีข้อมูลพิกัด
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: '420px' }} />
  );
}
