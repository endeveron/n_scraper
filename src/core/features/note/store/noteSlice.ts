import { StateCreator } from 'zustand';

import {
  deleteNote,
  getFolderNotes,
  getNote,
  getNoteDecrypt,
  patchNote,
  patchNoteDecrypt,
  patchNoteEncrypt,
  patchNoteFavorite,
  patchNoteMove,
  postNote,
} from '@/core/features/note/actions';
import { FolderSlice } from '@/core/features/note/store/folderSlice';
import { NoteItem } from '@/core/features/note/types';
import { updateFolderNotes } from '@/core/features/note/utils';
import { ServerActionResult } from '@/core/types';

export interface NoteSlice {
  creatingNote: boolean;
  fetchingFolderNotes: boolean;
  favoriteNotes: NoteItem[];
  folderNotes: NoteItem[];
  movingNote: boolean;
  notes: NoteItem[];
  removingNote: boolean;
  updatingNote: boolean;
  createNote: (args: {
    folderId: string;
    userId: string;
  }) => Promise<ServerActionResult<NoteItem>>;
  decryptNote: (args: {
    noteId: string;
  }) => Promise<ServerActionResult<string>>;
  decryptNoteInDB: (args: { noteId: string }) => Promise<ServerActionResult>;
  encryptNote: (args: {
    noteId: string;
    content: string;
    title?: string;
  }) => Promise<ServerActionResult>;
  fetchFolderNotes: (args: {
    folderId: string;
    userId: string;
  }) => Promise<boolean>;
  fetchNote: (args: {
    noteId: string;
  }) => Promise<ServerActionResult<NoteItem>>;
  moveNote: (args: {
    noteId: string;
    folderId: string;
  }) => Promise<ServerActionResult>;
  removeNote: (args: { noteId: string }) => Promise<ServerActionResult>;
  updateNote: (args: {
    noteId: string;
    content?: string;
    title?: string;
  }) => Promise<ServerActionResult>;
  updateNoteFavorite: (args: {
    noteId: string;
    favorite: boolean;
  }) => Promise<ServerActionResult>;
  updateFavoriteNotes: (args: { note: NoteItem }) => void;
}

export const noteSlice: StateCreator<
  FolderSlice & NoteSlice,
  [],
  [],
  NoteSlice
> = (set, get) => ({
  creatingNote: false,
  fetchingFolderNotes: false,
  favoriteNotes: [],
  folderNotes: [],
  movingNote: false,
  notes: [],
  removingNote: false,
  updatingNote: false,

  createNote: async ({ folderId, userId }) => {
    if (!userId) {
      return { success: false, error: { message: 'Unauthorized' } };
    }
    if (!folderId) {
      return { success: false, error: { message: 'Missing folder id' } };
    }

    set({ creatingNote: true });
    const res = await postNote({ folderId, userId });
    if (res.success && res.data?.id) {
      // Add the note to the folderNotes array in the local state
      set({ folderNotes: [...get().folderNotes, res.data] });
    }
    set({ creatingNote: false });
    return res;
  },

  decryptNote: async ({ noteId }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }

    set({ updatingNote: true });
    const res = await getNoteDecrypt({ noteId });
    // No need to refresh folder notes
    set({ updatingNote: false });
    return res;
  },

  decryptNoteInDB: async ({ noteId }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }

    set({ updatingNote: true });
    const res = await patchNoteDecrypt({ noteId });
    if (res.success && res.data?.content) {
      // Update the note in the folderNotes array
      set({
        folderNotes: updateFolderNotes({
          folderNotes: get().folderNotes,
          note: res.data,
        }),
      });
    }
    set({ updatingNote: false });
    return res;
  },

  encryptNote: async ({ noteId, content, title }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }
    if (!content) {
      return { success: false, error: { message: 'Missing required data' } };
    }

    set({ updatingNote: true });
    const res = await patchNoteEncrypt({ noteId, content, title });
    if (res.success && res.data?.content) {
      // Update the note in the folderNotes array
      set({
        folderNotes: updateFolderNotes({
          folderNotes: get().folderNotes,
          note: res.data,
        }),
      });
    }
    set({ updatingNote: false });
    return res;
  },

  fetchFolderNotes: async ({ folderId, userId }) => {
    if (!folderId || !userId) return false;

    set({ fetchingFolderNotes: true });
    const res = await getFolderNotes({ folderId, userId });
    if (res.success && res.data) {
      set({
        folderNotes: res.data,
        fetchingFolderNotes: false,
      });
      return true;
    }
    set({ fetchingFolderNotes: false });
    return false;
  },

  fetchNote: async ({ noteId }) => {
    if (!noteId)
      return {
        success: false,
        error: { message: 'Missing note id' },
      };

    const res = await getNote({ noteId });
    return res;
  },

  moveNote: async ({ folderId, noteId }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }

    set({ movingNote: true });
    const res = await patchNoteMove({ folderId, noteId });
    if (res.success) {
      // Remove the note from the folderNotes array
      const updFolderNotes = [...get().folderNotes].filter(
        (n) => n.id !== noteId
      );
      set({ folderNotes: updFolderNotes });
    }
    set({ movingNote: false });
    return res;
  },

  removeNote: async ({ noteId }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }

    set({ removingNote: true });
    const res = await deleteNote({ noteId });
    if (res.success) {
      // Remove the note from the folderNotes array
      const updFolderNotes = [...get().folderNotes].filter(
        (n) => n.id !== noteId
      );
      set({ folderNotes: updFolderNotes });
    }
    set({ removingNote: false });
    return res;
  },

  updateNote: async ({ noteId, content, title }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }
    if (!content && !title) {
      return { success: false, error: { message: 'Missing required data' } };
    }

    set({ updatingNote: true });
    const res = await patchNote({ noteId, content, title });
    if (res.success && res.data?.id) {
      // Update the note in the folderNotes array
      set({
        folderNotes: updateFolderNotes({
          folderNotes: get().folderNotes,
          note: res.data,
        }),
      });
    }
    set({ updatingNote: false });
    return res;
  },

  updateNoteFavorite: async ({ noteId, favorite }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }
    if (typeof favorite !== 'boolean') {
      return { success: false, error: { message: 'Missing required data' } };
    }

    set({ updatingNote: true });
    const res = await patchNoteFavorite({ noteId, favorite });
    if (res.success && res.data?.id) {
      // Update the note in the folderNotes array
      set({
        folderNotes: updateFolderNotes({
          folderNotes: get().folderNotes,
          note: res.data,
        }),
      });

      let updFavoriteNotes: NoteItem[];

      // Update favorite notes array
      updFavoriteNotes = [...get().favoriteNotes];
      const indexFav = updFavoriteNotes.findIndex((n) => n.id === noteId);

      if (favorite && indexFav === -1) {
        // Add the note to the favorites array
        updFavoriteNotes.push(res.data);
        updFavoriteNotes.sort((a, b) => a.title.localeCompare(b.title));
        set({ favoriteNotes: updFavoriteNotes });
      }

      if (!favorite && indexFav !== -1) {
        // Remove the note from the favorites array
        updFavoriteNotes = [...get().folderNotes].filter(
          (n) => n.id !== noteId
        );
        set({ favoriteNotes: updFavoriteNotes });
      }
    }
    set({ updatingNote: false });
    return res;
  },

  updateFavoriteNotes: ({ note }) => {
    const updFavoriteNotes = [...get().favoriteNotes];
    const index = updFavoriteNotes.findIndex((n) => n.id === note.id);
    if (index === -1) return;
    updFavoriteNotes[index] = note;
    set({ favoriteNotes: updFavoriteNotes });
  },
});
