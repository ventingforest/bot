import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    tag: string;
    id: string;
    isolation: {
        isolated: boolean;
        roles: Array<string>;
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
        isolation: {
            isolated: Boolean,
            roles: Array,
        },
    },
    {
        versionKey: false,
    }
);

export default mongoose.model<IUser>('users', userSchema);
