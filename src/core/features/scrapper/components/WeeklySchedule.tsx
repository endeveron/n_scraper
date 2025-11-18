'use client';

import { useMemo } from 'react';

import { WeekSchedule } from '@/core/features/scrapper/types';
import { cn } from '@/core/utils';

interface PowerBlock {
  startHour: number;
  endHour: number;
  startOffset: number;
  endOffset: number;
}

interface WeeklyScheduleProps {
  data: WeekSchedule;
  loading?: boolean;
}

const WeeklySchedule = ({ data, loading }: WeeklyScheduleProps) => {
  const currentTime = useMemo(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }, []);

  const getDayAbbreviation = (dayNameEn: string): string => {
    const abbr: Record<string, string> = {
      Monday: 'ПН',
      Tuesday: 'ВТ',
      Wednesday: 'СР',
      Thursday: 'ЧТ',
      Friday: 'ПТ',
      Saturday: 'СБ',
      Sunday: 'НД',
    };
    return abbr[dayNameEn] || '';
  };

  // const getPowerBlocks = (hours: string[]): PowerBlock[] => {
  //   const blocks: PowerBlock[] = [];
  //   let currentBlock: PowerBlock | null = null;

  //   hours.forEach((status, hour) => {
  //     const isOn = status !== 'off';

  //     if (isOn) {
  //       const startOffset = status === 'off-second-half' ? 0.5 : 0;
  //       const endOffset = status === 'off-first-half' ? 0.5 : 1;

  //       if (!currentBlock) {
  //         currentBlock = {
  //           startHour: hour,
  //           endHour: hour,
  //           startOffset,
  //           endOffset,
  //         };
  //       } else {
  //         const expectedStart = currentBlock.endHour + currentBlock.endOffset;
  //         const actualStart = hour + startOffset;

  //         if (Math.abs(expectedStart - actualStart) < 0.01) {
  //           currentBlock.endHour = hour;
  //           currentBlock.endOffset = endOffset;
  //         } else {
  //           blocks.push(currentBlock);
  //           currentBlock = {
  //             startHour: hour,
  //             endHour: hour,
  //             startOffset,
  //             endOffset,
  //           };
  //         }
  //       }
  //     } else {
  //       if (currentBlock) {
  //         blocks.push(currentBlock);
  //         currentBlock = null;
  //       }
  //     }
  //   });

  //   if (currentBlock) {
  //     blocks.push(currentBlock);
  //   }

  //   return blocks;
  // };

  const getPowerBlocks = (hours: string[]): PowerBlock[] => {
    const halfHours: number[] = [];

    hours.forEach((status, hour) => {
      if (status === 'on') {
        halfHours.push(hour * 2, hour * 2 + 1);
      } else if (status === 'off-first-half') {
        halfHours.push(hour * 2 + 1); // only second half ON
      } else if (status === 'off-second-half') {
        halfHours.push(hour * 2); // only first half ON
      }
    });

    // Merge continuous half-hours into blocks
    const blocks: PowerBlock[] = [];
    let start: number | null = null;
    let prev: number | null = null;

    for (const h of halfHours.sort((a, b) => a - b)) {
      if (start === null || prev === null) {
        // Start new block
        start = h;
        prev = h;
        continue;
      }

      if (h === prev + 1) {
        // Continue current block
        prev = h;
      } else {
        // Close previous block
        blocks.push({
          startHour: Math.floor(start / 2),
          startOffset: start % 2 ? 0.5 : 0,
          endHour: Math.floor((prev + 1) / 2),
          endOffset: (prev + 1) % 2 ? 0.5 : 1,
        });

        // Start a new block
        start = h;
        prev = h;
      }
    }

    if (start !== null && prev !== null) {
      blocks.push({
        startHour: Math.floor(start / 2),
        startOffset: start % 2 ? 0.5 : 0,
        endHour: Math.floor((prev + 1) / 2),
        endOffset: (prev + 1) % 2 ? 0.5 : 1,
      });
    }

    // Final clamp: do not allow blocks to extend past 24:00
    blocks.forEach((block) => {
      const end = block.endHour + block.endOffset;
      if (end > 24) {
        block.endHour = 24;
        block.endOffset = 0;
      }
    });

    return blocks;
  };

  const currentHour = Math.floor(currentTime);
  const cellHeight = 24;

  return (
    <div
      className={cn('fade w-fit', loading && 'opacity-40 pointer-events-none')}
    >
      {/* Header Row */}
      <div className="flex mb-0">
        <div className="w-8 shrink-0" />
        {data.schedule.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              'w-10 h-8 flex-center text-xs font-bold',
              day.isToday ? 'text-accent' : 'text-muted'
            )}
          >
            {getDayAbbreviation(day.dayNameEn)}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="relative">
        {Array.from({ length: 24 }).map((_, hour) => (
          <div
            key={hour}
            className="flex relative"
            style={{ height: `${cellHeight}px` }}
          >
            {/* Hour label */}
            <div className="w-8 flex items-start justify-center text-xs text-muted font-bold pr-1 shrink-0">
              <span className="-translate-y-2">
                {hour.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Day columns */}
            {data.schedule.map((day, dayIdx) => (
              <div key={dayIdx} className="w-10 relative">
                <div
                  className={cn(
                    'absolute inset-y-0 inset-x-2',
                    day.isToday
                      ? 'bg-card/90 dark:bg-card/85'
                      : 'bg-muted/15 dark:bg-muted/10'
                  )}
                />

                {/* Hour line */}
                <div className="absolute top-0 inset-x-0 h-px bg-muted/40 dark:bg-muted/15" />

                {/* Half-hour line */}
                {hour < 24 && (
                  <div
                    className="absolute inset-x-0 h-px bg-card/60 dark:bg-card/40"
                    style={{ top: `${cellHeight / 2}px` }}
                  />
                )}
              </div>
            ))}

            {/* Current time line */}
            {hour === currentHour && (
              <div
                className="absolute w-70 left-8 right-2 h-0.5 bg-accent z-10"
                style={{
                  top: `${(currentTime - currentHour) * cellHeight}px`,
                }}
              />
            )}
          </div>
        ))}

        {/* Power blocks overlay */}
        {data.schedule.map((day, dayIdx) => {
          const blocks = getPowerBlocks(day.hours);

          return (
            <div
              key={`blocks-${dayIdx}`}
              className="absolute top-0 pointer-events-none"
              style={{
                left: `${32 + dayIdx * 40}px`,
                width: '40px',
              }}
            >
              {blocks.map((block, blockIdx) => {
                const topPos =
                  block.startHour * cellHeight + block.startOffset * cellHeight;
                const end = Math.min(block.endHour + block.endOffset, 24);
                const bottomPos = end * cellHeight;

                return (
                  <div
                    key={blockIdx}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      top: `${topPos}px`,
                      height: `${bottomPos - topPos}px`,
                    }}
                  >
                    <div
                      className={cn(
                        'w-1.5 h-full rounded-full',
                        day.isToday ? 'bg-accent' : 'bg-muted/70 dark:bg-muted'
                      )}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklySchedule;
