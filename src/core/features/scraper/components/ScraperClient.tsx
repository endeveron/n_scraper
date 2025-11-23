'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { CollapseIcon } from '@/core/components/icons/CollapseIcon';
import { ExpandIcon } from '@/core/components/icons/ExpandIcon';
import { RefreshIcon } from '@/core/components/icons/RefreshIcon';
import { Button } from '@/core/components/ui/Button';
import Loading from '@/core/components/ui/Loading';
import Taskbar from '@/core/components/ui/Taskbar';
import AutoCounter from '@/core/features/scraper/components/AutoCounter';
import TimeDisplay from '@/core/features/scraper/components/TimeDisplay';
import WeeklySchedule from '@/core/features/scraper/components/WeeklySchedule';
import { shouldRefetch } from '@/core/features/scraper/helpers';
import { useStore } from '@/core/features/scraper/store';
import {
  DATA_ERROR,
  DATA_FETCHING_MESSAGE,
  UPDATE,
} from '@/core/translations/uk';
import { cn } from '@/core/utils';

const ScraperClient = () => {
  const collapsed = useStore((state) => state.collapsed);
  const scrapedData = useStore((state) => state.scrapedData);
  const scrapeData = useStore((state) => state.scrapeData);
  const scraping = useStore((state) => state.scraping);
  const toggleCollapse = useStore((state) => state.toggleCollapse);
  const updatedWithError = useStore((state) => state.updatedWithError);
  const updatedAtTimestamp = useStore((state) => state.updatedAtTimestamp);

  const [mounted, setMounted] = useState(false);

  // Prevent multiple calls
  const initializedRef = useRef(false);

  const lastUpdateRaw = scrapedData?.lastUpdate;
  const lastUpdate = useMemo(() => {
    if (!lastUpdateRaw) return null;

    const arr = lastUpdateRaw.split(' ');
    if (!arr.length || arr.length !== 2) return null;

    return {
      date: arr[0],
      time: arr[1],
    };
  }, [lastUpdateRaw]);

  // Wait for client-side mount
  useEffect(() => {
    (() => setMounted(true))();
  }, []);

  const retrieveData = useCallback(async () => {
    const res = await scrapeData();
    if (!res.success) {
      toast(DATA_ERROR);
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
    <div className="fade relative flex-col flex-center min-h-dvh px-4 pb-12">
      <div
        className={cn(
          'h-20 sticky top-0 flex items-center gap-4',
          collapsed && 'w-75 mx-auto'
        )}
      >
        <div className="flex flex-1 items-center gap-4">
          {collapsed && lastUpdate ? (
            <div className="flex gap-4 text-sm text-muted font-bold tracking-wider cursor-default">
              <span>{lastUpdate.date}</span>
              <span>{lastUpdate.time}</span>
            </div>
          ) : null}
        </div>

        <Taskbar loading={scraping}>
          <div className={cn('flex gap-4 trans-o', scraping && 'opacity-40')}>
            <RefreshIcon onClick={retrieveData} className="icon--action" />
            <div onClick={toggleCollapse} className="icon--action">
              {collapsed ? <ExpandIcon /> : <CollapseIcon />}
            </div>
          </div>
        </Taskbar>
      </div>

      <div
        className={cn(
          'absolute inset-0 -z-10 flex-center opacity-0 select-none bg-background/95 trans-o',
          scraping && 'opacity-100 z-50'
        )}
      >
        <div className="flex-center flex-col gap-6 -translate-y-10">
          <div className="text-xl font-bold">{DATA_FETCHING_MESSAGE}</div>
          <div className="flex gap-4">
            <Loading />
            <AutoCounter loading={scraping} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex-center">
        {scrapedData ? (
          <div
            className={cn(
              'fade flex-1 flex-center flex-col gap-8 w-80 md:flex-row md:gap-16'
            )}
          >
            {!collapsed ? (
              <div className="flex-center shrink-0 flex-col gap-2">
                <div className="mb-4 flex-center flex-col gap-2 w-full cursor-default">
                  <div className="text-center font-extrabold">
                    {scrapedData.street}
                    <span className="ml-3">{scrapedData.houseNumber}</span>
                  </div>

                  <div className="flex gap-8 text-sm text-muted font-semibold">
                    <span>{scrapedData.queueNumber}</span>
                    {lastUpdate ? (
                      <div className="flex gap-4">
                        <span>{lastUpdate.date}</span>
                        <span>{lastUpdate.time}</span>
                      </div>
                    ) : null}
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
            ) : null}

            <WeeklySchedule data={scrapedData.weekSchedule} />
          </div>
        ) : updatedWithError ? (
          <div className="fade my-8 flex-center">
            <Button onClick={retrieveData} variant="outline">
              {UPDATE}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ScraperClient;
