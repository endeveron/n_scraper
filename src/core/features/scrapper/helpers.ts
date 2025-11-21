import {
  FORM_SELECTOR,
  HOUSE_NUM_AUTOCOMPLETE_ITEM_SELECTOR,
  HOUSE_NUM_AUTOCOMPLETE_LIST_SELECTOR,
  HOUSE_NUM_INPUT_SELECTOR,
  STREET_AUTOCOMPLETE_ITEM_SELECTOR,
  STREET_AUTOCOMPLETE_LIST_SELECTOR,
  STREET_INPUT_SELECTOR,
} from '@/core/features/scrapper/constants';
import { PageWithBrowser } from '@/core/features/scrapper/lib/browser';
import {
  HourStatus,
  PowerStatus,
  ScrapedData,
} from '@/core/features/scrapper/types';

export function shouldRefetch({
  scrapedData,
  updatedAtTimestamp,
  now = new Date(),
  startHour = 21,
  startMinute = 0,
  endHour = 23,
  endMinute = 30,
  staleMinutes = 5,
}: {
  scrapedData: unknown | null;
  updatedAtTimestamp: number | null;
  now?: Date;
  startHour?: number;
  startMinute?: number;
  endHour?: number;
  endMinute?: number;
  staleMinutes?: number;
}) {
  // 0. If no data → always fetch immediately (regardless of time)
  if (!scrapedData) return true;

  const lastUpdated = updatedAtTimestamp ?? 0;

  // 1. Check if current time is inside allowed window
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  const isInTimeRange = currentMinutes >= start && currentMinutes <= end;

  if (!isInTimeRange) return false;

  // 2. Check stale interval
  const STALE_MS = staleMinutes * 60 * 1000;
  const isStale = Date.now() - lastUpdated > STALE_MS;

  return isStale;
}

export async function nukeAllModals(page: PageWithBrowser) {
  await page.evaluate(() => {
    const selectors = [
      '.modal',
      '.modal.is-open',
      '.micromodal-slide',
      '.modal-questionnaire',
      '.modal__overlay',
      '.modal__overlay--opacity',
      '[id^="modal-"]',
    ];

    // Remove all modal-like elements
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => el.remove());
    });

    // Remove any element with extremely high z-index (likely an overlay)
    const all = document.querySelectorAll<HTMLElement>('*');
    all.forEach((el) => {
      const zIndex = window.getComputedStyle(el).zIndex;
      const z = zIndex === 'auto' ? 0 : parseInt(zIndex, 10);

      if (z > 1000) {
        el.remove();
      }
    });

    // Remove scroll locks
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  });
}

// Fill address form (street + house number)
export async function fillAddressForm(
  page: PageWithBrowser,
  street: string,
  houseNumber: string
): Promise<void> {
  const form = page.locator(FORM_SELECTOR);

  /** A modal__overlay (z-index 1001–10001) keeps appearing exactly during these actions:
      - Before waiting for street autocomplete to appear
      - Before clicking street autocomplete
      - Before waiting for house number autocomplete
      - Before clicking house number
   */

  // Fill street field
  const streetInput = form.locator(STREET_INPUT_SELECTOR);
  await streetInput.fill(street);
  await streetInput.dispatchEvent('input');
  logWithTime('fillAddressForm: Street input visible');

  // await logPossibleBlockers(page);
  // Overlay is present
  await nukeAllModals(page);

  // Wait for autocomplete dropdown
  await page.locator(STREET_AUTOCOMPLETE_LIST_SELECTOR).waitFor({
    state: 'visible',
    timeout: 15000,
  });
  logWithTime('fillAddressForm: Dropdown shown');

  // await logPossibleBlockers(page);
  // Overlay is present and intercepts clicks
  await nukeAllModals(page);

  // Click the matching item
  await page
    .locator(STREET_AUTOCOMPLETE_ITEM_SELECTOR)
    .filter({ hasText: street })
    .first()
    .click();
  logWithTime('fillAddressForm: Click to matched street item');

  // Wait for house_num to be enabled
  await page.waitForFunction(
    (selector) => {
      const input = document.querySelector(selector) as HTMLInputElement;
      return input && !input.disabled;
    },
    HOUSE_NUM_INPUT_SELECTOR,
    { timeout: 15000 }
  );
  logWithTime('fillAddressForm: House number input enabled');

  // Fill house number field
  // await page.locator(HOUSE_NUM_INPUT_SELECTOR).fill(houseNumber);
  const houseNumInput = page.locator(HOUSE_NUM_INPUT_SELECTOR);
  await houseNumInput.fill(houseNumber);
  await houseNumInput.dispatchEvent('input');
  logWithTime('fillAddressForm: House number input filled');

  // await logPossibleBlockers(page);
  // Overlay is present
  await nukeAllModals(page);

  // Wait for house autocomplete and click
  await page.locator(HOUSE_NUM_AUTOCOMPLETE_LIST_SELECTOR).waitFor({
    state: 'visible',
    timeout: 15000,
  });
  logWithTime('fillAddressForm: House number autocomplete shown');

  // await logPossibleBlockers(page);
  // Overlay is present and intercepts clicks
  await nukeAllModals(page);

  // Click the matching item
  await page
    .locator(HOUSE_NUM_AUTOCOMPLETE_ITEM_SELECTOR)
    .filter({ hasText: houseNumber })
    .first()
    .click();
  logWithTime('fillAddressForm: Click to matched house num item');

  // Wait for results to load
  await page.waitForTimeout(1000);
}

// Get time slot label
export function getTimeSlot(index: number): string {
  const hours = [
    '00-01',
    '01-02',
    '02-03',
    '03-04',
    '04-05',
    '05-06',
    '06-07',
    '07-08',
    '08-09',
    '09-10',
    '10-11',
    '11-12',
    '12-13',
    '13-14',
    '14-15',
    '15-16',
    '16-17',
    '17-18',
    '18-19',
    '19-20',
    '20-21',
    '21-22',
    '22-23',
    '23-24',
  ];
  return hours[index] || '00-01';
}

// Map CSS class to PowerStatus
export function mapStatusClass(className: string | null): PowerStatus {
  if (!className) return 'on';

  if (className.includes('cell-scheduled-maybe')) return 'off';
  if (className.includes('cell-scheduled')) return 'off';
  if (className.includes('cell-first-half')) return 'off-first-half';
  if (className.includes('cell-second-half')) return 'off-second-half';
  if (className.includes('cell-non-scheduled')) return 'on';

  return 'on';
}

// Convert one day (24 hours) into power-ON time ranges
export function convertDay(hours: HourStatus[]): string[] {
  interface Slot {
    start: string;
    end: string;
    on: boolean;
  }
  const slots: Slot[] = [];

  // Expand each hour into 2×30min slots
  for (const h of hours) {
    const [from, to] = h.timeSlot.split('-');
    const s00 = `${from}:00`;
    const s30 = `${from}:30`;
    const e00 = `${to}:00`;

    switch (h.status) {
      case 'on':
        slots.push({ start: s00, end: s30, on: true });
        slots.push({ start: s30, end: e00, on: true });
        break;
      case 'off':
        slots.push({ start: s00, end: s30, on: false });
        slots.push({ start: s30, end: e00, on: false });
        break;
      case 'off-first-half':
        slots.push({ start: s00, end: s30, on: false });
        slots.push({ start: s30, end: e00, on: true });
        break;
      case 'off-second-half':
        slots.push({ start: s00, end: s30, on: true });
        slots.push({ start: s30, end: e00, on: false });
        break;
    }
  }

  // Merge consecutive ON slots
  const ranges: string[] = [];
  let start: string | null = null;
  let lastEnd: string | null = null;

  for (const s of slots) {
    if (s.on) {
      if (!start) start = s.start;
      lastEnd = s.end;
    } else {
      if (start && lastEnd) ranges.push(`${start} - ${lastEnd}`);
      start = null;
      lastEnd = null;
    }
  }

  // Close last interval if still open
  if (start && lastEnd) {
    ranges.push(`${start} - ${lastEnd}`);
  }

  // If entire day = ON
  if (ranges.length === 1 && ranges[0] === '00:00 - 24:00') {
    return ['1'];
  }

  // If no ON slots at all
  if (ranges.length === 0) {
    return ['0'];
  }

  return ranges;
}

// Day name mapping
export function mapDayNameToEnglish(ukrainianName: string): string {
  const dayMap: Record<string, string> = {
    Понеділок: 'Monday',
    Вівторок: 'Tuesday',
    Середа: 'Wednesday',
    Четвер: 'Thursday',
    "П'ятниця": 'Friday',
    Субота: 'Saturday',
    Неділя: 'Sunday',
  };
  return dayMap[ukrainianName] || ukrainianName;
}

export function logWithTime(msg: string): void {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const millis = now.getMilliseconds().toString().padStart(3, '0');

  console.log(`${msg} [${hours}:${minutes}:${seconds}.${millis}]`);
}

export function prettyLogError(err: Error) {
  const timestamp = new Date().toISOString();
  const name = err.name || 'Error';
  const message = err.message || '';
  const stack = err.stack || '';
  const callLog = message.includes('Call log:')
    ? message.split('Call log:')[1]
    : '';

  console.log(`\n[${timestamp}] ${name}: ${message.split('\n')[0]}\n`);

  if (callLog) {
    const simplifiedLog = callLog
      .replace(/(\d+ × retrying click action)/g, '  - $1')
      .replace(/<div.*?>/g, '<div...>')
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line)
      .join('\n');

    console.log('Call log summary:\n', simplifiedLog);
  }

  if (stack) {
    const shortStack = stack.split('\n').slice(0, 5).join('\n');
    console.log('\nStack trace (shortened):\n', shortStack, '...');
  }
}

export async function logPossibleBlockers(page: PageWithBrowser) {
  try {
    console.log('[DEBUG] Checking for blockers...');

    // 1. Check for ANY modal-like elements
    const modalSelectors = [
      '.modal.is-open',
      '.modal-questionnaire',
      '[id^="modal-"].is-open',
      '.micromodal-slide.is-open',
      '.modal__overlay',
    ];

    for (const sel of modalSelectors) {
      const els = await page.locator(sel).all();
      for (const el of els) {
        if (await el.isVisible()) {
          const box = await el.boundingBox();
          const z = await el.evaluate((node) => getComputedStyle(node).zIndex);

          console.log(`[DEBUG] Visible modal-like element: ${sel}`);
          console.log(`[DEBUG] z-index: ${z}, box:`, box);
        }
      }
    }

    // 2. Log high z-index elements (potential overlays)
    const blockers = page.locator('*');
    const count = await blockers.count();
    for (let i = 0; i < count; i++) {
      const el = blockers.nth(i);
      const z = await el.evaluate((el) => +getComputedStyle(el).zIndex || 0);

      if (z > 1000) {
        const box = await el.boundingBox();
        console.log(`[DEBUG] High z-index element: ${z}`, { box });

        const classes = await el.evaluate((el) => el.className);
        console.log(`[DEBUG] Classes:`, classes);
      }
    }
  } catch (err) {
    console.log('[DEBUG] logPossibleBlockers failed:', err);
  }
}

function parseTimeInterval(interval: string): { start: number; end: number } {
  const [startStr, endStr] = interval.split(' - ').map((s) => s.trim());

  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  const start = parseTime(startStr);
  const end = endStr === '24:00' ? 24 : parseTime(endStr);

  return { start, end };
}

function generateHoursArray(intervals: string[]): PowerStatus[] {
  const hours: PowerStatus[] = Array(24).fill('off');

  intervals.forEach((interval) => {
    const { start, end } = parseTimeInterval(interval);

    const startHour = Math.floor(start);
    const endHour = Math.floor(end);
    const startMinutes = (start % 1) * 60;
    const endMinutes = (end % 1) * 60;

    // Mark hours as 'on' from start to end (exclusive)
    for (let hour = startHour; hour < endHour; hour++) {
      hours[hour] = 'on';
    }

    // Handle partial start hour (e.g., 20:30 - 24:00 starts at 20:30)
    if (startMinutes > 0 && startHour < 24) {
      if (startMinutes > 30) {
        // Power starts in second half, so first half is off
        hours[startHour] = 'off-first-half';
      } else {
        // Power starts in first half (before :30), entire hour might be on
        // But we need to check: does it turn on exactly at :30?
        if (startMinutes === 30) {
          hours[startHour] = 'off-first-half';
        } else {
          // Starts between :00 and :30 - keep as 'on' (set above)
        }
      }
    }

    // Handle partial end hour (e.g., 00:00 - 03:30 ends at 03:30)
    if (endMinutes > 0 && endHour < 24) {
      if (endMinutes <= 30) {
        // Power ends at or before :30, so second half is off
        hours[endHour] = 'off-second-half';
      } else {
        // Power ends after :30, entire hour is on
        hours[endHour] = 'on';
      }
    }
  });

  return hours;
}

export function updateTodaySchedule(scrapedData: ScrapedData): ScrapedData {
  const updatedSchedule = scrapedData.weekSchedule.schedule.map((day) => {
    if (day.isToday) {
      return {
        ...day,
        hours: generateHoursArray(scrapedData.today),
      };
    }
    return day;
  });

  return {
    ...scrapedData,
    weekSchedule: {
      ...scrapedData.weekSchedule,
      schedule: updatedSchedule,
    },
  };
}
