import {
  FORM_SELECTOR,
  HOUSE_NUM_AUTOCOMPLETE_ITEM_SELECTOR,
  HOUSE_NUM_AUTOCOMPLETE_LIST_SELECTOR,
  HOUSE_NUM_INPUT_SELECTOR,
  MODAL_CLOSE_BTN_SELECTOR,
  MODAL_HIDDEN_SELECTOR,
  STREET_AUTOCOMPLETE_ITEM_SELECTOR,
  STREET_AUTOCOMPLETE_LIST_SELECTOR,
  STREET_INPUT_SELECTOR,
} from '@/core/features/scrapper/constants';
import { HourStatus, PowerStatus } from '@/core/features/scrapper/types';
import { PageWithBrowser } from '@/core/features/scrapper/lib/browser';

// Close modal if present
export async function closeModalIfPresent(
  page: PageWithBrowser
): Promise<void> {
  try {
    const modalCloseButton = page.locator(MODAL_CLOSE_BTN_SELECTOR);
    await modalCloseButton.waitFor({ state: 'visible', timeout: 3000 });
    await modalCloseButton.click();
    logWithTime('closeModalIfPresent: Close button click');
    await page.locator(MODAL_HIDDEN_SELECTOR).waitFor({
      state: 'attached',
      timeout: 3000,
    });
    await page.waitForTimeout(500);
  } catch {
    // Modal not present
    logWithTime('closeModalIfPresent: Modal not present');
  }
}

// Fill address form (street + house number)
export async function fillAddressForm(
  page: PageWithBrowser,
  street: string,
  houseNumber: string
): Promise<void> {
  const form = page.locator(FORM_SELECTOR);

  // Fill street field
  await form.locator(STREET_INPUT_SELECTOR).fill(street);
  logWithTime('fillAddressForm: Street input filled');

  // Wait for autocomplete dropdown
  await page.locator(STREET_AUTOCOMPLETE_LIST_SELECTOR).waitFor({
    state: 'visible',
    timeout: 15000,
  });
  logWithTime('fillAddressForm: Dropdown shown');

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
  await page.locator(HOUSE_NUM_INPUT_SELECTOR).fill(houseNumber);
  logWithTime('fillAddressForm: House number input filled');

  // Wait for house autocomplete and click
  await page.locator(HOUSE_NUM_AUTOCOMPLETE_LIST_SELECTOR).waitFor({
    state: 'visible',
    timeout: 15000,
  });
  logWithTime('fillAddressForm: House number autocomplete shown');

  // Click the matching item
  await page
    .locator(HOUSE_NUM_AUTOCOMPLETE_ITEM_SELECTOR)
    .filter({ hasText: houseNumber })
    .first()
    .click();
  logWithTime('fillAddressForm: Click to matched house num item');

  // Wait for results to load
  await page.waitForTimeout(1000); // TODO: try to decrease
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
