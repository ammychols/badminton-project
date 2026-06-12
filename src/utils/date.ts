// Centralised date/time helpers.
// All date strings are local YYYY-MM-DD unless noted; month strings are YYYY-MM.
//
// NOTE: we deliberately avoid `new Date().toISOString().slice(0, 10)` for "today".
// toISOString() converts to UTC, so in UTC+7 (Bangkok) any local time before 07:00
// resolves to *yesterday*. Always derive day strings from local getters instead.

// Sunday-first — index with Date.getDay()
export const DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];

// Month abbreviations — index with Date.getMonth()
export const MONTH_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

// Monday-first day-of-week labels — index with (getDay() + 6) % 7
export const DOW_LABELS_SHORT = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

/** Local YYYY-MM-DD for any Date. */
export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Local YYYY-MM-DD for today. */
export function todayString(): string {
  return toDateString(new Date());
}

/** YYYY-MM for the current month. */
export function thisMonthString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Local YYYY-MM-DD for N days ago. */
export function daysAgoString(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateString(d);
}

/**
 * Thai-formatted date parts for a YYYY-MM-DD string.
 * `full` uses the Buddhist calendar year (+543).
 */
export function formatDate(dateStr: string): { day: string; full: string } {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    day: DAY_NAMES[d.getDay()],
    full: `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`,
  };
}

/**
 * Consecutive-day streak ending today (or yesterday, so the streak survives
 * until the end of the following day). Counts distinct session dates.
 */
export function calcStreak(sessions: { date: string }[]): number {
  if (sessions.length === 0) return 0;
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = todayString();
  const yesterday = daysAgoString(1);
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00');
    const curr = new Date(dates[i] + 'T00:00:00');
    prev.setDate(prev.getDate() - 1);
    if (toDateString(prev) === toDateString(curr)) streak++;
    else break;
  }
  return streak;
}
