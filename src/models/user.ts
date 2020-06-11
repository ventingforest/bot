import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    id: string; // the id of the user
    approved: boolean; // whether the user has been approved
    pda: boolean; // whether the user is comfortable with PDA and compliments
    isolated: boolean; // whether the user is isolated or not
    roles: string[]; // storage for the user's roles when isolating or private venting
    private: {
      requested: boolean; // whether the user has a pending private venting session
      id: string; // the id of the private venting session
      reason: string; // the reason why the user wanted the session
      requestedAt: Date; // when the user requested the session
      startedAt: Date; // when a member of staff started the session
      takenBy: string; // the member of staff that started the session
    };
}

const userSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
		},
    approved: {
      type: Boolean,
      default: false,
    },
    pda: {
      type: Boolean,
      required: true,
      default: true,
    },
		isolated: Boolean,
		roles: Array,
		private: {
			requested: Boolean,
			id: String,
			reason: String,
			requestedAt: Date,
      startedAt: Date,
      takenBy: String,
		},
	},
	{
		versionKey: false,
	},
);

export default mongoose.model<IUser>('users', userSchema);
