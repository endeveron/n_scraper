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
  timestamp: number; // Unix timestamp from rel attribute (1763330400)
  hours: HourStatus[]; // 24 hours (00-01 to 23-24)
}

interface OutageScheduleBase {
  // Address info
  street: string; // "вул. Зоологічна"
  houseNumber: string; // "12/15"
  queueNumber: string; // "1.2"

  // Metadata
  lastUpdate: string; // "16.11.2025 19:57"
}

export interface OutageScheduleAPI extends OutageScheduleBase {
  // Schedule data
  today: DaySchedule;
  tomorrow: DaySchedule;
}

export interface OutageSchedule extends OutageScheduleBase {
  // Schedule data
  today: string[];
  tomorrow: string[];
  todayDate: string;
  tomorrowDate: string;
}

export interface OutageScheduleParams {
  street: string;
  houseNumber: string;
}
