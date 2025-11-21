'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/core/components/ui/Button';
import Loading from '@/core/components/ui/Loading';
import Taskbar from '@/core/components/ui/Taskbar';
import AutoCounter from '@/core/features/scrapper/components/AutoCounter';
import TimeDisplay from '@/core/features/scrapper/components/TimeDisplay';
import WeeklySchedule from '@/core/features/scrapper/components/WeeklySchedule';
import { shouldRefetch } from '@/core/features/scrapper/helpers';
import { useStore } from '@/core/features/scrapper/store';
import { cn } from '@/core/utils';
import { RefreshIcon } from '@/core/components/icons/RefreshIcon';

const ScrapperClient = () => {
  const scrapedData = useStore((state) => state.scrapedData);
  const scrapeData = useStore((state) => state.scrapeData);
  const scraping = useStore((state) => state.scraping);
  const updatedWithError = useStore((state) => state.updatedWithError);
  const updatedAtTimestamp = useStore((state) => state.updatedAtTimestamp);

  const [mounted, setMounted] = useState(false);

  // Prevent multiple calls
  const initializedRef = useRef(false);

  // Wait for client-side mount
  useEffect(() => {
    (() => setMounted(true))();
  }, []);

  const retrieveData = useCallback(async () => {
    const res = await scrapeData();
    if (!res.success) {
      toast('Помилка отримання даних');
      if (res.error.message) {
        console.error(res.error.message);
      }
    }
  }, [scrapeData]);

  // Init data on mount
  useEffect(() => {
    if (!mounted || initializedRef.current) return;

    initializedRef.current = true;

    if (shouldRefetch({ scrapedData, updatedAtTimestamp })) {
      retrieveData();
    }
  }, [scrapedData, updatedAtTimestamp, retrieveData, mounted]);

  return (
    <div className="relative fade flex flex-col min-h-dvh px-4 pb-20">
      <div className="h-20 sticky top-0 flex items-center gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="text-2xl text-accent font-black cursor-default"></div>
        </div>

        <Taskbar loading={scraping}>
          <RefreshIcon
            onClick={retrieveData}
            className={cn('icon--action trans-o', scraping && 'opacity-40')}
          />
        </Taskbar>
      </div>

      <div
        className={cn(
          'absolute inset-0 -z-10 flex-center opacity-0 select-none bg-background/80 trans-o',
          scraping && 'opacity-100 z-50'
        )}
      >
        <div className="flex-center flex-col gap-6 -translate-y-8">
          <Loading />
          <AutoCounter loading={scraping} />
        </div>
      </div>

      {scrapedData ? (
        <div
          className={cn(
            'fade flex-1 flex-center flex-col gap-8 w-80 m-auto md:flex-row md:gap-12'
          )}
        >
          <div className="flex-center shrink-0 flex-col gap-2">
            <div className="mb-4 flex-center flex-col gap-2 w-full cursor-default">
              <div className="flex gap-3 text font-extrabold">
                <span>{scrapedData.street}</span>
                <span>{scrapedData.houseNumber}</span>
              </div>
              <div className="flex gap-6 text-sm text-muted font-semibold">
                <span>{scrapedData.queueNumber}</span>
                <span>{scrapedData.lastUpdate}</span>
              </div>
            </div>

            <TimeDisplay
              title={scrapedData.todayDate}
              data={scrapedData.today}
              className="text-accent"
            />
            <TimeDisplay
              title={scrapedData.tomorrowDate}
              data={scrapedData.tomorrow}
              className="text-muted"
            />
          </div>

          <WeeklySchedule data={scrapedData.weekSchedule} />
        </div>
      ) : updatedWithError ? (
        <div className="fade my-8 flex-center">
          <Button onClick={retrieveData} variant="outline">
            Оновити
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ScrapperClient;
