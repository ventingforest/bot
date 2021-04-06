import * as Discord from 'discord.js';
import Client from '..';

declare global {
    type StaffRole = 'Support' | 'Engagement' | 'Moderation' | 'Admin';
    type EmbedOptions = {
      colour?: string, // input hexadecimal
      timestamp?: boolean, // if false, the timestamp is omitted
      thumbnail?: boolean, // if false, the thumbnail is omitted
      author?: boolean, // if true, the author gets automatically set to the author of the message
    }

    interface Command {
      run(tvf: Client, msg: Discord.Message, args: string[], other: { prefix: string }): void; // method containing the command's code
      name: string; // the name of the command
      description?: string; // a description of what the command does
      category?: string; // the category the command belongs in - automatically defined
      aliases?: string[]; // other names for the command
      permissions?: Discord.PermissionResolvable[]; // required permissions to run the command
      args?: boolean; // whether the command requires arguments
      usage?: string; // shows how the command is supposed to be used, listing all arguments
      staffAccess?: StaffRole[]; // which staff roles can use the command
      allowGeneral?: boolean; // whether the command can be run in general
    }

    interface BotConfig {
      botbanner: boolean; // if true, all new bots are banned from the server
      levelling: boolean; // if true, members will gain xp and level up
    }

    interface Suggestion {
      id: string; // the id of the suggestion
      suggestion: string; // the suggestion
      messageID: string; // the id of the message
    }

    type ModlogType = 'warn' | 'mute' | 'kick' | 'ban';

    interface Modlog {
      type: ModlogType; // the type of the log
      issuer: string; // the id of the person who issued the log
      issuedAt: Date; // when the modlog was issued
    }

    interface UserBalance {
      cash: number; // the amount of cash the user has
      bank: number; // the amount of money in the bank the user has
      total: number; // the total amount of money that the user has
    }

    interface LevelReward {
      level: number; // the level that the role is associated with
      role: Discord.Role; // the role
      name: string; // the name of the role
    }
}
