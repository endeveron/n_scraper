'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { EditIcon } from '@/core/components/icons/EditIcon';
import { FileIcon } from '@/core/components/icons/FileIcon';
import { LockIcon } from '@/core/components/icons/LockIcon';
import { MenuIcon } from '@/core/components/icons/MenuIcon';
import { TrashIcon } from '@/core/components/icons/TrashIcon';
import TaskbarPrompt from '@/core/components/ui/TaskbarPrompt';
import { MoveNoteDropdown } from '@/core/features/note/components/MoveNoteDropdown';
import { useNoteStore } from '@/core/features/note/store';
import {
  FolderItem,
  TargetFolderData,
  NoteItem as TNoteItem,
} from '@/core/features/note/types';
import { cn, markdownToPlainText } from '@/core/utils';
import { AcceptIcon } from '@/core/components/icons/AcceptIcon';
import { StarIcon } from '@/core/components/icons/StarIcon';

const NoteItem = ({
  id,
  content,
  favorite,
  // tags,
  // timestamp,
  folderId,
  encrypted,
  title,
  folders,
}: TNoteItem & {
  folders: FolderItem[];
}) => {
  const router = useRouter();

  const moveNote = useNoteStore((s) => s.moveNote);
  const movingNote = useNoteStore((s) => s.movingNote);
  const removeNote = useNoteStore((s) => s.removeNote);
  const removingNote = useNoteStore((s) => s.removingNote);
  const updateNoteFavorite = useNoteStore((s) => s.updateNoteFavorite);
  const updatingNote = useNoteStore((s) => s.updatingNote);

  const [showTaskbar, setShowTaskbar] = useState(false);
  const [removeNotePrompt, setRemoveNotePrompt] = useState(false);
  const [isFavorite, setIsFavorite] = useState(favorite);

  const handleToggleTaskbar = () => {
    setShowTaskbar((prev) => !prev);
  };

  const handleNoteClick = () => {
    router.push(`/note/${id}`);
  };

  const handleMoveNote = async ({
    folderId,
    folderTitle,
  }: TargetFolderData) => {
    const res = await moveNote({ folderId, noteId: id });
    toast(
      res.success ? (
        <div className="flex items-center gap-3">
          <AcceptIcon className="text-success" />
          <div>{`Note moved to the ${folderTitle} folder`}</div>
        </div>
      ) : (
        'Unable to move note'
      )
    );
  };

  const handleFavorite = async () => {
    const updFavorite = !favorite;
    setIsFavorite(updFavorite);

    const res = await updateNoteFavorite({ noteId: id, favorite: updFavorite });

    if (!res.success) {
      toast(res.error.message ?? 'Unable to process favorite in the database');
      return;
    }
  };

  const handleEditNote = () => {
    router.push(`/note/${id}?mode=edit`);
  };

  const handleRemoveNote = () => {
    setRemoveNotePrompt(true);
  };

  const handleRemoveNoteAccept = async () => {
    setRemoveNotePrompt(true);
    const res = await removeNote({ noteId: id });

    if (!res.success) {
      toast(res.error.message ?? 'Unable to delete note');
      setRemoveNotePrompt(false);
      return;
    }

    setRemoveNotePrompt(false);
    router.replace(`/folder/${folderId}`);
  };

  const handleRemoveNoteDecline = () => {
    setRemoveNotePrompt(false);
  };

  const plainContent = markdownToPlainText(content);

  const taskbar = (
    <div className="ml-2 mr-1 h-6 flex gap-3">
      {removeNotePrompt ? (
        <TaskbarPrompt
          onAccept={handleRemoveNoteAccept}
          onDecline={handleRemoveNoteDecline}
          loading={removingNote}
        />
      ) : (
        <>
          <div
            className={cn('mr-1', isFavorite ? 'text-icon' : 'icon--action')}
            onClick={handleFavorite}
            title={`${isFavorite ? 'Unfavorite' : 'Favorite'} note`}
          >
            <StarIcon />
          </div>
          <div className="mr-1">
            <MoveNoteDropdown
              currentFolderId={folderId}
              folders={folders}
              onMoveNote={handleMoveNote}
              loading={movingNote}
            />
          </div>
          <div
            className="icon--action mr-1"
            onClick={handleEditNote}
            title="Edit note"
          >
            <EditIcon />
          </div>
          <div
            className="icon--action"
            onClick={handleRemoveNote}
            title="Delete note"
          >
            <TrashIcon />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'card max-w-full flex p-2 cursor-pointer trans-o',
        updatingNote && 'opacity-0 pointer-events-none'
      )}
    >
      <div
        onClick={handleNoteClick}
        className="flex flex-1 w-full items-center min-w-0"
      >
        <div className="w-6 min-w-6 h-6 ml-1 text-icon -translate-x-1.5">
          {encrypted ? <LockIcon /> : <FileIcon />}
        </div>

        <div className="min-w-fit truncate">{title}</div>
        <div className={cn('ml-3 text-muted/80 truncate', encrypted ? '' : '')}>
          {encrypted ? '3N0RYP73D' : plainContent}
        </div>
      </div>

      {showTaskbar ? taskbar : null}

      <div
        onClick={handleToggleTaskbar}
        className="w-6 min-w-6 h-6 ml-2 icon--action"
        title={showTaskbar ? 'Collapse' : 'Show menu'}
      >
        <MenuIcon />
      </div>
    </div>
  );
};

export default NoteItem;
