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

  // Stable key so the effect re-runs when any court's name/position changes,
  // not just when the count changes.
  const courtsKey = courts.map(c => `${c.id}:${c.lat},${c.lng}:${c.name}:${c.groups.length}`).join('|');

  useEffect(() => {
    if (!googleReady || !mapRef.current) return;

    const bounds = new google.maps.LatLngBounds();
    const center = courts.length > 0
      ? { lat: courts[0].lat!, lng: courts[0].lng! }
      : { lat: 13.75, lng: 100.5 };

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      mapId: 'DEMO_MAP_ID',
    });

    (async () => {
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker') as any;

      courts.forEach(court => {
        const pos = { lat: court.lat!, lng: court.lng! };
        bounds.extend(pos);

        const pin = new PinElement({
          glyph: court.name[0],
          glyphColor: '#ffffff',
          background: getComputedStyle(document.documentElement).getPropertyValue('--p').trim() || '#000',
          borderColor: '#ffffff',
        });

        // TODO: migrate to AdvancedMarkerElement (requires mapId) — tracked in backlog
        const marker = new AdvancedMarkerElement({
          position: pos,
          map,
          title: court.name,
          content: pin.element,
        });

        const info = new google.maps.InfoWindow({
          content: `<div style="font-family:Prompt,sans-serif;padding:2px 4px">
            <p style="font-weight:600;margin:0">${court.name}</p>
            <p style="color:#6b7280;font-size:12px;margin:2px 0 0">${court.groups.length} ก๊วน</p>
          </div>`,
        });

        marker.addListener('click', () => info.open(map, marker));
      });

      if (courts.length > 1) map.fitBounds(bounds);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleReady, courtsKey]);

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
