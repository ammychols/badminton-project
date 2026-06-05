export type FloorType = 'concrete' | 'wood' | 'rubber';
export type AirType = 'aircon' | 'fan' | 'stuffy';
export type ParkingType = 'easy' | 'limited' | 'none';

export const FLOOR_LABELS: Record<FloorType, string> = { concrete: 'พื้นปูน', wood: 'พื้นไม้', rubber: 'พื้นยาง' };
export const AIR_LABELS: Record<AirType, string> = { aircon: 'มีแอร์', fan: 'พัดลม', stuffy: 'ถ่ายเทน้อย' };
export const PARKING_LABELS: Record<ParkingType, string> = { easy: 'จอดรถง่าย', limited: 'จอดรถปานกลาง', none: 'จอดรถยาก' };

export interface CourtInfo {
  floor?: FloorType;
  air?: AirType;
  parking?: ParkingType;
  notes?: string;
}

export interface Court {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  groups: Group[];
  createdAt: string;
  info?: CourtInfo;
}

export type GroupLevel = 'BB' | 'BG' | 'N-' | 'N' | 'S' | 'P-' | 'P';
export const ALL_LEVELS: GroupLevel[] = ['BB', 'BG', 'N-', 'N', 'S', 'P-', 'P'];

export interface Group {
  id: string;
  courtId: string;
  name: string;
  days: DayOfWeek[];
  startTime: string;
  endTime: string;
  levels?: GroupLevel[];
  notes?: string;
  image?: string;
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
  date: string;
  fun: number;
  arrangement: number;
  notes?: string;
}

export interface TodayGroup {
  court: Court;
  group: Group;
  averageScore: number;
}

export type Intensity = 'light' | 'medium' | 'heavy';
export const INTENSITY_LABELS: Record<Intensity, string> = { light: 'เบา', medium: 'ปานกลาง', heavy: 'หนัก' };
export const INTENSITY_EMOJIS: Record<Intensity, string> = { light: '🟢', medium: '🟡', heavy: '🔴' };
export const ALL_INTENSITIES: Intensity[] = ['light', 'medium', 'heavy'];

export interface Session {
  id: string;
  courtId: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  gamesPlayed: number;
  mood: 1 | 2 | 3 | 4 | 5 | 6;
  intensity?: Intensity;
  notes?: string;
}
