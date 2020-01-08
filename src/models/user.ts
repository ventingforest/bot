import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    tag: string;
    id: string;
    isolated: boolean;
    roles: string[];
    private: {
        requested: boolean;
		id: string;
		reason: string;
    };
}

const userSchema = new mongoose.Schema(
	{
		tag: {
			type: String,
			required: true,
		},
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
		},
	},
	{
		versionKey: false,
	},
);

export default mongoose.model<IUser>('users', userSchema);
