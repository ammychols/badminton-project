import React, { useState, useEffect, useRef } from 'react';

interface AddCourtModalProps {
  onClose: () => void;
  onSave: (data: { name: string; address: string; lat?: number; lng?: number; placeId?: string }) => void;
}

function isMapsReady() {
  return typeof window !== 'undefined' && !!(window as any).google?.maps?.places?.AutocompleteService;
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
  const serviceRef = useRef<any>(null);

  // Poll until Google Maps JS API is loaded
  useEffect(() => {
    if (mapsAvailable) return;
    const interval = setInterval(() => {
      if (isMapsReady()) { setMapsAvailable(true); clearInterval(interval); }
    }, 300);
    return () => clearInterval(interval);
  }, [mapsAvailable]);

  // Debounced autocomplete on every keystroke
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || !mapsAvailable) { setResults([]); return; }

    debounceRef.current = setTimeout(() => {
      if (!serviceRef.current) {
        serviceRef.current = new (window as any).google.maps.places.AutocompleteService();
      }
      serviceRef.current.getPlacePredictions(
        { input: searchQuery, componentRestrictions: { country: 'th' } },
        (predictions: any[], status: string) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
            setResults(predictions);
          } else {
            setResults([]);
          }
        }
      );
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, mapsAvailable]);

  const handleSelectPlace = (prediction: any) => {
    const mainText = prediction.structured_formatting?.main_text ?? prediction.description;
    const fullText = prediction.description ?? '';
    setSelected({ placeId: prediction.place_id, description: fullText });
    setName(mainText);
    setAddress(fullText);
    setResults([]);
    setSearchQuery('');

    // Fetch lat/lng using PlacesService
    try {
      const mapDiv = document.createElement('div');
      const placesService = new (window as any).google.maps.places.PlacesService(mapDiv);
      placesService.getDetails(
        { placeId: prediction.place_id, fields: ['geometry'] },
        (place: any, status: string) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            setLat(place.geometry.location.lat());
            setLng(place.geometry.location.lng());
          }
        }
      );
    } catch {}
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), address: address.trim(), placeId: selected?.placeId, lat, lng });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md flex flex-col max-h-[90vh] animate-slide-up">
        <div className="overflow-y-auto flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">เพิ่มสนามใหม่</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Google Maps Autocomplete Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาจาก Google Maps</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={mapsAvailable ? 'พิมชื่อสนาม...' : 'กำลังโหลด Google Maps...'}
              disabled={!mapsAvailable}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:bg-gray-50"
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => { setSearchQuery(''); setResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >×</button>
            )}
          </div>

          {/* Dropdown Results */}
          {results.length > 0 && (
            <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden shadow-lg">
              {results.map(r => (
                <button
                  key={r.place_id}
                  onClick={() => handleSelectPlace(r)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-green-50 border-b border-gray-100 last:border-0 flex items-start gap-2"
                >
                  <span className="text-green-500 mt-0.5 flex-shrink-0">📍</span>
                  <div>
                    <p className="font-medium text-gray-800">{r.structured_formatting?.main_text ?? r.description}</p>
                    <p className="text-xs text-gray-400">{r.structured_formatting?.secondary_text ?? ''}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-400 mb-3">— หรือกรอกเอง —</div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสนาม *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="เช่น สนามแบดโก้วเฮง"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ / พื้นที่</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="เช่น ลาดพร้าว กรุงเทพฯ"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full bg-green-600 text-white py-3 rounded-2xl font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
        >
          บันทึกสนาม
        </button>
        </div>
      </div>
    </div>
  );
}
