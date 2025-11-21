'use client';

import { useEffect, useState } from 'react';

import { WeekSchedule } from '@/core/features/scraper/types';
import { WEEKDAYS } from '@/core/translations/uk';
import { cn } from '@/core/utils';

const CURRENT_TIME_UPDATE_INTERVAL = 10 * 60 * 1000; // 10 min
const CELL_HEIGHT = 24;

interface PowerBlock {
  startHour: number;
  endHour: number;
  startOffset: number;
  endOffset: number;
}

interface WeeklyScheduleProps {
  data?: WeekSchedule;
}

const WeeklySchedule = ({ data }: WeeklyScheduleProps) => {
  // const currentTime = useMemo(() => {
  //   const now = new Date();
  //   return now.getHours() + now.getMinutes() / 60;
  // }, []);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  // Update currentTime with interval
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.getHours() + now.getMinutes() / 60);
    };

    // Update immediately so we don't show null
    updateTime();

    const interval = setInterval(updateTime, CURRENT_TIME_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const getDayAbbreviation = (dayNameEn: string): string => {
    const abbr: Record<string, string> = {
      Monday: WEEKDAYS.MONDAY,
      Tuesday: WEEKDAYS.TUESDAY,
      Wednesday: WEEKDAYS.WEDNESDAY,
      Thursday: WEEKDAYS.THURSDAY,
      Friday: WEEKDAYS.FRIDAY,
      Saturday: WEEKDAYS.SATURDAY,
      Sunday: WEEKDAYS.SUNDAY,
    };

    return abbr[dayNameEn] || '';
  };

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
          /**
           * endOffset:... : 0, - This ensures that when
           * a power block ends at the start of an hour
           * (like 14:00), it doesn't incorrectly extend
           * an extra hou into the visualization (to 15:00)
           */
          endOffset: (prev + 1) % 2 ? 0.5 : 0,
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
        endOffset: (prev + 1) % 2 ? 0.5 : 0,
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

  if (!data || !currentTime) return null;

  const currentHour = Math.floor(currentTime);

  return (
    <div className="w-fit">
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
            style={{ height: `${CELL_HEIGHT}px` }}
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
                    style={{ top: `${CELL_HEIGHT / 2}px` }}
                  />
                )}
              </div>
            ))}

            {/* Current time line */}
            {hour === currentHour && (
              <div
                className="absolute w-70 left-8 right-2 h-0.5 bg-accent z-10"
                style={{
                  top: `${(currentTime - currentHour) * CELL_HEIGHT}px`,
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
                  block.startHour * CELL_HEIGHT +
                  block.startOffset * CELL_HEIGHT;
                const end = Math.min(block.endHour + block.endOffset, 24);
                const bottomPos = end * CELL_HEIGHT;

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
