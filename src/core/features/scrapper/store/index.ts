import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { baseSlice, BaseSlice } from '@/core/features/scrapper/store/baseSlice';

type Store = BaseSlice & {
  reset: () => void;
};

export const initialState = {
  scrapedData: null,
  scraping: false,
  updatedAtTimestamp: null,
  updatedWithError: false,
};

export const useStore = create<Store>()(
  devtools(
    persist(
      (...a) => ({
        ...baseSlice(...a),
        reset: () => a[0](initialState),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          scrapedData: state.scrapedData,
          updatedAtTimestamp: state.updatedAtTimestamp,
        }),
      }
    )
  )
);
