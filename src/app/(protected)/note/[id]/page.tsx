'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import 'highlight.js/styles/github-dark.css';
import { Lock, LockOpen } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

import { AcceptIcon } from '@/core/components/icons/AcceptIcon';
import { ClearIcon } from '@/core/components/icons/ClearIcon';
import { EditIcon } from '@/core/components/icons/EditIcon';
import { EyeIcon } from '@/core/components/icons/EyeIcon';
import { FileIcon } from '@/core/components/icons/FileIcon';
import { LockIcon } from '@/core/components/icons/LockIcon';
import { SaveIcon } from '@/core/components/icons/SaveIcon';
import { TrashIcon } from '@/core/components/icons/TrashIcon';
import { UnlockIcon } from '@/core/components/icons/UnlockIcon';
import { Button } from '@/core/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormMessage,
  FormTextarea,
} from '@/core/components/ui/Form';
import Loading from '@/core/components/ui/Loading';
import LoadingIcon from '@/core/components/ui/LoadingIcon';
import { NavBack } from '@/core/components/ui/NavBack';
import Taskbar from '@/core/components/ui/Taskbar';
import TaskbarPrompt from '@/core/components/ui/TaskbarPrompt';
import { useSessionClient } from '@/core/features/auth/hooks/useSessionClient';
import FolderList from '@/core/features/note/components/FolderList';
import { MoveNoteDropdown } from '@/core/features/note/components/MoveNoteDropdown';
import {
  updateNoteContentSchema,
  UpdateNoteContentSchema,
  updateNoteTitleSchema,
  UpdateNoteTitleSchema,
} from '@/core/features/note/schemas';
import { useNoteStore } from '@/core/features/note/store';
import { NoteItem, TargetFolderData } from '@/core/features/note/types';
import { useClipboard } from '@/core/hooks/useClipboard';
import { ServerActionResult } from '@/core/types';
import { cn } from '@/core/utils';

export default function NotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { paste } = useClipboard();
  const { userId } = useSessionClient();

  const decryptNote = useNoteStore((s) => s.decryptNote);
  const decryptNoteInDB = useNoteStore((s) => s.decryptNoteInDB);
  const encryptNote = useNoteStore((s) => s.encryptNote);
  const favoriteNotes = useNoteStore((s) => s.favoriteNotes);
  const fetchNote = useNoteStore((s) => s.fetchNote);
  const folderNotes = useNoteStore((s) => s.folderNotes);
  const folders = useNoteStore((s) => s.folders);
  const moveNote = useNoteStore((s) => s.moveNote);
  const movingNote = useNoteStore((s) => s.movingNote);
  const removeNote = useNoteStore((s) => s.removeNote);
  const removingNote = useNoteStore((s) => s.removingNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const updatingNote = useNoteStore((s) => s.updatingNote);
  const updateFavoriteNotes = useNoteStore((s) => s.updateFavoriteNotes);

  const [note, setNote] = useState<NoteItem | null>(null);
  const [removeNotePrompt, setRemoveNotePrompt] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const statusFromSearchParams = searchParams.get('status');
  const isNewNote = statusFromSearchParams === 'new';
  const modeFromSearchParams = searchParams.get('mode');
  const enableEditMode = modeFromSearchParams === 'edit';

  const titleForm = useForm<UpdateNoteTitleSchema>({
    resolver: zodResolver(updateNoteTitleSchema),
    defaultValues: {
      title: '',
    },
  });

  const contentForm = useForm<UpdateNoteContentSchema>({
    resolver: zodResolver(updateNoteContentSchema),
    defaultValues: {
      content: '',
    },
  });
  const content = contentForm.watch('content');

  const folderId = note && note.folderId;
  const titleIsDirty = titleForm.formState.isDirty;
  const contentIsDirty = contentForm.formState.isDirty;
  const contentIsEmpty = note && !note.content && !content;
  const contentIsEncrypted = note && note.encrypted;
  const contentIsDecrypted = note && note.decrypted;

  const noteId = useMemo(() => {
    const pathArr = pathname.split('/');
    return pathArr.includes('note') ? pathArr[2] : null;
  }, [pathname]);

  const handleToggleMode = () => {
    if (contentIsEncrypted) return;

    if (editMode) {
      // When switching from edit to view, update the note with current form values
      const currentContent = contentForm.getValues('content');
      const currentTitle = titleForm.getValues('title');

      setNote((prev) =>
        prev
          ? {
              ...prev,
              content: currentContent,
              title: currentTitle,
            }
          : null
      );
    }

    setEditMode((prev) => !prev);
  };

  const handlePasteContent = async () => {
    const content = await paste();
    if (content) {
      setEditMode(true);
      contentForm.setValue('content', content);
    }
  };

  const handleClearContent = () => {
    contentForm.setValue('content', '');
    setNote((prev) =>
      prev
        ? {
            ...prev,
            content: '',
          }
        : null
    );
  };

  const handleEncryptNote = async () => {
    if (!userId || !noteId || contentIsEmpty) return;

    const res = await encryptNote({
      noteId,
      content,
    });

    if (!res.success) {
      toast(res.error.message ?? 'Unable to encrypt note');
      return;
    }

    toast(
      <div className="flex items-center gap-3">
        <Lock className="scale-80 text-success" />
        <div>Note content is encrypted and safe</div>
      </div>
    );
  };

  const handleDecryptNoteInDB = async () => {
    if (!userId || !noteId) return;

    const res = await decryptNoteInDB({
      noteId,
    });

    if (!res.success) {
      toast(res.error.message ?? 'Unable to decrypt note in db');
      return;
    }

    toast(
      <div className="flex items-center gap-3">
        <LockOpen className="scale-80 text-warning" />
        <div>Note content is decrypted and may be exposed</div>
      </div>
    );
  };

  const handleSaveNote = async () => {
    if (!userId || !note || !noteId || !folderId) return;

    const title = titleForm.getValues('title');
    const content = contentForm.getValues('content');

    // Validate both forms
    const titleValid = await titleForm.trigger();
    const contentValid = await contentForm.trigger();

    if (!titleValid || !contentValid) return;

    const noteData: {
      folderId: string;
      noteId: string;
      content?: string;
      title?: string;
    } = {
      content,
      folderId,
      noteId,
      title,
    };

    let res: ServerActionResult;

    // If content is been decrypted locally
    if (contentIsDecrypted) {
      res = await encryptNote({
        ...noteData,
        content,
      });
    } else {
      res = await updateNote(noteData);
    }

    if (!res.success) {
      toast(res.error.message ?? 'Unable to update note');
      return;
    }

    setNote((prev) =>
      prev
        ? {
            ...prev,
            content,
            title,
          }
        : null
    );
    setEditMode(false);

    // Update note in favoriteNotes array
    if (favoriteNotes.length) {
      updateFavoriteNotes({
        note: {
          ...note,
          content,
          title,
        },
      });
    }
  };

  const handleMoveNote = async ({
    folderId,
    folderTitle,
  }: TargetFolderData) => {
    if (!note) return;

    const res = await moveNote({ folderId, noteId: note.id });

    let toastContent = <span>Unable to move note</span>;

    if (res.success) {
      toastContent = (
        <div className="flex items-center gap-3">
          <AcceptIcon className="text-success" />
          <div>
            Note moved to the{' '}
            <span className="text-accent font-semibold mx-0.5">
              {folderTitle}
            </span>{' '}
            folder
          </div>
        </div>
      );
    }

    toast(toastContent);

    setNote((prev) =>
      prev
        ? {
            ...prev,
            folderId,
          }
        : null
    );
  };

  const handleRemoveNote = () => {
    setRemoveNotePrompt(true);
  };

  const handleRemoveNoteAccept = async () => {
    if (!userId || !noteId) return;

    setRemoveNotePrompt(true);
    const res = await removeNote({ noteId });

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

  const decryptNoteContentLocally = useCallback(async () => {
    if (!userId || !noteId) return;

    const res = await decryptNote({
      noteId,
    });

    if (!res.success) {
      toast(res.error.message ?? 'Unable to decrypt note content locally');
      return;
    }

    if (!res.data) {
      toast('Unable to decrypt note content');
      return;
    }

    const decryptedContent = res.data;

    (async () => {
      setNote((prev) =>
        prev
          ? {
              ...prev,
              content: decryptedContent,
              encrypted: false,
              decrypted: true,
            }
          : null
      );
    })();
  }, [decryptNote, noteId, userId]);

  // Auto-decrypt content
  useEffect(() => {
    if (contentIsEncrypted && !contentIsDecrypted) {
      decryptNoteContentLocally();
    }
  }, [contentIsEncrypted, contentIsDecrypted, decryptNoteContentLocally]);

  // Initialize note data
  useEffect(() => {
    if (!noteId) return;

    // Search note in the folderNotes array
    const noteFromFolderNotes =
      folderNotes.length && folderNotes.find((n) => n.id === noteId);
    if (noteFromFolderNotes) {
      setNote(noteFromFolderNotes);
      return;
    }

    // Check favoriteNotes array
    const noteFromFavoriteNotes = favoriteNotes.find((n) => n.id === noteId);
    if (noteFromFavoriteNotes) {
      setNote(noteFromFavoriteNotes);
      return;
    }

    // Fetch from server as last resort
    (async () => {
      const res = await fetchNote({ noteId });
      if (!res.success || !res.data?.id) {
        toast('Unable to retrieve note data');
        return;
      }

      setNote(res.data);
    })();

    // Don't include `note` in the deps array - when update note state
    // in handleToggleMode, this effect runs again and overwrites
    // changes with the original folderNotes[index] value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderNotes, noteId]);

  // Reset titleForm and contentForm
  useEffect(() => {
    if (!note) return;

    titleForm.reset({
      title: note.title,
    });

    contentForm.reset({
      content: note.content,
    });
  }, [contentForm, note, titleForm]);

  // Enable edit mode for a new note
  useEffect(() => {
    if (enableEditMode || isNewNote) {
      setEditMode(true);
    }
  }, [enableEditMode, isNewNote]);

  const pasteContentBtn = !contentIsDirty ? (
    <div className="fade my-6 flex-center">
      <Button
        onClick={handlePasteContent}
        variant="outline"
        className="fade px-6"
      >
        Paste content from clipboard
      </Button>
    </div>
  ) : null;

  return (
    <div className="fade size-full flex flex-col px-4">
      <div className="sticky z-10 top-0 min-h-20 flex items-center gap-4 bg-background trans-c">
        <div className="flex flex-1 items-center gap-4 min-w-0 w-full overflow-hidden">
          <NavBack />

          {note && editMode ? (
            <Form {...titleForm}>
              <form className={cn('fade w-full', updatingNote && 'inactive')}>
                <FormField
                  control={titleForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <FormInput className="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : null}

          {note && !editMode ? (
            <div
              onClick={handleToggleMode}
              className="flex items-center gap-2 min-w-0 cursor-pointer"
              title="Click to edit"
            >
              {/* Icon */}
              <div className="shrink-0 text-icon">
                {contentIsEncrypted ? <LockIcon /> : <FileIcon />}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="truncate py-4 text-xl font-bold">
                  {note.title}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <Taskbar loading={removingNote || updatingNote}>
          {removeNotePrompt ? (
            <TaskbarPrompt
              onAccept={handleRemoveNoteAccept}
              onDecline={handleRemoveNoteDecline}
              loading={removingNote}
            />
          ) : (
            <>
              {titleIsDirty || contentIsDirty ? (
                <div
                  onClick={handleSaveNote}
                  className="ml-1 text-accent cursor-pointer trans-c"
                  title="Save changes"
                >
                  <SaveIcon />
                </div>
              ) : null}

              {contentIsDecrypted ? (
                <div
                  onClick={handleDecryptNoteInDB}
                  className="ml-1 icon--action"
                  title="Decrypt content in DB"
                >
                  <UnlockIcon />
                </div>
              ) : null}

              {!contentIsEncrypted && !contentIsEmpty && !contentIsDecrypted ? (
                <div
                  onClick={handleEncryptNote}
                  className="ml-1 text-icon cursor-pointer"
                  title="Encrypt note content"
                >
                  <LockIcon />
                </div>
              ) : null}

              <div onClick={handleToggleMode} className="ml-1 icon--action">
                {editMode ? (
                  <div title="Preview mode">
                    <EyeIcon />
                  </div>
                ) : (
                  <div title="Edit mode">
                    <EditIcon />
                  </div>
                )}
              </div>

              {note && !editMode ? (
                <div className="ml-1">
                  <MoveNoteDropdown
                    currentFolderId={note.folderId}
                    folders={folders}
                    onMoveNote={handleMoveNote}
                    loading={movingNote}
                  />
                </div>
              ) : null}

              {content && editMode ? (
                <div
                  onClick={handleClearContent}
                  className="ml-1 icon--action"
                  title="Clear note content"
                >
                  <ClearIcon />
                </div>
              ) : null}

              <div
                onClick={handleRemoveNote}
                className="ml-1 icon--action"
                title="Delete note"
              >
                <TrashIcon />
              </div>
            </>
          )}
        </Taskbar>
      </div>

      <div className="flex-1">
        {note ? (
          <>
            {contentIsEncrypted ? (
              <div className="fade my-6 flex-center items-center gap-3 select-none">
                <div className="scale-75">
                  <LoadingIcon />
                </div>
                <div className="text-muted">Decrypting content...</div>
              </div>
            ) : editMode ? (
              <div className="fade">
                <Form {...contentForm}>
                  <form className={cn('w-full', updatingNote && 'inactive')}>
                    <FormField
                      control={contentForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <FormTextarea className="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                {isNewNote ? pasteContentBtn : null}
              </div>
            ) : contentIsEmpty ? (
              pasteContentBtn
            ) : (
              <article
                onClick={handleToggleMode}
                className="fade prose prose-lg dark:prose-invert max-w-none cursor-default"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {note.content}
                </ReactMarkdown>
              </article>
            )}
          </>
        ) : (
          <div className="mt-20 flex-center">
            <Loading delay={2000} />
          </div>
        )}
      </div>

      <div className="flex-center">
        <FolderList small activeFolderId={note?.folderId} />
      </div>
    </div>
  );
}
