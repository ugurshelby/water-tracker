export type DayType = 'normal' | 'sport';

export interface WTEntry {
  id: string;
  timestamp: string;
  amount_ml: number;
  type: 'water' | 'coffee' | 'juice' | 'other';
  date: string; // YYYY-MM-DD
}

export interface WTSettings {
  day_type: DayType;
  goal_normal_ml: number;
  goal_sport_ml: number;
}

export interface WTDeficit {
  date: string;
  deficit_ml: number;
}
