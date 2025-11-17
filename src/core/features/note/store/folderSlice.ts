import { StateCreator } from 'zustand';

import {
  deleteFolder,
  getInitData,
  patchFolder,
  postFolder,
} from '@/core/features/note/actions';
import { FolderColorKey } from '@/core/features/note/maps';
import { NoteSlice } from '@/core/features/note/store/noteSlice';
import { FolderItem } from '@/core/features/note/types';
import { updateFolders } from '@/core/features/note/utils';
import { ServerActionResult } from '@/core/types';

export interface FolderSlice {
  creatingFolder: boolean;
  fetchingFolders: boolean;
  folders: FolderItem[];
  removingFolder: boolean;
  updatingFolder: boolean;

  createFolder: (args: {
    userId: string;
  }) => Promise<ServerActionResult<{ id: string }>>;
  updateFolder: (args: {
    folderId: string;
    userId: string;
    color?: FolderColorKey;
    title?: string;
  }) => Promise<ServerActionResult>;
  removeFolder: (args: {
    folderId: string;
    userId: string;
  }) => Promise<ServerActionResult>;
  fetchInitData: (args: { userId: string }) => Promise<ServerActionResult>;
}

export const folderSlice: StateCreator<
  FolderSlice & NoteSlice,
  [],
  [],
  FolderSlice
> = (set, get) => ({
  creatingFolder: false,
  fetchingFolders: false,
  folders: [],
  removingFolder: false,
  updatingFolder: false,

  createFolder: async ({ userId }) => {
    if (!userId) {
      return { success: false, error: { message: 'Unauthorized' } };
    }

    set({ creatingFolder: true });
    const res = await postFolder({ userId });
    if (res.success && res.data?.id) {
      // Add the folder to the folders array
      set({ folders: [...get().folders, res.data] });
    }
    set({ creatingFolder: false });
    return res;
  },

  updateFolder: async ({ color, folderId, title, userId }) => {
    if (!userId) {
      return { success: false, error: { message: 'Unauthorized' } };
    }
    if (!folderId) {
      return { success: false, error: { message: 'Missing folder id' } };
    }
    if (!color && !title) {
      return { success: false, error: { message: 'Missing required data' } };
    }

    set({ updatingFolder: true });
    const res = await patchFolder({ color, folderId, title });
    if (res.success && res.data?.id) {
      // Update the folder in the folders array
      const updFolders = updateFolders({
        folders: get().folders,
        folder: res.data,
      });
      set({ folders: updFolders });
    }
    set({ updatingFolder: false });
    return res;
  },

  removeFolder: async ({ folderId, userId }) => {
    if (!userId) {
      return { success: false, error: { message: 'Unauthorized' } };
    }
    if (!folderId) {
      return { success: false, error: { message: 'Missing folder id' } };
    }

    set({ removingFolder: true });
    const res = await deleteFolder({ folderId });
    if (res.success) {
      // Remove the folder from the folders array
      set({ folders: [...get().folders].filter((f) => f.id !== folderId) });
    }
    set({ removingFolder: false });
    return res;
  },

  fetchInitData: async ({ userId }) => {
    if (!userId) {
      return { success: false, error: { message: 'Unauthorized' } };
    }

    set({ fetchingFolders: true });
    const res = await getInitData({ userId });
    if (res.success && res.data) {
      set({ favoriteNotes: res.data.favoriteNotes });
      set({ folders: res.data.folders });
    }

    set({ fetchingFolders: false });
    return res;
  },
});
