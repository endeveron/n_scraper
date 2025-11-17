import {
  FolderDB,
  FolderItem,
  NoteDB,
  NoteItem,
} from '@/core/features/note/types';

export const parseFolderItem = (folderDoc: FolderDB): FolderItem => ({
  color: folderDoc.color,
  id: folderDoc._id.toString(),
  tags: folderDoc.tags,
  timestamp: folderDoc.timestamp,
  title: folderDoc.title,
});

export const parseNoteItem = (noteDoc: NoteDB): NoteItem => ({
  content: noteDoc.content,
  favorite: noteDoc.favorite,
  folderId: noteDoc.folderId,
  id: noteDoc._id.toString(),
  tags: noteDoc.tags,
  encrypted: noteDoc.encrypted,
  timestamp: noteDoc.timestamp,
  title: noteDoc.title,
});

export const updateFolders = ({
  folders,
  folder,
}: {
  folders: FolderItem[];
  folder: FolderItem;
}) => {
  const updFolders = [...folders];
  const index = updFolders.findIndex((f) => f.id === folder.id);
  updFolders[index] = folder;
  return updFolders;
};

export const updateFolderNotes = ({
  folderNotes,
  note,
}: {
  folderNotes: NoteItem[];
  note: NoteItem;
}) => {
  const updFolderNotes = [...folderNotes];
  const index = updFolderNotes.findIndex((n) => n.id === note.id);
  updFolderNotes[index] = note;
  return updFolderNotes;
};
