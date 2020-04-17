import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    id: string; // the id of the user
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
    stats: {
      privatesTaken: number; // the amount of private venting sessions the user has taken
    }
}

const userSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
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
    stats: {
      privatesTaken: Number,
    },
	},
	{
		versionKey: false,
	},
);

export default mongoose.model<IUser>('users', userSchema);
