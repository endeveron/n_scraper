'use server';

import { DTEK_WEBPAGE_URL, HOUSE_NUM, STREET } from '@/core/constants';
import {
  ACTIVE_TABLE_SELECTOR,
  DATE_SPAN_SELECTOR,
  DATE_TAB_ACTIVE_SELECTOR,
  DATE_TAB_INACTIVE_SELECTOR,
  DISCON_FACT_SELECTOR,
  LAST_UPDATE_SELECTOR,
  QUEUE_NUMBER_SELECTOR,
  SCHEDULE_TABLE_SELECTOR,
  TABLE_CELLS_SELECTOR,
} from '@/core/features/scrapper/constants';
import {
  BaseData,
  BaseDataAPI,
  BaseDataParams,
  HourStatus,
  WeekDay,
  WeekSchedule,
} from '@/core/features/scrapper/types';
import { ServerActionResult } from '@/core/types';

import {
  closeModalIfPresent,
  convertDay,
  fillAddressForm,
  getTimeSlot,
  mapDayNameToEnglish,
  mapStatusClass,
} from '@/core/features/scrapper/helpers';
import {
  PageWithBrowser,
  playwrightBrowser,
} from '@/core/features/scrapper/lib/browser';

export const getBaseDataAPI = async ({
  street,
  houseNumber,
}: BaseDataParams): Promise<ServerActionResult<BaseDataAPI>> => {
  if (!street || !houseNumber) {
    return {
      success: false,
      error: new Error('getBaseDataAPI: Missing required parameters'),
    };
  }

  let page: PageWithBrowser | null = null;

  try {
    // Use singleton to get a new page
    page = await playwrightBrowser.getNewPage();

    await page.goto(DTEK_WEBPAGE_URL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Use helper functions
    await closeModalIfPresent(page);
    await fillAddressForm(page, street, houseNumber);

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
      console.warn('getBaseDataAPI: Queue number not found');
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

    // Close only the page, browser stays open
    await page.close();

    if (page._browser) {
      await page._browser.close();
    }

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
      'getBaseDataAPI Error:',
      JSON.stringify(err, Object.getOwnPropertyNames(err))
    );

    if (page) {
      await page.close();

      if (page._browser) {
        await page._browser.close();
      }
    }

    return {
      success: false,
      error:
        err instanceof Error
          ? err
          : new Error('getBaseDataAPI: Unknown error occurred'),
    };
  }
};

// For separate caching
export const getWeekScheduleAPI = async ({
  street,
  houseNumber,
}: BaseDataParams): Promise<ServerActionResult<WeekSchedule>> => {
  if (!street || !houseNumber) {
    return {
      success: false,
      error: new Error('getWeekScheduleAPI: Missing required parameters'),
    };
  }

  let page: PageWithBrowser | null = null;

  try {
    // Use singleton to get a new page
    page = await playwrightBrowser.getNewPage();

    await page.goto(DTEK_WEBPAGE_URL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Use helper functions
    await closeModalIfPresent(page);
    await fillAddressForm(page, street, houseNumber);

    // Wait for weekly table to load
    await page.locator('#tableRenderElem').waitFor({
      state: 'visible',
      timeout: 15000,
    });

    // Extract weekly schedule
    const rows = await page.locator(SCHEDULE_TABLE_SELECTOR).all();
    const days: WeekDay[] = [];

    for (const row of rows) {
      // Get day name from first column
      const dayNameElement = await row.locator('td[colspan="2"] div').first();
      const dayName = (await dayNameElement.textContent())?.trim() || '';

      // Check if this row is yesterday
      const rowClasses = (await row.getAttribute('class')) || '';
      const isYesterday = rowClasses.includes('yesterday-row');

      // Check if first cell is today
      const firstCell = await row.locator('td[colspan="2"]').first();
      const firstCellClasses = (await firstCell.getAttribute('class')) || '';
      const isToday = firstCellClasses.includes('current-day');

      // Get all hour cells (skip first 2 colspan cells)
      const cells = await row.locator('td:not([colspan])').all();
      const hours: string[] = [];

      for (const cell of cells) {
        const className = await cell.getAttribute('class');
        hours.push(mapStatusClass(className));
      }

      days.push({
        dayName,
        dayNameEn: mapDayNameToEnglish(dayName),
        isToday,
        isYesterday,
        hours,
      });
    }

    // Close only the page, browser stays open
    await page.close();

    if (page._browser) {
      await page._browser.close();
    }

    return {
      success: true,
      data: { schedule: days, timestamp: Date.now() },
    };
  } catch (err: unknown) {
    console.log(
      'getWeekScheduleAPI Error:',
      JSON.stringify(err, Object.getOwnPropertyNames(err))
    );

    if (page) {
      await page.close();

      if (page._browser) {
        await page._browser.close();
      }
    }

    return {
      success: false,
      error:
        err instanceof Error
          ? err
          : new Error('getWeekScheduleAPI: Unknown error occurred'),
    };
  }
};

export const getBaseData = async (): Promise<ServerActionResult<BaseData>> => {
  const apiRes = await getBaseDataAPI({
    houseNumber: HOUSE_NUM,
    street: STREET,
  });

  if (!apiRes.success) {
    return apiRes;
  }

  const d = apiRes.data as BaseDataAPI;

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

export const getWeekSchedule = async (): Promise<
  ServerActionResult<WeekSchedule>
> => {
  return await getWeekScheduleAPI({
    houseNumber: HOUSE_NUM,
    street: STREET,
  });
};
