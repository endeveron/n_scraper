'use server';

import chromium from '@sparticuz/chromium';
import { chromium as chromiumCore, type Browser } from 'playwright-core';

import { BUILDING, DTEK_WEBPAGE_URL, STREET } from '@/core/constants';
import {
  ACTIVE_TABLE_SELECTOR,
  DATE_SPAN_SELECTOR,
  DATE_TAB_ACTIVE_SELECTOR,
  DATE_TAB_INACTIVE_SELECTOR,
  DISCON_FACT_SELECTOR,
  FORM_SELECTOR,
  HOUSE_NUM_AUTOCOMPLETE_ITEM_SELECTOR,
  HOUSE_NUM_AUTOCOMPLETE_LIST_SELECTOR,
  HOUSE_NUM_INPUT_SELECTOR,
  LAST_UPDATE_SELECTOR,
  MODAL_CLOSE_BTN_SELECTOR,
  MODAL_HIDDEN_SELECTOR,
  NO_DATA,
  NO_OUTAGES,
  QUEUE_NUMBER_SELECTOR,
  STREET_AUTOCOMPLETE_ITEM_SELECTOR,
  STREET_AUTOCOMPLETE_LIST_SELECTOR,
  STREET_INPUT_SELECTOR,
  TABLE_CELLS_SELECTOR,
} from '@/core/features/scrapper/constants';
import {
  HourStatus,
  OutageSchedule,
  OutageScheduleAPI,
  OutageScheduleParams,
  PowerStatus,
} from '@/core/features/scrapper/types';
import { ServerActionResult } from '@/core/types';

export const testFormFilling = async ({
  street,
  houseNumber,
}: {
  street: string;
  houseNumber: string;
}): Promise<
  ServerActionResult<{
    streetFilled: boolean;
    houseNumberFilled: boolean;
    queueNumber: string | null;
    message: string;
  }>
> => {
  // Validation
  if (!street || !houseNumber) {
    return {
      success: false,
      error: new Error(
        'testFormFilling: Missing required parameters (street or houseNumber)'
      ),
    };
  }

  let browser;

  try {
    // Launch browser
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Navigate to DTEK page
    await page.goto(DTEK_WEBPAGE_URL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Close modal if it appears
    try {
      const modalCloseButton = page.locator(MODAL_CLOSE_BTN_SELECTOR);
      await modalCloseButton.waitFor({ state: 'visible', timeout: 3000 });
      await modalCloseButton.click();

      // Wait for modal to actually close (aria-hidden should become "true")
      await page.locator(MODAL_HIDDEN_SELECTOR).waitFor({
        state: 'attached',
        timeout: 3000,
      });
    } catch {
      // Modal not present or already closed
    }

    // Target the correct form using #discon_form
    const form = page.locator(FORM_SELECTOR);

    // STEP 1: Fill street field (scoped to the correct form)
    await form.locator(STREET_INPUT_SELECTOR).fill(street);

    // STEP 2: Wait for autocomplete dropdown
    await page.locator(STREET_AUTOCOMPLETE_LIST_SELECTOR).waitFor({
      state: 'visible',
      timeout: 5000,
    });

    // STEP 3: Click the matching item
    await page
      .locator(STREET_AUTOCOMPLETE_ITEM_SELECTOR)
      .filter({ hasText: street })
      .first()
      .click();

    // STEP 4: Wait for house_num to be enabled
    await page.waitForFunction(
      (selector) => {
        const input = document.querySelector(selector) as HTMLInputElement;
        return input && !input.disabled;
      },
      HOUSE_NUM_INPUT_SELECTOR,
      { timeout: 5000 }
    );

    // STEP 5: Fill house number field
    await page.locator(HOUSE_NUM_INPUT_SELECTOR).fill(houseNumber);

    // STEP 6: Wait for house autocomplete and click
    await page.locator(HOUSE_NUM_AUTOCOMPLETE_LIST_SELECTOR).waitFor({
      state: 'visible',
      timeout: 5000,
    });

    await page
      .locator(HOUSE_NUM_AUTOCOMPLETE_ITEM_SELECTOR)
      .filter({ hasText: houseNumber })
      .first()
      .click();

    // Wait a bit for results to load
    await page.waitForTimeout(1000);

    // Try to extract queue number if visible
    let queueNumber: string | null = null;
    try {
      const queueElement = await page.locator(QUEUE_NUMBER_SELECTOR);
      if (await queueElement.isVisible()) {
        queueNumber = await queueElement.textContent();
      }
    } catch {
      // Queue number not found or not visible yet
    }

    await browser.close();

    return {
      success: true,
      data: {
        streetFilled: true,
        houseNumberFilled: true,
        queueNumber: queueNumber?.trim() || null,
        message: 'Form filled successfully',
      },
    };
  } catch (err: unknown) {
    console.log(
      'Full error object:',
      JSON.stringify(err, Object.getOwnPropertyNames(err))
    );

    if (browser) {
      await browser.close();
    }
    return {
      success: false,
      error:
        err instanceof Error
          ? err
          : new Error('testFormFilling: Unknown error occurred'),
    };
  }
};

export const getOutageScheduleAPI = async ({
  street,
  houseNumber,
}: OutageScheduleParams): Promise<ServerActionResult<OutageScheduleAPI>> => {
  if (!street || !houseNumber) {
    return {
      success: false,
      error: new Error('getOutageScheduleAPI: Missing required parameters'),
    };
  }

  let browser;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    await page.goto(DTEK_WEBPAGE_URL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Close modal
    try {
      const modalCloseButton = page.locator(MODAL_CLOSE_BTN_SELECTOR);
      await modalCloseButton.waitFor({ state: 'visible', timeout: 3000 });
      await modalCloseButton.click();
      await page.locator(MODAL_HIDDEN_SELECTOR).waitFor({
        state: 'attached',
        timeout: 3000,
      });
    } catch {
      // Modal not present
    }

    // Fill form
    const form = page.locator(FORM_SELECTOR);

    // STEP 1: Fill street field (scoped to the correct form)
    await form.locator(STREET_INPUT_SELECTOR).fill(street);

    // Add small delay to allow autocomplete to trigger
    await page.waitForTimeout(300);

    // STEP 2: Wait for autocomplete dropdown
    await page.locator(STREET_AUTOCOMPLETE_LIST_SELECTOR).waitFor({
      state: 'visible',
      timeout: 15000, // Give more time in production
    });

    // STEP 3: Click the matching item
    await page
      .locator(STREET_AUTOCOMPLETE_ITEM_SELECTOR)
      .filter({ hasText: street })
      .first()
      .click();

    // STEP 4: Wait for house_num to be enabled
    await page.waitForFunction(
      (selector) => {
        const input = document.querySelector(selector) as HTMLInputElement;
        return input && !input.disabled;
      },
      HOUSE_NUM_INPUT_SELECTOR,
      { timeout: 15000 }
    );

    // STEP 5: Fill house number field
    await page.locator(HOUSE_NUM_INPUT_SELECTOR).fill(houseNumber);

    // STEP 6: Wait for house autocomplete and click
    await page.locator(HOUSE_NUM_AUTOCOMPLETE_LIST_SELECTOR).waitFor({
      state: 'visible',
      timeout: 5000,
    });

    await page
      .locator(HOUSE_NUM_AUTOCOMPLETE_ITEM_SELECTOR)
      .filter({ hasText: houseNumber })
      .first()
      .click();

    // Wait for results to load
    await page.waitForTimeout(1000);

    // Wait for schedule to load
    await page.locator(DISCON_FACT_SELECTOR).waitFor({
      state: 'visible',
      timeout: 5000,
    });

    // Extract queue number
    let queueNumber = '';
    try {
      const queueElement = await page.locator(QUEUE_NUMBER_SELECTOR);
      if (await queueElement.isVisible()) {
        const queueText = await queueElement.textContent();
        queueNumber = queueText?.trim() || '';
      }
    } catch {
      console.warn('getOutageScheduleAPI: Queue number not found');
    }

    // Extract last update
    const lastUpdateElement = await page.locator(LAST_UPDATE_SELECTOR);
    const lastUpdate = (await lastUpdateElement.textContent())?.trim() || '';

    // Extract TODAY's data
    const todayTab = page.locator(DATE_TAB_ACTIVE_SELECTOR);
    const todayDate =
      (await todayTab.locator(DATE_SPAN_SELECTOR).textContent())?.trim() || '';
    const todayTimestamp = parseInt(
      (await todayTab.getAttribute('rel')) || '0',
      10
    );

    const todayCells = await page
      .locator(ACTIVE_TABLE_SELECTOR)
      .locator(TABLE_CELLS_SELECTOR)
      .all();
    const todayHours: HourStatus[] = await Promise.all(
      todayCells.map(async (cell, index) => ({
        timeSlot: getTimeSlot(index),
        status: mapStatusClass(await cell.getAttribute('class')),
      }))
    );

    // Switch to TOMORROW tab
    await page.locator(DATE_TAB_INACTIVE_SELECTOR).click();
    await page.waitForTimeout(500);

    const tomorrowTab = page.locator(DATE_TAB_ACTIVE_SELECTOR);
    const tomorrowDate =
      (await tomorrowTab.locator(DATE_SPAN_SELECTOR).textContent())?.trim() ||
      '';
    const tomorrowTimestamp = parseInt(
      (await tomorrowTab.getAttribute('rel')) || '0',
      10
    );

    const tomorrowCells = await page
      .locator(ACTIVE_TABLE_SELECTOR)
      .locator(TABLE_CELLS_SELECTOR)
      .all();
    const tomorrowHours: HourStatus[] = await Promise.all(
      tomorrowCells.map(async (cell, index) => ({
        timeSlot: getTimeSlot(index),
        status: mapStatusClass(await cell.getAttribute('class')),
      }))
    );

    await browser.close();

    return {
      success: true,
      data: {
        street,
        houseNumber,
        queueNumber,
        lastUpdate,
        today: {
          date: todayDate,
          dateLabel: 'Today',
          timestamp: todayTimestamp,
          hours: todayHours,
        },
        tomorrow: {
          date: tomorrowDate,
          dateLabel: 'Tomorrow',
          timestamp: tomorrowTimestamp,
          hours: tomorrowHours,
        },
      },
    };
  } catch (err: unknown) {
    console.log(
      'getOutageScheduleAPI Error:',
      JSON.stringify(err, Object.getOwnPropertyNames(err))
    );

    if (browser) {
      await browser.close();
    }
    return {
      success: false,
      error:
        err instanceof Error
          ? err
          : new Error('getOutageScheduleAPI: Unknown error occurred'),
    };
  }
};

export const getOutageSchedule = async (): Promise<
  ServerActionResult<OutageSchedule>
> => {
  const apiRes = await getOutageScheduleAPI({
    houseNumber: BUILDING,
    street: STREET,
  });

  if (!apiRes.success) {
    return apiRes;
  }

  const d = apiRes.data as OutageScheduleAPI;

  return {
    success: true,
    data: {
      street: d.street,
      houseNumber: d.houseNumber,
      queueNumber: d.queueNumber,
      lastUpdate: d.lastUpdate,
      today: convertDay(d.today.hours),
      todayDate: d.today.date,
      tomorrow: convertDay(d.tomorrow.hours),
      tomorrowDate: d.tomorrow.date,
    },
  };
};

// Helper: Launch browser based on environment
async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    // Production: Use v138 (confirmed available)
    const executablePath = await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack.x64.tar'
    );

    return await chromiumCore.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
  } else {
    const playwright = await import('playwright');
    return await playwright.chromium.launch({ headless: true });
  }
}

// Helper: Get time slot label
function getTimeSlot(index: number): string {
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

// Helper: Map CSS class to PowerStatus
function mapStatusClass(className: string | null): PowerStatus {
  if (!className) return 'on';

  if (className.includes('cell-scheduled-maybe')) return 'off';
  if (className.includes('cell-scheduled')) return 'off';
  if (className.includes('cell-first-half')) return 'off-first-half';
  if (className.includes('cell-second-half')) return 'off-second-half';
  if (className.includes('cell-non-scheduled')) return 'on';

  return 'on';
}

// Helper: Convert one day (24 hours) into power-ON time ranges
function convertDay(hours: HourStatus[]): string[] {
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
    return [NO_OUTAGES];
  }

  // If no ON slots at all
  if (ranges.length === 0) {
    return [NO_DATA];
  }

  return ranges;
}
