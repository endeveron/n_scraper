import z from 'zod';

const title = z.string().min(1, { message: 'Title is required' });
const content = z.string();

export const updateFolderSchema = z.object({
  title,
  color: z.string(),
});

export const updateNoteTitleSchema = z.object({
  title,
});
export const updateNoteContentSchema = z.object({
  content,
});

export const updateNoteSchema = z.object({
  title,
  content,
});

export type UpdateFolderSchema = z.infer<typeof updateFolderSchema>;
export type UpdateNoteTitleSchema = z.infer<typeof updateNoteTitleSchema>;
export type UpdateNoteContentSchema = z.infer<typeof updateNoteContentSchema>;
export type UpdateNoteSchema = z.infer<typeof updateNoteSchema>;
