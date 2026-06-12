import React, { useState, useRef } from 'react';
import { Session, INTENSITY_LABELS } from '../types';
import { uploadGroupImage } from '../utils/uploadImage';
import { useOverlay } from '../hooks/useOverlay';
import { Z, BACKDROP } from '../styles/overlay';

function Lightbox({ photos, initialIndex, onClose }: { photos: string[]; initialIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIndex);
  const ref = useOverlay(onClose);
  const step = (dir: 1 | -1) => setIdx(i => (i + dir + photos.length) % photos.length);
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="รูปภาพ"
      tabIndex={-1}
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm focus:outline-none"
      style={{ zIndex: Z.lightbox, background: 'rgba(0,0,0,0.82)' }}
      onClick={onClose}
    >
      <img
        src={photos[idx]}
        alt="session"
        className="max-w-[92vw] max-h-[88vh] rounded-2xl object-contain shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
      {photos.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); step(-1); }} aria-label="รูปก่อนหน้า"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl hover:bg-white/30 transition-colors">‹</button>
          <button onClick={e => { e.stopPropagation(); step(1); }} aria-label="รูปถัดไป"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl hover:bg-white/30 transition-colors">›</button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs tabular-nums">
            {idx + 1} / {photos.length}
          </div>
        </>
      )}
      <button onClick={e => { e.stopPropagation(); onClose(); }} aria-label="ปิด"
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-lg hover:bg-white/30 transition-colors">✕</button>
    </div>
  );
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😡', 2: '😴', 3: '😐', 4: '🙂', 5: '😄', 6: '🔥',
};

const MOOD_BUBBLE: Record<number, string> = {
  1: 'bg-red-50', 2: 'bg-slate-100', 3: 'bg-blue-50',
  4: 'bg-amber-50', 5: 'bg-emerald-50', 6: 'bg-orange-50',
};

const IV_COLOR: Record<string, string> = {
  light: '#16a34a', medium: '#ca8a04', heavy: '#ef4444',
};

export interface SessionRowProps {
  session: Session;
  courtName: string;
  groupName: string;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateNote: (notes: string | undefined) => void;
  onUpdatePhotos: (photos: string[]) => void;
  onViewInfo: () => void;
}

export function SessionRow({
  session, courtName, groupName,
  onEdit, onDelete, onUpdateNote, onUpdatePhotos, onViewInfo,
}: SessionRowProps) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(session.notes ?? '');
  // FIX: track *which* photo is open. Previously a boolean always showed photo[0].
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const commitNote = () => {
    setEditingNote(false);
    const trimmed = noteText.trim() || undefined;
    if (trimmed !== session.notes) onUpdateNote(trimmed);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const compressed = await uploadGroupImage('', '', ev.target?.result as string);
      const existing = session.photos ?? (session.image ? [session.image] : []);
      onUpdatePhotos([...existing, compressed]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const allPhotos = session.photos ?? (session.image ? [session.image] : []);

  // Duration / pacing
  const [sh, sm] = session.startTime.split(':').map(Number);
  const [eh, em] = session.endTime.split(':').map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  const durMin = (() => {
    if (start === 0 && end === 0) return 0;
    let d = end - start;
    if (d <= 0) d += 24 * 60;
    return (d > 0 && d < 24 * 60) ? d : 0;
  })();
  const durLabel = durMin > 0
    ? (Math.floor(durMin / 60) > 0 ? `${Math.floor(durMin / 60)}ชม.` : '') + (durMin % 60 > 0 ? `${durMin % 60}น.` : '')
    : null;
  const hasTime = !(start === 0 && end === 0);
  const minPerGame = (durMin > 0 && session.gamesPlayed > 0) ? Math.round(durMin / session.gamesPlayed) : null;

  const metaDivider = <span className="text-[var(--text-4)]">·</span>;

  const closeLightbox = () => setLightboxIndex(null);
  const lightboxOpen = lightboxIndex !== null && allPhotos[lightboxIndex] !== undefined;
  const step = (dir: 1 | -1) =>
    setLightboxIndex(i => (i === null ? i : (i + dir + allPhotos.length) % allPhotos.length));

  return (
    <div className="group bg-white border border-[var(--card-border)] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08),_0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden transition-colors hover:border-[color-mix(in_srgb,var(--p)_35%,transparent)] flex flex-col sm:flex-row">
      <div className="flex-1 min-w-0 flex flex-col p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 text-2xl select-none ${MOOD_BUBBLE[session.mood]}`}>
            {MOOD_EMOJIS[session.mood]}
          </div>
          <div className="min-w-0 flex-1">
            <button onClick={onViewInfo} className="text-left w-full px-2.5 py-1.5 -mx-2.5 -my-1.5 rounded-xl hover:bg-[var(--chip-bg)] transition-colors">
              <div className="font-bold text-[var(--text-1)] text-[15px] tracking-tight leading-snug">{groupName}</div>
              <div className="text-xs text-[var(--text-3)] truncate mt-0.5">{courtName}</div>
            </button>
            {session.intensity && (() => {
              const lvs = Array.isArray(session.intensity) ? session.intensity : [session.intensity];
              return (
                <div className="flex items-center gap-1 mt-1">
                  {lvs.map((lv, i) => (
                    <React.Fragment key={lv}>
                      {i > 0 && <span className="text-[var(--text-4)] text-xs">·</span>}
                      <span className="text-xs font-semibold" style={{ color: IV_COLOR[lv] }}>{INTENSITY_LABELS[lv]}</span>
                    </React.Fragment>
                  ))}
                </div>
              );
            })()}
          </div>
          {/* FIX: controls stay full-opacity on touch; hover-reveal only from sm up */}
          <div className="flex items-center gap-0.5 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={() => photoInputRef.current?.click()} title="เพิ่มรูป" aria-label="เพิ่มรูป" className="text-[var(--text-3)] hover:text-[var(--p)] transition-colors p-1.5 rounded-lg hover:bg-[var(--chip-bg)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div ref={menuRef} className="relative">
              <button onClick={() => setMenuOpen(v => !v)} aria-label="ตัวเลือก" className="p-1.5 rounded-lg hover:bg-[var(--chip-bg)] transition-colors" style={{ color: 'var(--text-3)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 bg-white rounded-xl border border-[var(--card-border)] overflow-hidden min-w-[120px]" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                  <button onClick={() => { setMenuOpen(false); onEdit(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[var(--text-1)] hover:bg-[var(--chip-bg)] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                    </svg>
                    แก้ไข
                  </button>
                  <div className="h-px bg-[var(--card-border)]" />
                  <button onClick={() => { setMenuOpen(false); onDelete(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ลบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-3 flex-1">
          {editingNote ? (
            <textarea autoFocus value={noteText} onChange={e => setNoteText(e.target.value)}
              onFocus={e => { const l = e.target.value.length; e.target.setSelectionRange(l, l); }}
              onBlur={commitNote}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitNote(); } if (e.key === 'Escape') { setNoteText(session.notes ?? ''); setEditingNote(false); } }}
              placeholder="เพิ่มโน้ต..." rows={2}
              className="w-full text-sm text-[var(--text-2)] border border-[var(--input-b)] rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--input-f)]"
              style={{ backgroundColor: 'var(--app-bg)' }}
            />
          ) : (
            <button onClick={() => { setNoteText(session.notes ?? ''); setEditingNote(true); }}
              className="w-full text-left rounded-xl px-2 py-1.5 -mx-2 -my-1.5 hover:bg-[var(--chip-bg)] transition-colors group/note">
              {session.notes
                ? <p className="text-[13.5px] text-[var(--text-2)] leading-relaxed whitespace-pre-wrap">{session.notes}</p>
                : <p className="text-sm text-[var(--text-3)] opacity-60 group-hover:opacity-100 transition-opacity">+ เพิ่มโน้ต...</p>}
            </button>
          )}
        </div>

        {/* Meta footer */}
        {(hasTime || session.gamesPlayed > 0) && (
          <div className="mt-3 pt-2.5 border-t border-[var(--card-border)] flex items-center flex-wrap gap-x-2 gap-y-1 text-xs">
            {hasTime && <span className="tabular-nums text-[var(--text-3)]">{session.startTime} – {session.endTime}</span>}
            {hasTime && durLabel && metaDivider}
            {durLabel && <span className="font-semibold tabular-nums text-[var(--text-2)]">{durLabel}</span>}
            {(hasTime || durLabel) && session.gamesPlayed > 0 && metaDivider}
            {session.gamesPlayed > 0 && <span className="font-bold tabular-nums text-[var(--text-2)]">{session.gamesPlayed} เกม</span>}
            {minPerGame && metaDivider}
            {minPerGame && <span className="tabular-nums text-[var(--text-3)]">{minPerGame} นาที/เกม</span>}
          </div>
        )}

        {/* Photo strip */}
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        {allPhotos.length > 0 && (
          <div className="flex gap-1.5 mt-3 pt-3 border-t border-[var(--card-border)]" style={{ maxHeight: 160 }}>
            {allPhotos.slice(0, 3).map((photo, i) => (
              <div key={i} className="relative flex-1 rounded-xl overflow-hidden cursor-pointer" style={{ height: 160 }} onClick={() => setLightboxIndex(i)}>
                <img src={photo} alt="" className="w-full h-full object-cover" />
                {i === 2 && allPhotos.length > 3 && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">+{allPhotos.length - 3}</span>
                  </div>
                )}
                <button
                  type="button"
                  aria-label="ลบรูป"
                  onClick={e => { e.stopPropagation(); onUpdatePhotos(allPhotos.filter((_, idx) => idx !== i)); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] hover:bg-red-500/80 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — opens to the tapped photo, with prev/next when multiple */}
      {lightboxOpen && (
        <Lightbox photos={allPhotos} initialIndex={lightboxIndex!} onClose={closeLightbox} />
      )}
    </div>
  );
}
