export interface Court {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string; // Google Maps place_id
  groups: Group[];
  createdAt: string;
}

export interface Group {
  id: string;
  courtId: string;
  name: string;
  days: DayOfWeek[]; // วันที่เปิด
  startTime: string; // "08:00"
  endTime: string;   // "12:00"
  notes?: string;
  reviews: Review[];
}

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: 'จ', TUE: 'อ', WED: 'พ', THU: 'พฤ', FRI: 'ศ', SAT: 'ส', SUN: 'อา',
};

export const DAY_FULL_LABELS: Record<DayOfWeek, string> = {
  MON: 'จันทร์', TUE: 'อังคาร', WED: 'พุธ', THU: 'พฤหัส', FRI: 'ศุกร์', SAT: 'เสาร์', SUN: 'อาทิตย์',
};

export interface Review {
  id: string;
  groupId: string;
  date: string; // ISO date
  fun: number;          // 1-5 ดาว ความสนุก
  arrangement: number;  // 1-5 ดาว การจัดมือ
  travel: number;       // 1-5 ดาว การเดินทาง
  notes?: string;
}

export interface TodayGroup {
  court: Court;
  group: Group;
  averageScore: number;
}
