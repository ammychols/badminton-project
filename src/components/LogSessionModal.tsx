import React, { useState, useRef } from 'react';
import { Court, Session, DayOfWeek, Intensity, ALL_INTENSITIES, INTENSITY_LABELS, INTENSITY_EMOJIS } from '../types';
import { BottomSheet } from './BottomSheet';
import { text, input } from '../styles/tokens';
import { uploadGroupImage } from '../utils/uploadImage';

interface LogSessionModalProps {
  courts: Court[];
  onClose: () => void;
  onSave: (data: Omit<Session, 'id'>) => void;
  initialSession?: Session;
}

const MOOD_EMOJIS: Record<number, string> = { 1: '😡', 2: '😴', 3: '😐', 4: '🙂', 5: '😄', 6: '🔥' };
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTH_LABELS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [h, m] = value.split(':');
  const nearestMin = MINUTES.reduce((prev, cur) =>
    Math.abs(parseInt(cur) - parseInt(m)) < Math.abs(parseInt(prev) - parseInt(m)) ? cur : prev
  );
  return (
    <div className="flex gap-1 items-center">
      <select value={h} onChange={e => onChange(`${e.target.value}:${m}`)} className={input.timeSelect}>
        {HOURS.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span className="text-gray-400 font-medium">:</span>
      <select value={nearestMin} onChange={e => onChange(`${h}:${e.target.value}`)} className={input.timeSelect}>
        {MINUTES.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  );
}

function MiniCalendar({ selected, onChange }: { selected: string; onChange: (d: string) => void }) {
  const today = new Date();
  const selDate = new Date(selected + 'T00:00:00');
  const [viewYear, setViewYear] = useState(selDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selDate.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const todayStr = todayString();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const now = new Date();
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isNextDisabled = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--hover-bg)] text-[var(--text-4)] transition-colors text-lg">‹</button>
        <span className="text-sm font-semibold text-[var(--text-1)]">{MONTH_LABELS[viewMonth]} {viewYear + 543}</span>
        <button onClick={nextMonth} disabled={isNextDisabled}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--hover-bg)] text-[var(--text-4)] transition-colors text-lg disabled:opacity-20 disabled:cursor-default">›</button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => (
          <div key={d} className="text-center text-xs text-[var(--text-3)] py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array(firstDow).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const dateStr = toDateStr(viewYear, viewMonth, d);
          const isSel = dateStr === selected;
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;
          return (
            <button
              key={d}
              disabled={isFuture}
              onClick={() => onChange(dateStr)}
              className="aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all mx-0.5"
              style={{
                backgroundColor: isSel ? 'var(--cal-sel)' : undefined,
                color: isSel ? 'white' : isFuture ? 'var(--dashed)' : 'var(--text-2)',
                cursor: isFuture ? 'default' : undefined,
              }}
              onMouseEnter={e => { if (!isSel && !isFuture) e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
              onMouseLeave={e => { if (!isSel) e.currentTarget.style.backgroundColor = ''; }}
            >
              {d}
              {isToday && (
                <span className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: isSel ? 'rgba(255,255,255,0.6)' : 'var(--cal-sel)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NoteField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const commit = () => setEditing(false);
  if (editing) {
    return (
      <div className="mb-2">
        <textarea
          ref={ref}
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={e => { const l = e.target.value.length; e.target.setSelectionRange(l, l); }}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); } if (e.key === 'Escape') commit(); }}
          placeholder="เช่น วันนี้เล่นดีมาก!"
          rows={2}
          className="w-full text-sm text-[var(--text-2)] border border-[var(--input-b)] rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--input-f)]"
          style={{ backgroundColor: 'var(--app-bg)' }}
        />
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setEditing(true)} className="w-full text-left mb-2 px-3 py-2.5 rounded-xl border border-dashed border-[var(--dashed)] hover:border-[var(--p)] transition-colors">
      {value
        ? <p className="text-sm text-[var(--text-2)] leading-relaxed">{value}</p>
        : <p className="text-sm text-[var(--text-3)]">+ เพิ่มโน้ต...</p>
      }
    </button>
  );
}

function defaultTimes() {
  return { start: '00:00', end: '00:00' };
}

export function LogSessionModal({ courts, onClose, onSave, initialSession }: LogSessionModalProps) {
  const { start: defaultStart, end: defaultEnd } = defaultTimes();
  const DOW_MAP: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const initDate = initialSession?.date ?? todayString();
  const initDow = DOW_MAP[new Date(initDate + 'T00:00:00').getDay()];
  const defaultCourt = courts.find(c => c.groups.some(g => g.days.includes(initDow)));
  const defaultGroup = defaultCourt?.groups.find(g => g.days.includes(initDow));

  const [date, setDate] = useState(initDate);
  const [courtId, setCourtId] = useState(initialSession?.courtId ?? defaultCourt?.id ?? '');
  const [groupId, setGroupId] = useState(initialSession?.groupId ?? defaultGroup?.id ?? '');
  const [startTime, setStartTime] = useState(initialSession?.startTime ?? defaultStart);
  const [endTime, setEndTime] = useState(initialSession?.endTime ?? defaultEnd);
  const [gamesPlayed, setGamesPlayed] = useState(initialSession?.gamesPlayed ?? 0);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | 6>(initialSession?.mood ?? 3);
  const [intensity, setIntensity] = useState<Intensity | undefined>(initialSession?.intensity);
  const [notes, setNotes] = useState(initialSession?.notes ?? '');
  const [image, setImage] = useState<string | undefined>(initialSession?.image);
  const [loadingImage, setLoadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const selectedDow = DOW_MAP[new Date(date + 'T00:00:00').getDay()];

  const filteredCourts = courts.filter(c => c.groups.some(g => g.days.includes(selectedDow)));
  const noCourtsToday = filteredCourts.length === 0;

  const selectedCourt = courts.find(c => c.id === courtId);
  const allGroups = selectedCourt?.groups ?? [];
  const filteredGroups = allGroups.filter(g => g.days.includes(selectedDow));
  const noGroupsToday = !noCourtsToday && filteredGroups.length === 0;

  const handleCourtChange = (id: string) => {
    setCourtId(id);
    const court = courts.find(c => c.id === id);
    const g = court?.groups.filter(g => g.days.includes(selectedDow)) ?? [];
    setGroupId(g[0]?.id ?? '');
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    const dow = DOW_MAP[new Date(d + 'T00:00:00').getDay()];
    const filtered = courts.filter(c => c.groups.some(g => g.days.includes(dow)));
    const newCourt = filtered[0];
    setCourtId(newCourt?.id ?? '');
    setGroupId(newCourt?.groups.filter(g => g.days.includes(dow))[0]?.id ?? '');
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingImage(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      const dataUrl = ev.target?.result as string;
      const compressed = await uploadGroupImage('', '', dataUrl);
      setImage(compressed);
      setLoadingImage(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!courtId || !groupId || noCourtsToday || noGroupsToday) return;
    onClose();
    onSave({ courtId, groupId, date, startTime, endTime, gamesPlayed, mood, intensity, notes: notes.trim() || undefined, image });
  };

  const saveButton = (
    <button onClick={handleSave} disabled={!courtId || !groupId || noCourtsToday || noGroupsToday || loadingImage}
      className="w-full bg-[var(--p)] text-white py-3 rounded-2xl font-medium hover:bg-[var(--p-h)] disabled:opacity-40 transition-colors">
      {loadingImage ? 'กำลังโหลดรูป...' : 'บันทึก'}
    </button>
  );

  return (
    <BottomSheet title={initialSession ? 'แก้ไขบันทึก' : 'บันทึกการตี'} onClose={onClose} footer={saveButton}>
      {/* Calendar */}
      <div className="rounded-2xl p-3 mb-4" style={{ backgroundColor: 'var(--app-bg)' }}>
        <MiniCalendar selected={date} onChange={handleDateChange} />
      </div>

      {/* Court + Group */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={text.label}>สนาม</label>
          <select
            value={courtId}
            onChange={e => handleCourtChange(e.target.value)}
            disabled={noCourtsToday}
            className={`${input.base} disabled:opacity-50`}
            style={{ '--disabled-bg': 'var(--app-bg)' } as React.CSSProperties}
          >
            {noCourtsToday
              ? <option value="">ไม่มีก๊วนเปิดวันนี้</option>
              : filteredCourts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
            }
          </select>
        </div>
        <div>
          <label className={text.label}>ก๊วน</label>
          <select
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
            disabled={noCourtsToday || noGroupsToday}
            className={`${input.base} disabled:opacity-50`}
          >
            {noCourtsToday || noGroupsToday
              ? <option value="">ไม่มีก๊วนเปิดวันนี้</option>
              : filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)
            }
          </select>
        </div>
      </div>

      {/* Time + Games */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className={text.label}>เริ่ม</label>
          <TimePicker value={startTime} onChange={setStartTime} />
        </div>
        <div>
          <label className={text.label}>เลิก</label>
          <TimePicker value={endTime} onChange={setEndTime} />
        </div>
        <div>
          <label className={text.label}>เกม</label>
          <div className="flex items-center gap-1.5 h-[42px]">
            <button type="button" onClick={() => setGamesPlayed(g => Math.max(0, g - 1))}
              className="w-8 h-8 rounded-full bg-[var(--chip-bg)] text-[var(--text-2)] text-lg font-bold hover:bg-[var(--bar-i)] flex items-center justify-center flex-shrink-0">−</button>
            <span className="text-lg font-bold text-[var(--text-1)] flex-1 text-center">{gamesPlayed}</span>
            <button type="button" onClick={() => setGamesPlayed(g => g + 1)}
              className="w-8 h-8 rounded-full bg-[var(--chip-bg)] text-[var(--text-2)] text-lg font-bold hover:bg-[var(--bar-i)] flex items-center justify-center flex-shrink-0">+</button>
          </div>
        </div>
      </div>

      {/* Mood */}
      <div className="mb-4">
        <label className={text.label}>อารมณ์</label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5, 6] as const).map(m => (
            <button key={m} type="button" onClick={() => setMood(m)}
              className={`flex-1 py-2 rounded-2xl text-2xl transition-all ${mood === m ? 'bg-[var(--p)] scale-105' : 'bg-[var(--chip-bg)] opacity-50 hover:opacity-80'}`}>
              {MOOD_EMOJIS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity */}
      <div className="mb-4">
        <label className={text.label}>ความหนัก</label>
        <div className="flex gap-2">
          {ALL_INTENSITIES.map(lv => (
            <button key={lv} type="button" onClick={() => setIntensity(prev => prev === lv ? undefined : lv)}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                intensity === lv ? 'bg-[var(--p)] text-white scale-105' : 'bg-[var(--chip-bg)] text-[var(--text-2)] hover:bg-[var(--bar-i)]'
              }`}>
              <span className="text-xs">{INTENSITY_EMOJIS[lv]}</span>
              {INTENSITY_LABELS[lv]}
            </button>
          ))}
        </div>
      </div>

      {/* Photo */}
      <div className="mb-4">
        <label className={text.label}>รูปภาพ</label>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        {image ? (
          <div className="relative rounded-2xl overflow-hidden">
            <img src={image} alt="session" className="w-full max-h-56 object-cover rounded-2xl" />
            <button
              type="button"
              onClick={() => setImage(undefined)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-sm hover:bg-black/70 transition-colors"
            >✕</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="w-full py-3 rounded-2xl border border-dashed border-[var(--dashed)] hover:border-[var(--p)] text-sm text-[var(--text-3)] hover:text-[var(--p)] transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-base">📷</span> เพิ่มรูปภาพ
          </button>
        )}
      </div>

    </BottomSheet>
  );
}
