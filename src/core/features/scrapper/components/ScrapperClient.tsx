'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { RefreshIcon } from '@/core/components/icons/RefreshIcon';
import { Button } from '@/core/components/ui/Button';
import Loading from '@/core/components/ui/Loading';
import Taskbar from '@/core/components/ui/Taskbar';
import { getBaseData, getWeekSchedule } from '@/core/features/scrapper/actions';
import TimeDisplay from '@/core/features/scrapper/components/TimeDisplay';
import WeeklySchedule from '@/core/features/scrapper/components/WeeklySchedule';
import { BaseData, WeekSchedule } from '@/core/features/scrapper/types';
import { cn } from '@/core/utils';

const ScrapperClient = () => {
  const [data, setData] = useState<BaseData | null>(null);
  const [loading, setLoading] = useState(false);

  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const retrieveBaseData = async () => {
    setLoading(true);
    const res = await getBaseData();

    if (!res.success) {
      toast(res.error.message ?? 'Помилка при отриманні даних');
      setLoading(false);
      return;
    }

    if (res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  // Init base data on mount
  useEffect(() => {
    if (data) return;

    (() => retrieveBaseData())();
  }, [data]);

  const retrieveSchedule = async () => {
    setLoadingSchedule(true);
    const res = await getWeekSchedule();
    if (!res.success) {
      toast(res.error.message ?? 'Помилка при отриманні даних');
      setLoadingSchedule(false);
      return;
    }
    if (res.data) {
      setSchedule(res.data);
    }
    setLoadingSchedule(false);
  };

  return (
    <div className="fade flex flex-col min-h-dvh px-4 pb-20">
      <div className="h-20 sticky top-0 flex items-center gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="text-2xl text-accent font-black cursor-default"></div>
        </div>

        <Taskbar loading={loading}>
          {data ? (
            <div
              onClick={retrieveBaseData}
              className="ml-1 icon--action trans-c"
              title="Refresh"
            >
              <RefreshIcon />
            </div>
          ) : null}
        </Taskbar>
      </div>

      {loading ? (
        <div className="my-8 flex-center">
          <Loading />
        </div>
      ) : data ? (
        <div
          className={cn(
            'fade flex-1 flex-center flex-col gap-8 w-80 m-auto md:flex-row md:gap-10 trans-o',
            loading && 'opacity-20'
          )}
        >
          <div className="flex-center shrink-0 flex-col md:gap-1">
            <div className="mb-4 flex-center flex-col gap-2 w-full cursor-default">
              <div className="flex gap-3 text font-extrabold">
                <span>{data.street}</span>
                <span>{data.houseNumber}</span>
              </div>
              <div className="flex gap-6 text-sm text-muted font-semibold">
                <span>{data.queueNumber}</span>
                <span>{data.lastUpdate}</span>
              </div>
            </div>

            <TimeDisplay
              title={data.todayDate}
              data={data.today}
              className="text-accent"
            />
            <TimeDisplay title={data.tomorrowDate} data={data.tomorrow} />
          </div>

          {schedule ? (
            <WeeklySchedule data={schedule} loading={loading} />
          ) : (
            <div className="flex-center md:shrink-0 md:w-[312px] md:h-150 md:bg-muted/5 md:rounded-2xl">
              {loadingSchedule ? (
                <Loading />
              ) : (
                <Button variant="outline" onClick={retrieveSchedule}>
                  Графік на тиждень
                </Button>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ScrapperClient;
