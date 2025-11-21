import { StateCreator } from 'zustand';

import { getScrapedData } from '@/core/features/scrapper/actions';
import { ScrapedData } from '@/core/features/scrapper/types';
import { ServerActionResult } from '@/core/types';
import { updateTodaySchedule } from '@/core/features/scrapper/helpers';

export interface BaseSlice {
  scrapedData: ScrapedData | null;
  loading: boolean;
  updateAllowed: boolean;
  updatedAtTimestamp: number | null;
  scrapeData: () => Promise<ServerActionResult<ScrapedData>>;
}

export const baseSlice: StateCreator<BaseSlice, [], [], BaseSlice> = (
  set,
  get
) => ({
  scrapedData: null,
  loading: false,
  updateAllowed: false,
  updatedAtTimestamp: null,

  scrapeData: async () => {
    set({ loading: true });

    if (get().updateAllowed) {
      set({ updateAllowed: false });
    }

    const res = await getScrapedData();
    if (res.success && res.data) {
      set({
        scrapedData: updateTodaySchedule(res.data),
        updatedAtTimestamp: Date.now(),
      });
    } else {
      set({ updateAllowed: true });
    }

    set({ loading: false });
    return res;
  },
});
