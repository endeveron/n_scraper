'use client';

import { cn } from '@/core/utils';

interface TimeDisplayProps {
  data: string[];
  title: string;
  className?: string;
}

const TimeDisplay = ({ data, title, className }: TimeDisplayProps) => {
  if (!data.length) return null;

  return (
    <>
      <div className="my-4 text-sm font-black cursor-default">{title}</div>
      <div
        className={cn(
          'card w-full px-8 py-6 flex-center flex-col gap-4 text-3xl font-black tracking-wider cursor-default',
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
