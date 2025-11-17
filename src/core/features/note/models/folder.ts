import { Schema, model, models } from 'mongoose';

import { Folder } from '@/core/features/note/types';

const folderSchema = new Schema<Folder>(
  {
    color: { type: String },
    tags: [{ type: String }],
    timestamp: { type: Number, required: true },
    title: { type: String, required: true },
    userId: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

const FolderModel = models.Folder || model('Folder', folderSchema);

export default FolderModel;
