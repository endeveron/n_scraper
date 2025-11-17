import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import {
  folderSlice,
  FolderSlice,
} from '@/core/features/note/store/folderSlice';
import { noteSlice, NoteSlice } from '@/core/features/note/store/noteSlice';

type Store = FolderSlice &
  NoteSlice &
  FolderSlice & {
    reset: () => void;
  };

const initialState = {
  fetchingFolder: false,
  fetchingFolders: false,
  folder: null,
  folders: [],
  fetchingFolderNotes: false,
  folderNotes: [],
  notes: [],
};

export const useNoteStore = create<Store>()(
  devtools(
    persist(
      (...a) => ({
        ...folderSlice(...a),
        ...noteSlice(...a),
        reset: () => a[0](initialState),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          favoriteNotes: state.favoriteNotes,
          folders: state.folders,
          folderNotes: state.folderNotes,
        }),
      }
    )
  )
);
