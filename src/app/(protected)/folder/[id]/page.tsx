'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { EditIcon } from '@/core/components/icons/EditIcon';
import { FilePlusIcon } from '@/core/components/icons/FilePlusIcon';
import { FolderFilledIcon } from '@/core/components/icons/FolderFilledIcon';
import { TrashIcon } from '@/core/components/icons/TrashIcon';
import { Button } from '@/core/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/core/components/ui/Dialog';
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormMessage,
} from '@/core/components/ui/Form';
import Loading from '@/core/components/ui/Loading';
import { NavBack } from '@/core/components/ui/NavBack';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/Select';
import Taskbar from '@/core/components/ui/Taskbar';
import TaskbarPrompt from '@/core/components/ui/TaskbarPrompt';
import { useSessionClient } from '@/core/features/auth/hooks/useSessionClient';
import FolderList from '@/core/features/note/components/FolderList';
import NoteList from '@/core/features/note/components/NoteList';
import { FolderColorKey, folderColors } from '@/core/features/note/maps';
import {
  updateFolderSchema,
  UpdateFolderSchema,
} from '@/core/features/note/schemas';
import { useNoteStore } from '@/core/features/note/store';
import { FolderItem } from '@/core/features/note/types';
import { Theme } from '@/core/types';
import { cn, getColorByKey } from '@/core/utils';

export default function FolderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const { userId } = useSessionClient();

  const creatingNote = useNoteStore((s) => s.creatingNote);
  const removingFolder = useNoteStore((s) => s.removingFolder);
  const folders = useNoteStore((s) => s.folders);
  const folderNotes = useNoteStore((s) => s.folderNotes);
  const fetchingFolderNotes = useNoteStore((s) => s.fetchingFolderNotes);
  const updatingFolder = useNoteStore((s) => s.updatingFolder);
  const createNote = useNoteStore((s) => s.createNote);
  const fetchFolderNotes = useNoteStore((s) => s.fetchFolderNotes);
  const removeFolder = useNoteStore((s) => s.removeFolder);
  const updateFolder = useNoteStore((s) => s.updateFolder);

  const [folderData, setFolderData] = useState<FolderItem | null>(null);
  const [removeFolderPrompt, setRemoveFolderPrompt] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<UpdateFolderSchema>({
    resolver: zodResolver(updateFolderSchema),
    defaultValues: {
      title: '',
      color: '',
    },
  });

  const folderId = useMemo(() => {
    const pathArr = pathname.split('/');
    return pathArr.includes('folder') ? pathArr[2] : null;
  }, [pathname]);

  const folderColor: string | null = useMemo(() => {
    if (!folderData?.color) return null;
    return getColorByKey(folderData.color, resolvedTheme as Theme) ?? null;
  }, [folderData?.color, resolvedTheme]);

  const handleCreateNote = async () => {
    if (!folderId || !userId) return;

    const res = await createNote({ folderId, userId });
    if (!res.success) {
      toast(res.error.message ?? 'Unable to create note');
      return;
    }

    if (res.data?.id) {
      router.push(`/note/${res.data.id}?status=new`);
    }
  };

  const handleRemoveFolder = () => {
    setRemoveFolderPrompt(true);
  };

  const handleRemoveFolderAccept = async () => {
    if (!folderId || !userId) return;

    const res = await removeFolder({ folderId, userId });
    if (!res.success) {
      toast(res.error.message ?? 'Unable to delete folder');
      setRemoveFolderPrompt(false);
      return;
    }

    setRemoveFolderPrompt(false);
    router.replace('/');
  };

  const handleRemoveFolderDecline = () => {
    setRemoveFolderPrompt(false);
  };

  const onSubmit = async (values: UpdateFolderSchema) => {
    if (!folderData || !folderId || !userId) return;

    const res = await updateFolder({
      color: values.color as FolderColorKey,
      folderId,
      title: values.title,
      userId,
    });

    if (!res.success) {
      toast(res.error.message ?? 'Unable to update folder');
    }

    setFolderData({
      ...folderData,
      color: values.color as FolderColorKey,
      title: values.title,
    });
    setIsDialogOpen(false);
  };

  // Initialization: retrieve folder data from the folders array
  useEffect(() => {
    if (!folderId || !userId) return;

    (async () => {
      const index = folders.findIndex((f) => f.id === folderId);
      if (index === -1) return;
      setFolderData(folders[index]);

      // Fetch folder notes
      const success = await fetchFolderNotes({ folderId, userId });

      if (!success) {
        toast('Unable to retrieve notes');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, userId, fetchFolderNotes]);

  // Reset form when folderData changes
  useEffect(() => {
    if (!folderData) return;

    form.reset({
      title: folderData.title,
      color: folderData.color,
    });
  }, [folderData, form]);

  const createNoteBtn = (
    <div className="my-6 flex-center">
      <Button
        onClick={handleCreateNote}
        variant="outline"
        className="fade px-6"
      >
        Create a note
      </Button>
    </div>
  );

  return (
    <div className="fade size-full flex flex-col px-4">
      <div className="sticky z-10 top-0 min-h-20 flex items-center gap-4 bg-background trans-c">
        <div className="flex flex-1 items-center gap-4">
          <NavBack route="/" />

          {folderData ? (
            <>
              <div
                className="relative -mr-1.5"
                style={{ color: folderColor ?? 'inherit' }}
              >
                <FolderFilledIcon />
              </div>

              <div
                onClick={() => setIsDialogOpen(true)}
                className="text-xl font-bold cursor-pointer"
                title="Click to edit"
              >
                {folderData.title}
              </div>
            </>
          ) : null}
        </div>

        <Taskbar loading={creatingNote}>
          {removeFolderPrompt ? (
            <TaskbarPrompt
              onAccept={handleRemoveFolderAccept}
              onDecline={handleRemoveFolderDecline}
              loading={removingFolder}
            />
          ) : (
            <>
              <div
                onClick={handleCreateNote}
                className="ml-1 text-accent cursor-pointer trans-c"
                title="Create a note"
              >
                <FilePlusIcon />
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <div className="ml-1 icon--action" title="Edit folder">
                    <EditIcon />
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Folder</DialogTitle>
                    <DialogDescription>
                      Update the folder title and color
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className={cn('w-full', updatingFolder && 'inactive')}
                    >
                      <div className="mb-6 flex gap-2">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <FormInput className="h-9" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-30">
                                    <SelectValue placeholder="Color" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    {folderColors.map(([key]) => {
                                      const color = getColorByKey(
                                        key,
                                        resolvedTheme as Theme
                                      );
                                      return (
                                        <SelectItem key={key} value={key}>
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: color }}
                                          />
                                          {key.charAt(0).toUpperCase() +
                                            key.slice(1)}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <DialogFooter>
                        <Button
                          type="submit"
                          loading={updatingFolder}
                          className="px-6"
                        >
                          Save changes
                        </Button>
                        <DialogClose asChild>
                          <Button variant="outline" className="px-6">
                            Cancel
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <div
                onClick={handleRemoveFolder}
                className="ml-1 icon--action"
                title="Delete folder"
              >
                <TrashIcon />
              </div>
            </>
          )}
        </Taskbar>
      </div>

      <div className="flex-1">
        {fetchingFolderNotes ? (
          <div className="mt-20 flex-center">
            <Loading delay={2000} />
          </div>
        ) : folderNotes.length ? (
          <NoteList folders={folders} notes={folderNotes} />
        ) : (
          createNoteBtn
        )}
      </div>
      <div className="flex-center">
        <FolderList small activeFolderId={folderId ?? undefined} />
      </div>
    </div>
  );
}
