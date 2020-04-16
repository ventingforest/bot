import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    id: string; // the id of the user
    isolated: boolean; // whether the user is isolated or not
    roles: string[]; // storage for the user's roles when isolating
    private: {
      requested: boolean; // whether the user has a pending private venting session
      id: string; // the id of the private venting session
      reason: string; // the reason why the user wanted the session
      requestedAt: string; // when the user requested the session
    };
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
			requestedAt: String,
		},
	},
	{
		versionKey: false,
	},
);

export default mongoose.model<IUser>('users', userSchema);
