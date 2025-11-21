import { StateCreator } from 'zustand';

import { getScrapedData } from '@/core/features/scraper/actions';
import { updateSchedule } from '@/core/features/scraper/helpers';
import { ScrapedData } from '@/core/features/scraper/types';
import { ServerActionResult } from '@/core/types';
import { initialState } from '@/core/features/scraper/store';

export interface BaseSlice {
  collapsed: boolean;
  scrapedData: ScrapedData | null;
  scraping: boolean;
  updatedAtTimestamp: number | null;
  updatedWithError: boolean;
  scrapeData: () => Promise<ServerActionResult<ScrapedData>>;
  toggleCollapse: () => void;
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

  toggleCollapse: () => {
    set({ collapsed: !get().collapsed });
  },
});
