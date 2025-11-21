import { StateCreator } from 'zustand';

import { getScrapedData } from '@/core/features/scrapper/actions';
import { updateSchedule } from '@/core/features/scrapper/helpers';
import { ScrapedData } from '@/core/features/scrapper/types';
import { ServerActionResult } from '@/core/types';
import { initialState } from '@/core/features/scrapper/store';

export interface BaseSlice {
  scrapedData: ScrapedData | null;
  scraping: boolean;
  updatedAtTimestamp: number | null;
  updatedWithError: boolean;
  scrapeData: () => Promise<ServerActionResult<ScrapedData>>;
}

export const baseSlice: StateCreator<BaseSlice, [], [], BaseSlice> = (
  set,
  get
) => ({
  ...initialState,

  scrapeData: async () => {
    set({ scraping: true });

    if (get().updatedWithError) {
      set({ updatedWithError: false });
    }

    const res = await getScrapedData();
    if (res.success && res.data) {
      set({
        scrapedData: updateSchedule(res.data),
        updatedAtTimestamp: Date.now(),
      });
    } else {
      set({ updatedWithError: true });
    }

    set({ scraping: false });
    return res;
  },
});
