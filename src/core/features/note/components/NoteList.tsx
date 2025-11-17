'use client';

import { ScrollArea } from '@/core/components/ui/ScrollArea';
import NoteItem from '@/core/features/note/components/NoteItem';
import { FolderItem, NoteItem as TNoteItem } from '@/core/features/note/types';
import { cn } from '@/core/utils';

const NoteList = ({
  folders,
  notes,
}: {
  folders: FolderItem[];
  notes: TNoteItem[];
}) => {
  return (
    <div className="fade">
      <ScrollArea>
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start flex-1 w-full gap-x-4 gap-y-3 trans-o',
            !notes && 'opacity-40 pointer-events-none'
          )}
        >
          {notes.map((data) => (
            <NoteItem {...data} folders={folders} key={data.id} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NoteList;
