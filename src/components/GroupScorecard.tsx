import React from 'react';
import { Court, Group, Session, ALL_LEVELS } from '../types';
import { DetailPanel } from './DetailPanel';
import { formatDate } from '../utils/date';
import { computeGroupStats, MIN_SESSIONS_FOR_AVG } from '../utils/groupStats';

interface Props {
  group: Group;
  court: Court;
  sessions: Session[]; // sessions for this group
  onClose: () => void;
  onNavigateToCourt: () => void;
}

const MOOD_EMOJI: Record<number, string> = { 1: '😡', 2: '😴', 3: '😐', 4: '🙂', 5: '😄', 6: '🔥' };
const MOOD_BAR_COLOR = ['#ef4444', '#f97316', '#fbbf24', '#a8d5b5', '#4a9e6e', '#16a34a'];

export function GroupScorecard({ group, court, sessions, onClose }: Props) {
  const stats = computeGroupStats(sessions);
  const enough = stats.hasEnoughData;

  // Mood history — last 10 sessions sorted by date
  const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const moodHistory = sortedSessions.slice(-10).map(s => s.mood);

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
    ...(levelsSorted.length > 0 ? [['ระดับมือ', (
      <div key="levels" className="flex gap-1.5 flex-wrap justify-end">
        {levelsSorted.map(l => (
          <span key={l} title={`ระดับมือ ${l}`} className="text-[11px] font-bold px-2 py-0.5" style={{ background: 'var(--chip-bg)', color: 'var(--chip-t)', borderRadius: 8 }}>{l}</span>
        ))}
      </div>
    )] as [string, React.ReactNode]] : []),
  ];

  const mapsAction = ((court.lat && court.lng) || court.address) ? (
    <a
      href={court.lat && court.lng
        ? `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.name)}`}
      target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0"
      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
      นำทาง
    </a>
  ) : undefined;

  return (
    <DetailPanel title={group.name} subtitle={court.name} action={mapsAction} onClose={onClose}>
      <div className="px-4 py-3.5 flex flex-col gap-3 pb-8">

        {/* Overview - navy gradient card */}
        <div className="rounded-[22px] p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--hero-from) 0%, #0f172a 55%, var(--hero-to) 100%)', boxShadow: '0 8px 28px rgba(0,0,0,.22)' }}>
          <div className="absolute rounded-full" style={{ top: -20, right: -10, width: 120, height: 120, background: 'rgba(255,255,255,0.12)', filter: 'blur(40px)' }} />
          <div className="relative" style={{ zIndex: 1 }}>
            {enough ? (
              /* ≥3 sessions: show 2×2 stat grid */
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {([
                  [stats.count, 'ครั้ง'],
                  [stats.avgGames != null ? stats.avgGames.toFixed(1) : '—', 'เกม/ครั้ง'],
                  [stats.avgMinPerGame ?? '—', 'นาที/เกม'],
                  [stats.avgCost != null ? stats.avgCost : '—', 'บาท/ครั้ง'],
                ] as [React.ReactNode, string][]).map(([v, l]) => (
                  <div key={l}>
                    <div className="font-extrabold text-white leading-none" style={{ fontSize: 28, letterSpacing: '-0.5px' }}>{v}</div>
                    <div className="mt-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{l}</div>
                  </div>
                ))}
              </div>
            ) : (
              /* <3 sessions: count only + thin-data message */
              <div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-extrabold text-white leading-none" style={{ fontSize: 28, letterSpacing: '-0.5px' }}>{stats.count}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>ครั้ง</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                  ยังข้อมูลน้อย — ไปอีกสัก {Math.max(1, MIN_SESSIONS_FOR_AVG - stats.count)} ครั้งจะเห็นค่าเฉลี่ย
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insights card */}
        <div className="bg-white rounded-2xl px-4 py-3.5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,.09), 0 8px 32px rgba(0,0,0,.06)' }}>

          {/* อารมณ์ */}
          {moodHistory.length > 0 && (
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>อารมณ์</span>
                {/* "เฉลี่ย" emoji only when enough data */}
                {enough && stats.avgMood != null && (
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>เฉลี่ย</span>
                    <span style={{ fontSize: 30, lineHeight: 1 }}>{MOOD_EMOJI[Math.round(stats.avgMood)]}</span>
                  </div>
                )}
              </div>

              {moodHistory.length >= 2 ? (
                <>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>ย้อนหลัง</div>
                  <div className="relative mb-5" style={{ height: H }}>
                    <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                      <polyline points={moodPts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#e2e8f0" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                    {moodPts.map((p, i) => (
                      <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: p.y, transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.last && <span style={{ position: 'absolute', width: 34, height: 34, borderRadius: '50%', background: 'rgba(106,177,135,0.22)' }} />}
                        <span style={{ fontSize: p.last ? 25 : 18, lineHeight: 1, position: 'relative' }}>{MOOD_EMOJI[p.m]}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Single session — raw mood, no average label */
                <div className="flex items-center gap-2.5 mb-5 rounded-xl px-3 py-2.5" style={{ background: 'var(--chip-bg)' }}>
                  <span style={{ fontSize: 24, lineHeight: 1 }}>{MOOD_EMOJI[moodHistory[0]]}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    ครั้งล่าสุด · {formatDate(sortedSessions[sortedSessions.length - 1].date).full}
                  </span>
                </div>
              )}

              {/* "ส่วนใหญ่เจอ" distribution — only when enough data */}
              {enough && (
                <>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 8 }}>ส่วนใหญ่เจอ</div>
                  <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 9, gap: 2 }}>
                    {moodCounts.map((o, idx) => (
                      <div key={o.lvl} style={{ flex: o.n, background: MOOD_BAR_COLOR[o.lvl - 1], borderRadius: idx === 0 ? '4px 0 0 4px' : idx === moodCounts.length - 1 ? '0 4px 4px 0' : 0 }} />
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
                </>
              )}
            </div>
          )}

          {moodHistory.length > 0 && <div style={{ borderTop: '1px solid var(--card-border)', marginBottom: 14 }} />}

          {/* ความหนักของเกม */}
          {intTotal > 0 && (
            <div className="mb-3.5">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>ความหนักของเกม</div>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 9, gap: 2 }}>
                {iW.light > 0 && <div style={{ flex: iW.light, background: '#16a34a', borderRadius: '4px 0 0 4px' }} />}
                {iW.medium > 0 && <div style={{ flex: iW.medium, background: '#f59e0b' }} />}
                {iW.heavy > 0 && <div style={{ flex: iW.heavy, background: '#ef4444', borderRadius: '0 4px 4px 0' }} />}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {([[`#16a34a`, 'เบา', intTotal > 0 ? Math.round(intensityDist.light / intTotal * 100) : 0], ['#f59e0b', 'ปานกลาง', intTotal > 0 ? Math.round(intensityDist.medium / intTotal * 100) : 0], ['#ef4444', 'หนัก', intTotal > 0 ? Math.round(intensityDist.heavy / intTotal * 100) : 0]] as [string, string, number][]).map(([color, label, pct]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                    <span style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap' }}>{label} <strong>{pct}%</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {intTotal > 0 && <div style={{ borderTop: '1px solid var(--card-border)', marginBottom: 14 }} />}

          {/* รายละเอียดก๊วน */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>รายละเอียดก๊วน</div>
            <div>
              {detailRows.map(([label, value], i) => (
                <div key={String(label)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: i === 0 ? 0 : 9, paddingBottom: i === detailRows.length - 1 ? 0 : 9, borderBottom: i === detailRows.length - 1 ? 'none' : '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>{label}</span>
                  {typeof value === 'string'
                    ? <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', textAlign: 'right' }}>{value}</span>
                    : value}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* บันทึกล่าสุดของก๊วนนี้ */}
        {sortedSessions.length > 0 && (
          <div className="bg-white rounded-2xl px-4 py-3.5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,.09), 0 8px 32px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>บันทึกล่าสุด</div>
            <div>
              {[...sortedSessions].reverse().slice(0, 5).map((s, i, arr) => {
                const hasTime = !(s.startTime === '00:00' && s.endTime === '00:00');
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: i === 0 ? 0 : 9, paddingBottom: i === arr.length - 1 ? 0 : 9, borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--card-border)' }}>
                    <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{MOOD_EMOJI[s.mood]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{formatDate(s.date).full}</div>
                      {hasTime && <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.startTime} – {s.endTime}</div>}
                    </div>
                    {s.gamesPlayed > 0 && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', flexShrink: 0 }} className="tabular-nums">{s.gamesPlayed} เกม</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DetailPanel>
  );
}
