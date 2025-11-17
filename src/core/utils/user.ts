import mongoose from 'mongoose';

export const configureUser = ({ email }: { email: string }) => {
  const _id = new mongoose.Types.ObjectId();

  // Properties that will be added by mongoose:
  // - emailConfirmed: false,
  // - role: 'user'

  return {
    _id,
    id: _id.toString(),
    email,
  };
};
