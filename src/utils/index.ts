import { DayOfWeek, Group, Review, TodayGroup, Court } from '../types';

export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date().getDay()];
}

export function getAverageScore(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce(
    (sum, r) => sum + (r.fun + r.arrangement) / 2,
    0
  );
  return Math.round((total / reviews.length) * 10) / 10;
}

export function getTodayGroups(courts: Court[]): TodayGroup[] {
  const today = getTodayDayOfWeek();
  const result: TodayGroup[] = [];

  courts.forEach(court => {
    court.groups.forEach(group => {
      if (group.days.includes(today)) {
        result.push({
          court,
          group,
          averageScore: getAverageScore(group.reviews),
        });
      }
    });
  });

  return result.sort((a, b) => b.averageScore - a.averageScore);
}

export function formatTime(time: string): string {
  return time; // "08:00" → สามารถ format เพิ่มได้
}

export function renderStars(score: number): string {
  return '★'.repeat(Math.round(score)) + '☆'.repeat(5 - Math.round(score));
}
