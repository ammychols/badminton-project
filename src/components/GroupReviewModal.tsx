import React from 'react';
import { Court, Group, Session, ALL_LEVELS } from '../types';

interface Props {
  group: Group;
  court: Court;
  sessions: Session[]; // sessions for this group
  onClose: () => void;
  onNavigateToCourt: () => void;
}

const MOOD_EMOJI: Record<number, string> = { 1: '😡', 2: '😴', 3: '😐', 4: '🙂', 5: '😄', 6: '🔥' };
const MOOD_BAR_COLOR = ['#ef4444', '#f97316', '#fbbf24', '#a8d5b5', '#4a9e6e', '#16a34a'];

export function GroupReviewModal({ group, court, sessions, onClose, onNavigateToCourt }: Props) {
  // Derived stats
  const totalSessions = sessions.length;
  const avgGames = totalSessions > 0
    ? sessions.reduce((sum, s) => sum + s.gamesPlayed, 0) / totalSessions
    : 0;

  const sessionsMpg = sessions
    .filter(s => s.gamesPlayed > 0 && !(s.startTime === '00:00' && s.endTime === '00:00'))
    .map(s => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      let dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0) dur += 24 * 60;
      return Math.round(dur / s.gamesPlayed);
    });
  const avgMpg = sessionsMpg.length > 0
    ? Math.round(sessionsMpg.reduce((a, b) => a + b, 0) / sessionsMpg.length)
    : null;

  // Mood history — last 10 sessions sorted by date
  const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const moodHistory = sortedSessions.slice(-10).map(s => s.mood);
  const avgMood = moodHistory.length > 0
    ? moodHistory.reduce((a, b) => a + b, 0) / moodHistory.length
    : 3;

  // Mood chart points
  const H = 88, topY = 18, botY = 70;
  const n = moodHistory.length;
  const moodPts = moodHistory.map((m, i) => ({
    x: (i + 0.5) / n * 100,
    y: topY + (1 - (m - 1) / 5) * (botY - topY),
    m,
    last: i === n - 1,
  }));

  // Mood distribution — highest mood first, filter to present only
  const moodCounts = [6, 5, 4, 3, 2, 1]
    .map(lvl => ({ lvl, n: moodHistory.filter(x => x === lvl).length }))
    .filter(o => o.n > 0);

  // Intensity distribution
  const intensityDist = { light: 0, medium: 0, heavy: 0 };
  for (const s of sessions) {
    if (!s.intensity) continue;
    const lvs = Array.isArray(s.intensity) ? s.intensity : [s.intensity];
    for (const lv of lvs) {
      if (lv === 'light') intensityDist.light++;
      else if (lv === 'medium') intensityDist.medium++;
      else if (lv === 'heavy') intensityDist.heavy++;
    }
  }
  const intTotal = intensityDist.light + intensityDist.medium + intensityDist.heavy;
  const iW = {
    light: intTotal > 0 ? intensityDist.light / intTotal : 1 / 3,
    medium: intTotal > 0 ? intensityDist.medium / intTotal : 1 / 3,
    heavy: intTotal > 0 ? intensityDist.heavy / intTotal : 1 / 3,
  };

  // Group details
  const DAY_MAP: Record<string, string> = { MON: 'จันทร์', TUE: 'อังคาร', WED: 'พุธ', THU: 'พฤหัสบดี', FRI: 'ศุกร์', SAT: 'เสาร์', SUN: 'อาทิตย์' };
  const dayStr = group.days.map(d => DAY_MAP[d] ?? d).join(' · ');
  const timeStr = group.startTime && group.endTime ? `${group.startTime} – ${group.endTime}` : null;
  const levelsSorted = group.levels ? [...group.levels].sort((a, b) => ALL_LEVELS.indexOf(a) - ALL_LEVELS.indexOf(b)) : [];

  const detailRows: [string, React.ReactNode][] = [
    ['สนาม', court.name],
    ['วัน', dayStr],
    ...(timeStr ? [['เวลา', timeStr] as [string, React.ReactNode]] : []),
    ...(levelsSorted.length > 0 ? [['ระดับ', (
      <div key="levels" className="flex gap-1.5 flex-wrap justify-end">
        {levelsSorted.map(l => (
          <span key={l} className="text-[11px] font-bold px-2 py-0.5" style={{ background: 'var(--chip-bg)', color: 'var(--chip-t)', borderRadius: 8 }}>{l}</span>
        ))}
      </div>
    )] as [string, React.ReactNode]] : []),
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full max-w-sm max-h-[88vh] flex flex-col rounded-3xl overflow-hidden" style={{ backgroundColor: 'var(--app-bg)' }} onClick={e => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)' }}>
        <div className="text-base font-extrabold text-white" style={{ letterSpacing: '-0.4px' }}>{group.name}</div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-3 pb-6">

        {/* Overview - dark gradient card */}
        <div className="rounded-[22px] p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e3a5f 100%)', boxShadow: '0 8px 28px rgba(0,0,0,.22)' }}>
          <div className="absolute rounded-full" style={{ top: -20, right: -10, width: 120, height: 120, background: 'rgba(106,177,135,0.09)', filter: 'blur(40px)' }}/>
          <div className="relative grid grid-cols-3 gap-3" style={{ zIndex: 1 }}>
            {([[totalSessions, 'ครั้ง'], [avgGames.toFixed(1), 'เกม/ครั้ง'], [avgMpg ?? '—', 'นาที/เกม']] as [React.ReactNode, string][]).map(([v, l]) => (
              <div key={l}>
                <div className="font-extrabold text-white leading-none" style={{ fontSize: 28, letterSpacing: '-0.5px' }}>{v}</div>
                <div className="mt-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights card */}
        <div className="bg-white rounded-2xl px-4 py-3.5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,.09), 0 8px 32px rgba(0,0,0,.06)' }}>

          {/* อารมณ์ */}
          {moodHistory.length > 0 && (
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>อารมณ์</span>
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>เฉลี่ย</span>
                  <span style={{ fontSize: 30, lineHeight: 1 }}>{MOOD_EMOJI[Math.round(avgMood)]}</span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>ย้อนหลัง</div>
              <div className="relative mb-5" style={{ height: H }}>
                <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <polyline points={moodPts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#e2e8f0" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round"/>
                </svg>
                {moodPts.map((p, i) => (
                  <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: p.y, transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.last && <span style={{ position: 'absolute', width: 34, height: 34, borderRadius: '50%', background: 'rgba(106,177,135,0.22)' }}/>}
                    <span style={{ fontSize: p.last ? 25 : 18, lineHeight: 1, position: 'relative' }}>{MOOD_EMOJI[p.m]}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 8 }}>ส่วนใหญ่เจอ</div>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 9, gap: 2 }}>
                {moodCounts.map((o, idx) => (
                  <div key={o.lvl} style={{ flex: o.n, background: MOOD_BAR_COLOR[o.lvl - 1], borderRadius: idx === 0 ? '4px 0 0 4px' : idx === moodCounts.length - 1 ? '0 4px 4px 0' : 0 }}/>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 9, flexWrap: 'wrap' }}>
                {moodCounts.map(o => (
                  <div key={o.lvl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 15, lineHeight: 1 }}>{MOOD_EMOJI[o.lvl]}</span>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{o.n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {moodHistory.length > 0 && <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: 14 }}/>}

          {/* ความหนักของเกม */}
          {intTotal > 0 && (
            <div className="mb-3.5">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>ความหนักของเกม</div>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 9, gap: 2 }}>
                {iW.light > 0 && <div style={{ flex: iW.light, background: '#16a34a', borderRadius: '4px 0 0 4px' }}/>}
                {iW.medium > 0 && <div style={{ flex: iW.medium, background: '#f59e0b' }}/>}
                {iW.heavy > 0 && <div style={{ flex: iW.heavy, background: '#ef4444', borderRadius: '0 4px 4px 0' }}/>}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {([[`#16a34a`, 'เบา', intTotal > 0 ? Math.round(intensityDist.light / intTotal * 100) : 0], ['#f59e0b', 'ปานกลาง', intTotal > 0 ? Math.round(intensityDist.medium / intTotal * 100) : 0], ['#ef4444', 'หนัก', intTotal > 0 ? Math.round(intensityDist.heavy / intTotal * 100) : 0]] as [string, string, number][]).map(([color, label, pct]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: color }}/>
                    <span style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap' }}>{label} <strong>{pct}%</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {intTotal > 0 && <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: 14 }}/>}

          {/* รายละเอียดก๊วน */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>รายละเอียดก๊วน</div>
            <div>
              {detailRows.map(([label, value], i) => (
                <div key={String(label)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: i === 0 ? 0 : 9, paddingBottom: i === detailRows.length - 1 ? 0 : 9, borderBottom: i === detailRows.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>{label}</span>
                  {typeof value === 'string'
                    ? <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', textAlign: 'right' }}>{value}</span>
                    : value}
                </div>
              ))}
            </div>
          </div>

        </div>


      </div>
      </div>
    </div>
  );
}
