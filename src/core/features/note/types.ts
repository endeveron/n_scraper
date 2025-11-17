import { ObjectId } from 'mongoose';

import { FolderColorKey } from '@/core/features/note/maps';

export type Folder = {
  color: FolderColorKey;
  tags: string[];
  timestamp: number;
  title: string;
  userId: string;
};
export type FolderDB = Folder & { _id: ObjectId };
export type FolderItem = Omit<Folder, 'userId'> & { id: string };

export type Note = {
  content: string;
  encrypted: boolean;
  favorite: boolean;
  folderId: string;
  tags: string[];
  timestamp: number;
  title: string;
  userId: string;
  decrypted?: boolean;
};
export type NoteDB = Note & { _id: ObjectId };
export type NoteItem = Omit<Note, 'userId'> & { id: string };

export type TargetFolderData = { folderId: string; folderTitle: string };
