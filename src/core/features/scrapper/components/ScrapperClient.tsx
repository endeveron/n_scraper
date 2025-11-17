'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { RefreshIcon } from '@/core/components/icons/RefreshIcon';
import Loading from '@/core/components/ui/Loading';
import Taskbar from '@/core/components/ui/Taskbar';
import { getOutageSchedule } from '@/core/features/scrapper/actions';
import TimeDisplay from '@/core/features/scrapper/components/TimeDisplay';
import { OutageSchedule } from '@/core/features/scrapper/types';
import { cn } from '@/core/utils';

const ScrapperClient = () => {
  const [data, setData] = useState<OutageSchedule | null>(null);
  const [loading, setLoading] = useState(false);

  const retrieveData = async () => {
    setLoading(true);
    const res = await getOutageSchedule();

    if (!res.success) {
      toast(res.error.message ?? 'Помилка при отриманні даних');
      return;
    }

    if (res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  // Init data on mount
  useEffect(() => {
    if (data) return;

    (() => retrieveData())();
  }, [data]);

  return (
    <div className="fade size-full px-4">
      <div className="h-20 flex items-center gap-4">
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
              <RefreshIcon
                className={cn(loading && 'text-accent animate-spin')}
              />
            </div>
          ) : null}
        </Taskbar>
      </div>

      {data ? (
        <div
          className={cn(
            'fade flex-center flex-col max-w-lg m-auto trans-o',
            loading && 'opacity-20'
          )}
        >
          <div className="flex-center flex-col gap-1 w-full my-2 p-6 card bg-card/60 cursor-default">
            <div className="flex gap-2 text-lg font-black">
              <span>{data.street}</span>
              <span>{data.houseNumber}</span>
            </div>
            <div className="flex gap-6 text-sm text-muted font-semibold">
              <span>{data.queueNumber}</span>
              <span>{data.lastUpdate}</span>
            </div>
          </div>

          <TimeDisplay
            title="Сьогодні"
            data={data.today}
            className="text-accent"
          />
          <TimeDisplay
            title="Завтра"
            data={data.tomorrow}
            className="opacity-60"
          />
        </div>
      ) : (
        <div className="flex-center">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default ScrapperClient;
