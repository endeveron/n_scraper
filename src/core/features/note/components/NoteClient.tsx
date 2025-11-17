'use client';

import { FolderPlusIcon } from '@/core/components/icons/FolderPlusIcon';
import Taskbar from '@/core/components/ui/Taskbar';
import { useSessionClient } from '@/core/features/auth/hooks/useSessionClient';
import FolderList from '@/core/features/note/components/FolderList';
import NoteList from '@/core/features/note/components/NoteList';
import { useNoteStore } from '@/core/features/note/store';
import { cn } from '@/core/utils';

const NoteClient = () => {
  const { userId } = useSessionClient();

  const creatingFolder = useNoteStore((s) => s.creatingFolder);
  const createFolder = useNoteStore((s) => s.createFolder);
  const favoriteNotes = useNoteStore((s) => s.favoriteNotes);
  const fetchingFolders = useNoteStore((state) => state.fetchingFolders);
  const folders = useNoteStore((state) => state.folders);

  const handleCreateFolder = async () => {
    if (!userId) return;
    await createFolder({ userId });
  };

  return (
    <div className="fade size-full px-4">
      <div className="h-20 flex items-center gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="text-2xl font-bold cursor-default">Notes</div>
        </div>

        <Taskbar loading={creatingFolder}>
          <div
            onClick={handleCreateFolder}
            className="ml-1 icon--action"
            title="Create a folder"
          >
            <FolderPlusIcon />
          </div>
        </Taskbar>
      </div>

      <FolderList />

      {favoriteNotes.length ? (
        <div
          className={cn(
            'my-8 trans-o',
            fetchingFolders && 'opacity-40 pointer-events-none'
          )}
        >
          <NoteList folders={folders} notes={favoriteNotes} />
        </div>
      ) : null}
    </div>
  );
};

export default NoteClient;
