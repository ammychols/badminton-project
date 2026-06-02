import React, { useState, useEffect, useRef } from 'react';
import { BottomSheet } from './BottomSheet';

interface AddCourtModalProps {
  onClose: () => void;
  onSave: (data: { name: string; address: string; lat?: number; lng?: number; placeId?: string }) => void;
}

function isMapsReady() {
  return typeof window !== 'undefined' && !!(window as any).google?.maps?.places;
}

export function AddCourtModal({ onClose, onSave }: AddCourtModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<{ placeId: string; description: string } | null>(null);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [mapsAvailable, setMapsAvailable] = useState(isMapsReady());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (mapsAvailable) return;
    const interval = setInterval(() => {
      if (isMapsReady()) { setMapsAvailable(true); clearInterval(interval); }
    }, 300);
    return () => clearInterval(interval);
  }, [mapsAvailable]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || !isMapsReady()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const { AutocompleteSuggestion } = await (window as any).google.maps.importLibrary('places') as any;
        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: searchQuery, includedRegionCodes: ['th'],
        });
        setResults(suggestions.map((s: any) => s.placePrediction));
      } catch { setResults([]); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, mapsAvailable]);

  const handleSelectPlace = async (prediction: any) => {
    const mainText = prediction.mainText?.text ?? '';
    const fullText = prediction.text?.text ?? '';
    setSelected({ placeId: prediction.placeId, description: fullText });
    setName(mainText);
    setAddress(fullText);
    setResults([]);
    setSearchQuery('');
    try {
      const { Place } = await (window as any).google.maps.importLibrary('places') as any;
      const place = new Place({ id: prediction.placeId });
      await place.fetchFields({ fields: ['location'] });
      const loc = place.location;
      if (loc) { setLat(loc.lat()); setLng(loc.lng()); }
    } catch {}
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), address: address.trim(), placeId: selected?.placeId, lat, lng });
  };

  const saveButton = (
    <button onClick={handleSave} disabled={!name.trim()}
      className="w-full bg-gray-900 text-white py-3 rounded-2xl font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors">
      ถัดไป
    </button>
  );

  return (
    <BottomSheet title="เพิ่มสนามใหม่" onClose={onClose} footer={saveButton}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาจาก Google Maps</label>
        <div className="relative">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={mapsAvailable ? 'พิมพ์ชื่อสนาม...' : 'กำลังโหลด Google Maps...'}
            disabled={!mapsAvailable}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:bg-gray-50" />
          {searchQuery.length > 0 && (
            <button onClick={() => { setSearchQuery(''); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>
          )}
        </div>
        {results.length > 0 && (
          <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            {results.map(r => (
              <button key={r.placeId} onClick={() => handleSelectPlace(r)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-green-50 border-b border-gray-100 last:border-0 flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">📍</span>
                <div>
                  <p className="font-medium text-gray-800">{r.mainText?.text ?? ''}</p>
                  <p className="text-xs text-gray-400">{r.secondaryText?.text ?? ''}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-400 mb-3">— หรือกรอกเอง —</div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสนาม *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="เช่น สนามแบดโก้วเฮง"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400" />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ / พื้นที่</label>
        <input type="text" value={address} onChange={e => setAddress(e.target.value)}
          placeholder="เช่น ลาดพร้าว กรุงเทพฯ"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400" />
      </div>
    </BottomSheet>
  );
}
