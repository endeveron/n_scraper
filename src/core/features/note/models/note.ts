import { Schema, model, models } from 'mongoose';

import { Note } from '@/core/features/note/types';

const noteSchema = new Schema<Note>(
  {
    content: { type: String },
    folderId: { type: String, required: true },
    tags: [{ type: String }],
    timestamp: { type: Number, required: true },
    title: { type: String, required: true },
    userId: { type: String, required: true },
    encrypted: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
  },
  {
    versionKey: false,
  }
);

const NoteModel = models.Note || model('Note', noteSchema);

export default NoteModel;
