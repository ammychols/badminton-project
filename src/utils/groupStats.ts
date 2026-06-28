import { Session } from '../types';

export const MIN_SESSIONS_FOR_AVG = 3;

/** Round average mood half-down: 4.5 → 4, 4.6 → 5. Clamped to 1–6. */
export function moodLevel(avg: number): number {
  return Math.min(6, Math.max(1, Math.ceil(avg - 0.5)));
}

export interface GroupStats {
  count: number;
  avgGames: number | null;
  avgMinPerGame: number | null;
  avgMood: number | null;
  avgCost: number | null;
  costSampleSize: number;
  lastVisitDate: string | null;
  hasEnoughData: boolean;
}

export function computeGroupStats(sessions: Session[]): GroupStats {
  const count = sessions.length;

  const avgGames = count > 0
    ? sessions.reduce((sum, s) => sum + s.gamesPlayed, 0) / count
    : null;

  const mpgSamples = sessions
    .filter(s => s.gamesPlayed > 0 && !(s.startTime === '00:00' && s.endTime === '00:00'))
    .map(s => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      let dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0) dur += 24 * 60;
      return Math.round(dur / s.gamesPlayed);
    });
  const avgMinPerGame = mpgSamples.length > 0
    ? Math.round(mpgSamples.reduce((a, b) => a + b, 0) / mpgSamples.length)
    : null;

  const avgMood = count > 0
    ? sessions.reduce((sum, s) => sum + s.mood, 0) / count
    : null;

  const costSessions = sessions.filter(s => s.cost != null);
  const costSampleSize = costSessions.length;
  const avgCost = costSampleSize > 0
    ? Math.round(costSessions.reduce((sum, s) => sum + s.cost!, 0) / costSampleSize)
    : null;

  const dates = sessions.map(s => s.date);
  const lastVisitDate = dates.length > 0 ? dates.reduce((a, b) => (a > b ? a : b)) : null;

  return {
    count,
    avgGames,
    avgMinPerGame,
    avgMood,
    avgCost,
    costSampleSize,
    lastVisitDate,
    hasEnoughData: count >= MIN_SESSIONS_FOR_AVG,
  };
}
