import React from 'react';

const NOISE_BG =
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function RacketSVG({ clipId }: { clipId: string }) {
  const cx = 155, cy = 95, rx = 78, ry = 60;
  const ys = [-48, -36, -24, -12, 0, 12, 24, 36, 48];
  const xs = [-62, -47, -31, -16, 0, 16, 31, 47, 62];
  return (
    <svg width="240" height="340" viewBox="0 0 240 340" fill="none"
      className="absolute top-0 right-0 opacity-[0.14] pointer-events-none select-none"
      style={{ zIndex: 2, right: '-12px', top: '-12px' }} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <ellipse cx={cx} cy={cy} rx={rx - 2} ry={ry - 2} />
        </clipPath>
      </defs>
      <g transform={`rotate(18, ${cx}, ${cy})`}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="white" strokeWidth="3.5" />
        {ys.map(dy => (
          <line key={`y${dy}`} x1={cx - rx} y1={cy + dy} x2={cx + rx} y2={cy + dy} stroke="white" strokeWidth="1.5" clipPath={`url(#${clipId})`} />
        ))}
        {xs.map(dx => (
          <line key={`x${dx}`} x1={cx + dx} y1={cy - ry} x2={cx + dx} y2={cy + ry} stroke="white" strokeWidth="1.5" clipPath={`url(#${clipId})`} />
        ))}
        <line x1={cx} y1={cy + ry + 2} x2={cx} y2="285" stroke="white" strokeWidth="5" />
        <rect x={cx - 10} y="285" width="20" height="55" rx="8" stroke="white" strokeWidth="3.5" />
      </g>
    </svg>
  );
}

export interface HeroSparkMonth {
  label: string;
  games: number;
  isCurrent: boolean;
}

export interface HeroCardProps {
  clipId: string;
  totalSessions: number;
  streak: number;
  sparkMonths: HeroSparkMonth[];
  maxSparkGames: number;
  thisMonthGames: number;
  avgGamesPerDay: string | null;
  avgDuration: string | null;
}

export function HeroCard({
  clipId, totalSessions, streak, sparkMonths, maxSparkGames,
  thisMonthGames, avgGamesPerDay, avgDuration,
}: HeroCardProps) {
  return (
    <div className="relative rounded-3xl p-6 mb-4 text-white overflow-hidden shadow-xl"
      style={{ background: 'linear-gradient(135deg, var(--hero-from) 0%, #0f172a 55%, var(--hero-to) 100%)' }}>
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.18)' }} />
      <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.10)' }} />
      <div className="absolute top-0 right-8 w-36 h-36 rounded-full blur-3xl" style={{ background: 'var(--hero-gold, rgba(255,255,255,0.08))' }} />
      <div className="absolute bottom-2 right-1/4 w-20 h-20 rounded-full blur-2xl" style={{ background: 'var(--hero-gold2, rgba(255,255,255,0.06))' }} />
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: NOISE_BG, backgroundSize: '180px 180px' }} />
      <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)' }} />
      <RacketSVG clipId={clipId} />

      <div className="relative z-10 flex items-end justify-between mb-3">
        <div>
          <div className="text-xs text-white/60 mb-0.5">ตีไปทั้งหมด</div>
          <div className="flex items-end gap-1.5 leading-none">
            <span className="text-5xl font-black">{totalSessions}</span>
            <span className="text-lg text-white/60 mb-1">ครั้ง</span>
          </div>
        </div>
        {streak >= 2 && (
          <div className="flex items-center gap-1.5 bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-full">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-semibold">{streak} วันติด</span>
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-end gap-2 mb-4" style={{ height: 68 }}>
        {sparkMonths.map((m, i) => {
          const h = m.games > 0 ? Math.max((m.games / maxSparkGames) * 42, 8) : 4;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
              {m.games > 0 && (
                <span className="text-[10px] font-bold tabular-nums leading-none mb-0.5"
                  style={{ color: m.isCurrent ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)' }}>{m.games}</span>
              )}
              <div className="w-full rounded-t-[4px] transition-all"
                style={{ height: h, backgroundColor: m.isCurrent ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)' }} />
              <span className="text-[9px] font-medium leading-none mt-0.5"
                style={{ color: m.isCurrent ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>{m.label}</span>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 border-t border-white/10 pt-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center"><div className="text-xl font-black">{thisMonthGames}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เกม</div></div>
          <div className="text-center"><div className="text-xl font-black">{avgGamesPerDay ?? '—'}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เกม/วัน</div></div>
          <div className="text-center"><div className="text-xl font-black">{avgDuration ?? '—'}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เฉลี่ย</div></div>
        </div>
      </div>
    </div>
  );
}
