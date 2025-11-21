export type PowerStatus =
  | 'on' // cell-non-scheduled - Світло є
  | 'off' // cell-scheduled - Світла немає
  | 'off-first-half' // cell-first-half - Перші 30 хв
  | 'off-second-half'; // cell-second-half - Другі 30 хв

export interface HourStatus {
  timeSlot: string; // "00-01", "01-02", etc.
  status: PowerStatus;
}

export interface DaySchedule {
  date: string; // "17.11.25"
  dateLabel: string; // "на сьогодні" or "на завтра"
  timestamp: number; // Unix timestamp from rel attribute
  hours: HourStatus[]; // 24 hours (00-01 to 23-24)
}

interface BaseDataBase {
  street: string; // "вул. Зоологічна"
  houseNumber: string; // "12/15"
  queueNumber: string; // "1.2"
  lastUpdate: string; // "16.11.2025 19:57"
}

export interface BaseDataParams {
  street: string;
  houseNumber: string;
}

export interface BaseDataAPI extends BaseDataBase {
  today: DaySchedule;
  tomorrow: DaySchedule;
}

export interface BaseData extends BaseDataBase {
  today: string[]; // Array of 24 status strings ["on", "on", ...],
  tomorrow: string[]; // Array of 24 status strings ["on", "off", ...],
  todayDate: string;
  tomorrowDate: string;
}

export interface WeekDay {
  dayName: string; // "Понеділок", "Вівторок", etc.
  dayNameEn: string; // "Monday", "Tuesday", etc. (for convenience)
  isToday: boolean; // Has .current-day class
  isYesterday: boolean; // Has .yesterday-row class
  hours: string[]; // 24 items: 'on' | 'off' | 'off-first-half' | 'off-second-half'
}

export interface WeekSchedule {
  schedule: WeekDay[]; // 7 days (Monday-Sunday)
  timestamp: number;
}

export interface ScrapedData extends BaseData {
  weekSchedule: WeekSchedule;
}
