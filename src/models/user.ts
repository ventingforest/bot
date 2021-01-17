import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    id: string; // the id of the user
    level: number; // the level of a user
    xp: number; // the total xp of a user
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
    suggestions: Suggestion[]; // a list of suggestions
    modlogs: Modlog[]; // a list of modlogs
    stickyRoles: string[]; // a list of roles when the user leaves
}

const userSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    xp: {
      type: Number,
      default: 0,
    },
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
    },
    stickyRoles: {
      type: Array,
      default: []
    },
	},
	{
		versionKey: false,
	},
);

export default mongoose.model<IUser>('users', userSchema);
