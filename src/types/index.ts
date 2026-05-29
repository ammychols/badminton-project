export interface Court {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  groups: Group[];
  createdAt: string;
}

export type GroupLevel = 'BB' | 'BG' | 'N-' | 'N' | 'S' | 'P';
export const ALL_LEVELS: GroupLevel[] = ['BB', 'BG', 'N-', 'N', 'S', 'P'];

export interface Group {
  id: string;
  courtId: string;
  name: string;
  days: DayOfWeek[];
  startTime: string;
  endTime: string;
  levels?: GroupLevel[];
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

export type FloorType = 'concrete' | 'wood' | 'rubber';
export type LightLevel = 'bright' | 'medium' | 'dim';
export type AirType = 'aircon' | 'fan' | 'stuffy';
export type CrowdLevel = 'no-wait' | 'some-wait' | 'long-wait';
export type ShuttleType = 'durable' | 'medium' | 'fragile';

export const FLOOR_LABELS: Record<FloorType, string> = { concrete: 'พื้นปูน', wood: 'พื้นไม้', rubber: 'พื้นยาง' };
export const LIGHT_LABELS: Record<LightLevel, string> = { bright: 'สว่าง', medium: 'ปานกลาง', dim: 'มืด' };
export const AIR_LABELS: Record<AirType, string> = { aircon: 'มีแอร์', fan: 'พัดลม', stuffy: 'ถ่ายเทน้อย' };
export const CROWD_LABELS: Record<CrowdLevel, string> = { 'no-wait': 'ไม่ต้องรอ', 'some-wait': 'รอบ้าง', 'long-wait': 'รอนาน' };
export const SHUTTLE_LABELS: Record<ShuttleType, string> = { durable: 'พังยาก', medium: 'ปานกลาง', fragile: 'พังง่าย' };

export interface Review {
  id: string;
  groupId: string;
  date: string;
  fun: number;
  arrangement: number;
  travel: number;
  floor?: FloorType;
  light?: LightLevel;
  air?: AirType;
  crowd?: CrowdLevel;
  shuttle?: ShuttleType;
  shuttleBrand?: string;
  notes?: string;
}

export interface TodayGroup {
  court: Court;
  group: Group;
  averageScore: number;
}
