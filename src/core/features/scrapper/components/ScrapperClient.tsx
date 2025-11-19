'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { RefreshIcon } from '@/core/components/icons/RefreshIcon';
import Loading from '@/core/components/ui/Loading';
import Taskbar from '@/core/components/ui/Taskbar';
import { getData } from '@/core/features/scrapper/actions';
import TimeDisplay from '@/core/features/scrapper/components/TimeDisplay';
import WeeklySchedule from '@/core/features/scrapper/components/WeeklySchedule';
import { CompoundData } from '@/core/features/scrapper/types';
import { cn } from '@/core/utils';

const ScrapperClient = () => {
  const [data, setData] = useState<CompoundData | null>(null);
  const [loading, setLoading] = useState(false);

  // Prevent multiple calls
  const fetchedRef = useRef(false);

  const retrieveData = async () => {
    setLoading(true);
    const res = await getData();

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

  // Init data on mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (() => retrieveData())();
  }, []);

  return (
    <div className="fade flex flex-col min-h-dvh px-4 pb-20">
      <div className="h-20 sticky top-0 flex items-center gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="text-2xl text-accent font-black cursor-default"></div>
        </div>

        <Taskbar loading={loading}>
          {data ? (
            <div
              onClick={retrieveData}
              className="ml-1 icon--action trans-c"
              title="Refresh"
            >
              <RefreshIcon className={cn(loading && 'animate-spin')} />
            </div>
          ) : null}
        </Taskbar>
      </div>

      {loading && !data ? (
        <div className="my-8 flex-center">
          <Loading />
        </div>
      ) : null}

      {data ? (
        <div
          className={cn(
            'fade flex-1 flex-center flex-col gap-8 w-80 m-auto md:flex-row md:gap-10 trans-o',
            loading && 'opacity-40'
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

          <WeeklySchedule data={data.weekSchedule} />
        </div>
      ) : null}
    </div>
  );
};

export default ScrapperClient;
