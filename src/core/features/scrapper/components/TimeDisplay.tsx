'use client';

import { NO_OUTAGES } from '@/core/features/scrapper/constants';
import { cn } from '@/core/utils';

interface TimeDisplayProps {
  data: string[];
  title: string;
  className?: string;
}

const TimeDisplay = ({ data, title, className }: TimeDisplayProps) => {
  if (!data.length) return null;
  if (data.length === 1 && data[0] === NO_OUTAGES) return null;

  return (
    <>
      {title ? (
        <div className="fade my-4 text-lg font-black tracking-wider bg-card/40 px-6 py-2 rounded-full cursor-default trans-a">
          {title}
        </div>
      ) : null}
      <div
        className={cn(
          'fade card bg-card/80 w-full px-8 py-6 flex-center flex-col gap-4 text-3xl font-black tracking-wider cursor-default trans-a',
          className
        )}
      >
        {data?.map((d) => (
          <div className="text-center" key={d}>
            {d}
          </div>
        )) ?? null}
      </div>{' '}
    </>
  );
};

export default TimeDisplay;
