import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    id: string;
    isolated: boolean;
    roles: string[];
    private: {
        requested: boolean;
		id: string;
		reason: string;
		requestedAt: string;
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
