'use client';

import { cn } from '@/core/utils';
import { useEffect, useState } from 'react';

interface AutoCounterProps {
  loading: boolean;
  delay?: number;
}

export default function AutoCounter({ loading, delay = 0 }: AutoCounterProps) {
  const [count, setCount] = useState(1);
  const [show, setShow] = useState(delay === 0);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShow(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  return (
    <div
      className={cn(
        'text-xl font-extrabold tracking-wider trans-o',
        show ? 'opacity-100' : 'opacity-0'
      )}
    >
      {count}
    </div>
  );
}
