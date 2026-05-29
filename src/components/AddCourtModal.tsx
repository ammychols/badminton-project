import React, { useState } from 'react';

interface AddCourtModalProps {
  onClose: () => void;
  onSave: (data: { name: string; address: string; lat?: number; lng?: number; placeId?: string }) => void;
}

export function AddCourtModal({ onClose, onSave }: AddCourtModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [selected, setSelected] = useState<{ placeId: string; description: string } | null>(null);
  const mapsAvailable = typeof window !== 'undefined' && !!(window as any).google?.maps?.places;

  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;
    if (!mapsAvailable) return;
    setSearching(true);

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      { input: searchQuery, componentRestrictions: { country: 'th' } },
      (predictions, status) => {
        setSearching(false);
        if (status === 'OK' && predictions) {
          setResults(predictions);
        }
      }
    );
  };

  const handleSelectPlace = (prediction: google.maps.places.AutocompletePrediction) => {
    setSelected({ placeId: prediction.place_id, description: prediction.description });
    setName(prediction.structured_formatting.main_text);
    setAddress(prediction.description);
    setResults([]);
    setSearchQuery('');
  };

  const handleManualAdd = () => {
    // กรณีไม่ใช้ Google Maps
    setSelected(null);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      address: address.trim(),
      placeId: selected?.placeId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">เพิ่มสนามใหม่</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Google Maps Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาจาก Google Maps</label>
          {!mapsAvailable && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-2">
              ยังไม่ได้ตั้งค่า Google Maps API Key — กรอกชื่อสนามด้านล่างแทนได้เลย
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchPlaces()}
              placeholder="ค้นหาชื่อสนาม..."
              disabled={!mapsAvailable}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-40 disabled:bg-gray-50"
            />
            <button
              onClick={searchPlaces}
              disabled={searching || !mapsAvailable}
              className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {searching ? '...' : '🔍'}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
              {results.map(r => (
                <button
                  key={r.place_id}
                  onClick={() => handleSelectPlace(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 border-b border-gray-100 last:border-0"
                >
                  <p className="font-medium text-gray-800">{r.structured_formatting.main_text}</p>
                  <p className="text-xs text-gray-400">{r.structured_formatting.secondary_text}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-400 mb-3">— หรือกรอกเอง —</div>

        {/* Manual Input */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสนาม *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="เช่น สนามแบดโก้วเฮง"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ / พื้นที่</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="เช่น ลาดพร้าว กรุงเทพฯ"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
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
  );
}
