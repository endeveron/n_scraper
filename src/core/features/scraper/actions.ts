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
} from '@/core/features/scraper/constants';
import {
  ScrapedData,
  HourStatus,
  WeekDay,
} from '@/core/features/scraper/types';
import { ServerActionResult } from '@/core/types';

import {
  convertDay,
  fillAddressForm,
  getTimeSlot,
  logWithTime,
  mapDayNameToEnglish,
  mapStatusClass,
  nukeAllModals,
  prettyLogError,
} from '@/core/features/scraper/helpers';
import {
  PageWithBrowser,
  playwrightBrowser,
} from '@/core/features/scraper/lib/browser';

export const getScrapedData = async (): Promise<
  ServerActionResult<ScrapedData>
> => {
  logWithTime('getData: Start');

  let page: PageWithBrowser | null = null;

  try {
    page = await playwrightBrowser.getNewPage();

    await page.goto(DTEK_WEBPAGE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    logWithTime('getData: URL opened');

    await nukeAllModals(page);
    logWithTime('getData: Modal closed');

    await fillAddressForm(page, STREET, HOUSE_NUM);
    logWithTime('getData: Address form filled');

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
      logWithTime('getData: Queue number not found');
    }

    // Extract last update
    const lastUpdateElement = await page.locator(LAST_UPDATE_SELECTOR);
    const lastUpdate = (await lastUpdateElement.textContent())?.trim() || '';
    logWithTime('getData: Last update data extracted');

    // Extract `today's` data
    const todayTab = page.locator(DATE_TAB_ACTIVE_SELECTOR);
    const todayDate =
      (await todayTab.locator(DATE_SPAN_SELECTOR).textContent())?.trim() || '';

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
    logWithTime("getData: Today's data extracted");

    // Switch to `tomorrow` tab
    await page.locator(DATE_TAB_INACTIVE_SELECTOR).click();
    await page.waitForTimeout(500);

    const tomorrowTab = page.locator(DATE_TAB_ACTIVE_SELECTOR);
    logWithTime('getData: Switched to tomorrow tab');
    const tomorrowDate =
      (await tomorrowTab.locator(DATE_SPAN_SELECTOR).textContent())?.trim() ||
      '';

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
    logWithTime("getData: Tomorrow's data extracted");

    // Extract weekly schedule from the same page
    await page.locator('#tableRenderElem').waitFor({
      state: 'visible',
      timeout: 15000,
    });
    logWithTime('getData: Week table is visible');

    const rows = await page.locator(SCHEDULE_TABLE_SELECTOR).all();
    const days: WeekDay[] = [];

    for (const row of rows) {
      const dayNameElement = await row.locator('td[colspan="2"] div').first();
      const dayName = (await dayNameElement.textContent())?.trim() || '';

      const rowClasses = (await row.getAttribute('class')) || '';
      const isYesterday = rowClasses.includes('yesterday-row');

      const firstCell = await row.locator('td[colspan="2"]').first();
      const firstCellClasses = (await firstCell.getAttribute('class')) || '';
      const isToday = firstCellClasses.includes('current-day');

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

    logWithTime('getData: Week table data extracted');

    await page.close({ runBeforeUnload: false });
    logWithTime('getData: Page closed');

    // if (page._browser) {
    //   await page._browser.close();
    //   logWithTime('getData: Browser closed');
    // }

    return {
      success: true,
      data: {
        street: STREET,
        houseNumber: HOUSE_NUM,
        queueNumber,
        lastUpdate,
        today: convertDay(todayHours),
        todayDate,
        tomorrow: convertDay(tomorrowHours),
        tomorrowDate,
        weekSchedule: {
          schedule: days,
          timestamp: Date.now(),
        },
      },
    };
  } catch (err: unknown) {
    logWithTime('getData: ERROR');

    if (err instanceof Error) {
      prettyLogError(err);
    } else {
      console.error('Unknown error:', err);
    }

    if (page) {
      await page.close({ runBeforeUnload: false });
    }
    // if (page?._browser) {
    //   await page._browser.close();
    // }

    return {
      success: false,
      error:
        err instanceof Error
          ? err
          : new Error('getData: Unknown error occurred'),
    };
  }
};

// export const getBaseDataAPI = async ({
//   street,
//   houseNumber,
// }: BaseDataParams): Promise<ServerActionResult<BaseDataAPI>> => {
//   if (!street || !houseNumber) {
//     return {
//       success: false,
//       error: new Error('getBaseDataAPI: Missing required parameters'),
//     };
//   }

//   logWithTime('getBaseDataAPI: Start');

//   let page: PageWithBrowser | null = null;

//   try {
//     page = await playwrightBrowser.getNewPage();

//     await page.goto(DTEK_WEBPAGE_URL, {
//       // waitUntil: 'networkidle',
//       waitUntil: 'domcontentloaded',
//       timeout: 30000,
//     });
//     logWithTime('getBaseDataAPI: URL opened');

//     await closeModalIfPresent(page);
//     logWithTime('getBaseDataAPI: Modal closed');

//     await fillAddressForm(page, street, houseNumber);
//     logWithTime('getBaseDataAPI: Address form filled');

//     // Wait for schedule to load
//     await page.locator(DISCON_FACT_SELECTOR).waitFor({
//       state: 'visible',
//       timeout: 5000,
//     });

//     // Extract queue number
//     let queueNumber = '';
//     try {
//       const queueElement = await page.locator(QUEUE_NUMBER_SELECTOR);
//       if (await queueElement.isVisible()) {
//         const queueText = await queueElement.textContent();
//         queueNumber = queueText?.trim() || '';
//       }
//     } catch {
//       logWithTime('getBaseDataAPI: Queue number not found');
//     }

//     // Extract last update
//     const lastUpdateElement = await page.locator(LAST_UPDATE_SELECTOR);
//     const lastUpdate = (await lastUpdateElement.textContent())?.trim() || '';
//     logWithTime('getBaseDataAPI: Last update data extracted');

//     // Extract `today's` data
//     const todayTab = page.locator(DATE_TAB_ACTIVE_SELECTOR);
//     const todayDate =
//       (await todayTab.locator(DATE_SPAN_SELECTOR).textContent())?.trim() || '';
//     const todayTimestamp = parseInt(
//       (await todayTab.getAttribute('rel')) || '0',
//       10
//     );

//     const todayCells = await page
//       .locator(ACTIVE_TABLE_SELECTOR)
//       .locator(TABLE_CELLS_SELECTOR)
//       .all();
//     const todayHours: HourStatus[] = await Promise.all(
//       todayCells.map(async (cell, index) => ({
//         timeSlot: getTimeSlot(index),
//         status: mapStatusClass(await cell.getAttribute('class')),
//       }))
//     );
//     logWithTime("getBaseDataAPI: Today's data extracted");

//     // Switch to `tomorrow` tab
//     await page.locator(DATE_TAB_INACTIVE_SELECTOR).click();
//     await page.waitForTimeout(500);

//     const tomorrowTab = page.locator(DATE_TAB_ACTIVE_SELECTOR);
//     logWithTime('getBaseDataAPI: Switched to tomorrow tab');
//     const tomorrowDate =
//       (await tomorrowTab.locator(DATE_SPAN_SELECTOR).textContent())?.trim() ||
//       '';
//     const tomorrowTimestamp = parseInt(
//       (await tomorrowTab.getAttribute('rel')) || '0',
//       10
//     );

//     const tomorrowCells = await page
//       .locator(ACTIVE_TABLE_SELECTOR)
//       .locator(TABLE_CELLS_SELECTOR)
//       .all();
//     const tomorrowHours: HourStatus[] = await Promise.all(
//       tomorrowCells.map(async (cell, index) => ({
//         timeSlot: getTimeSlot(index),
//         status: mapStatusClass(await cell.getAttribute('class')),
//       }))
//     );
//     logWithTime("getBaseDataAPI: Tomorrow's data extracted");

//     // Always close page and browser
//     await page.close({ runBeforeUnload: false });
//     if (page._browser) {
//       await page._browser.close();
//       logWithTime('Browser closed');
//     }

//     return {
//       success: true,
//       data: {
//         street,
//         houseNumber,
//         queueNumber,
//         lastUpdate,
//         today: {
//           date: todayDate,
//           dateLabel: 'Today',
//           timestamp: todayTimestamp,
//           hours: todayHours,
//         },
//         tomorrow: {
//           date: tomorrowDate,
//           dateLabel: 'Tomorrow',
//           timestamp: tomorrowTimestamp,
//           hours: tomorrowHours,
//         },
//       },
//     };
//   } catch (err: unknown) {
//     logWithTime('getBaseDataAPI: ERROR');
//     console.log(
//       'getBaseDataAPI Error:',
//       JSON.stringify(err, Object.getOwnPropertyNames(err))
//     );

//     if (page) {
//       await page.close({ runBeforeUnload: false });
//     }
//     if (page?._browser) {
//       await page._browser.close();
//     }

//     return {
//       success: false,
//       error:
//         err instanceof Error
//           ? err
//           : new Error('getBaseDataAPI: Unknown error occurred'),
//     };
//   }
// };

// export const getWeekScheduleAPI = async ({
//   street,
//   houseNumber,
// }: BaseDataParams): Promise<ServerActionResult<WeekSchedule>> => {
//   if (!street || !houseNumber) {
//     return {
//       success: false,
//       error: new Error('getWeekScheduleAPI: Missing required parameters'),
//     };
//   }

//   logWithTime('getWeekScheduleAPI: Start');

//   let page: PageWithBrowser | null = null;

//   try {
//     page = await playwrightBrowser.getNewPage();

//     await page.goto(DTEK_WEBPAGE_URL, {
//       // waitUntil: 'networkidle',
//       waitUntil: 'domcontentloaded',
//       timeout: 30000,
//     });
//     logWithTime('getWeekScheduleAPI: URL opened');

//     await closeModalIfPresent(page);
//     logWithTime('getWeekScheduleAPI: Modal closed');

//     await fillAddressForm(page, street, houseNumber);
//     logWithTime('getWeekScheduleAPI: Address form filled');

//     // Wait for weekly table to load
//     await page.locator('#tableRenderElem').waitFor({
//       state: 'visible',
//       timeout: 15000,
//     });
//     logWithTime('getWeekScheduleAPI: Table is visible');

//     // Extract weekly schedule
//     const rows = await page.locator(SCHEDULE_TABLE_SELECTOR).all();
//     const days: WeekDay[] = [];

//     for (const row of rows) {
//       // Get day name from first column
//       const dayNameElement = await row.locator('td[colspan="2"] div').first();
//       const dayName = (await dayNameElement.textContent())?.trim() || '';

//       // Check if this row is yesterday
//       const rowClasses = (await row.getAttribute('class')) || '';
//       const isYesterday = rowClasses.includes('yesterday-row');

//       // Check if first cell is today
//       const firstCell = await row.locator('td[colspan="2"]').first();
//       const firstCellClasses = (await firstCell.getAttribute('class')) || '';
//       const isToday = firstCellClasses.includes('current-day');

//       // Get all hour cells (skip first 2 colspan cells)
//       const cells = await row.locator('td:not([colspan])').all();
//       const hours: string[] = [];

//       for (const cell of cells) {
//         const className = await cell.getAttribute('class');
//         hours.push(mapStatusClass(className));
//       }

//       days.push({
//         dayName,
//         dayNameEn: mapDayNameToEnglish(dayName),
//         isToday,
//         isYesterday,
//         hours,
//       });
//     }

//     logWithTime('getWeekScheduleAPI: Table data extracted');

//     await page.close({ runBeforeUnload: false });
//     if (page._browser) {
//       await page._browser.close();
//       logWithTime('Browser closed');
//     }

//     return {
//       success: true,
//       data: { schedule: days, timestamp: Date.now() },
//     };
//   } catch (err: unknown) {
//     logWithTime('getWeekScheduleAPI: ERROR');
//     console.log(
//       'getWeekScheduleAPI Error:',
//       JSON.stringify(err, Object.getOwnPropertyNames(err))
//     );

//     if (page) {
//       await page.close({ runBeforeUnload: false });
//     }
//     // if (isLocalDev && page?._browser) {
//     //   await page._browser.close();
//     // }
//     if (page?._browser) {
//       await page._browser.close();
//     }

//     return {
//       success: false,
//       error:
//         err instanceof Error
//           ? err
//           : new Error('getWeekScheduleAPI: Unknown error occurred'),
//     };
//   }
// };

// export const getBaseData = async (): Promise<ServerActionResult<BaseData>> => {
//   const apiRes = await getBaseDataAPI({
//     houseNumber: HOUSE_NUM,
//     street: STREET,
//   });

//   if (!apiRes.success) {
//     return apiRes;
//   }

//   const d = apiRes.data as BaseDataAPI;

//   return {
//     success: true,
//     data: {
//       street: d.street,
//       houseNumber: d.houseNumber,
//       queueNumber: d.queueNumber,
//       lastUpdate: d.lastUpdate,
//       today: convertDay(d.today.hours),
//       todayDate: d.today.date,
//       tomorrow: convertDay(d.tomorrow.hours),
//       tomorrowDate: d.tomorrow.date,
//     },
//   };
// };

// export const getWeekSchedule = async (): Promise<
//   ServerActionResult<WeekSchedule>
// > => {
//   return await getWeekScheduleAPI({
//     houseNumber: HOUSE_NUM,
//     street: STREET,
//   });
// };
