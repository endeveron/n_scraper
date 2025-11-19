'use client';

import { cn } from '@/core/utils';

interface TimeDisplayProps {
  data: string[];
  title: string;
  className?: string;
}

const TimeDisplay = ({ data, title, className }: TimeDisplayProps) => {
  if (!data.length) return null;
  if ((data.length === 1 && data[0] === '0') || data[0] === '1') return null;

  return (
    <>
      {title ? (
        <div className="fade my-4 font-extrabold tracking-wider bg-card/40 px-6 py-2 rounded-full cursor-default trans-a">
          {title}
        </div>
      ) : null}
      <div
        className={cn(
          'fade w-75 card px-8 py-6 flex-center flex-col gap-4 text-2xl font-black tracking-wider bg-card/90 dark:bg-card/85 cursor-default trans-a',
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
