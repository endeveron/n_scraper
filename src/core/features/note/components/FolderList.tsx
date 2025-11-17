'use client';

import { useTheme } from 'next-themes';
import { useMemo } from 'react';

import { ScrollArea } from '@/core/components/ui/ScrollArea';
import FolderItem from '@/core/features/note/components/FolderItem';
import { useNoteStore } from '@/core/features/note/store';
import { Theme } from '@/core/types';
import { cn } from '@/core/utils';

export interface FolderListProps {
  small?: boolean;
  activeFolderId?: string;
}

const FolderList = ({ activeFolderId, small }: FolderListProps) => {
  const { resolvedTheme } = useTheme();

  const folders = useNoteStore((state) => state.folders);
  const fetchingFolders = useNoteStore((state) => state.fetchingFolders);

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => a.title.localeCompare(b.title));
  }, [folders]);

  return (
    <div className="fade">
      <ScrollArea>
        <div
          className={cn(
            'flex flex-wrap gap-y-3 trans-o',
            fetchingFolders && 'opacity-40 pointer-events-none',
            small ? 'my-8 gap-x-1' : 'gap-x-4'
          )}
        >
          {sortedFolders.map((data) => (
            <FolderItem
              {...data}
              activeFolderId={activeFolderId}
              small={small}
              theme={resolvedTheme as Theme}
              key={data.id}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FolderList;
