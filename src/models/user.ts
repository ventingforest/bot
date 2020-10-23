import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    id: string; // the id of the user
    inServer: boolean; // whether the user is still in the server
    pda: boolean; // whether the user is comfortable with PDA and compliments
    roles: string[]; // storage for the user's roles when isolating or private venting
    private: {
      requested: boolean; // whether the user has a pending private venting session
      id: string; // the id of the private venting session
      reason: string; // the reason why the user wanted the session
      requestedAt: Date; // when the user requested the session
      startedAt: Date; // when a member of staff started the session
      channels: {
        text: string; // the id of the text channel
        vc: string; // the id of the vc
      };
    };
    isolation: {
      isolated: boolean; // whether the user is isolated or not
      reason: string; // the reason for isolation
      isolatedAt: Date; // when the user was isolated
      isolatedBy: string; // the id of the user who isolated them
      channels: {
        text: string; // the id of the text channel
        vc: string; // the id of the vc
      }
    }
    suggestions: Suggestion[];
}

const userSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
		},
    inServer: {
      type: Boolean,
      default: true,
    },
    pda: {
      type: Boolean,
      default: true,
    },
		roles: Array,
		private: {
			requested: Boolean,
			id: String,
			reason: String,
			requestedAt: Date,
      startedAt: Date,
      channels: {
        text: String,
        vc: String,
      },
    },
    isolation: {
      isolated: Boolean,
      reason: String,
      isolatedAt: Date,
      isolatedBy: String,
      channels: {
        text: String,
        vc: String,
      },
    },
    suggestions: {
      type: Array,
      default: []
    }
	},
	{
		versionKey: false,
	},
);

export default mongoose.model<IUser>('users', userSchema);
