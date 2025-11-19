'use client';

import MainMenu from '@/core/components/ui/MainMenu';
import { cn } from '@/core/utils';

interface TaskbarProps {
  children?: React.ReactNode;
  loading?: boolean;
}

const Taskbar = ({ children, loading }: TaskbarProps) => {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-4 mx-auto card bg-card/40 hover:bg-card rounded-full my-4 p-2 trans-o',
        loading && 'opacity-100 pointer-events-none'
      )}
    >
      {children ?? null}
      <MainMenu className={cn(loading && 'opacity-40 pointer-events-none')} />
    </div>
  );
};

export default Taskbar;
