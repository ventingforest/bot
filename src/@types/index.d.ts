import * as Discord from 'discord.js';
import * as winston from 'winston';
import PastebinAPI from 'pastebin-js';
import { IConstants } from '../Constants';
import { IUser } from '../models/user';
import mongoose = require('mongoose');

declare module 'discord-akairo' {
  interface AkairoClient {
    isProduction: boolean;
    logger: Logger;
    server: Discord.Guild;
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    inhibitorHandler: InhibitorHandler;
    botBanner: boolean;
    pastebin: PastebinAPI;
    talkedRecently: Set<string>;
    constants: IConstants;

    xpFor(x: number): number;
    rankInServer(id: string): Promise<number>;
    isUser(role: StaffRole, member: Discord.GuildMember): boolean;
    userDoc(id: string): Promise<IUser>
    saveDoc(doc: mongoose.Document): void;
    formatNumber(x: number): string;
    joinPosition(id: string): number;
    sendDM(user: Discord.User, content: MessageContent): Promise<Discord.Message>;
    emojiMessage(emoji: string, msg: string, channel: Channels): Promise<Discord.Message>;
  }

  interface CommandOptions {
    usage?: string;
    examples?: string[];
    allowGeneral?: boolean;
  }

  interface Command {
    usage?: string;
    examples?: string[];
    allowGeneral?: boolean;
  }
}

declare global {
  type MessageContent = Discord.APIMessageContentResolvable | (Discord.MessageOptions & { split?: false }) | Discord.MessageAdditions;
  type Channels = Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel;
  type StaffRole = 'Support' | 'Engagement' | 'Moderation' | 'Admin' | 'Staff';

    interface Logger extends winston.Logger {
      command: winston.LeveledLogMethod;
      db: winston.LeveledLogMethod;
    }

    interface Suggestion {
      id: string; // the id of the suggestion
      suggestion: string; // the suggestion
      messageID: string; // the id of the message
    }

    interface LevelReward {
      level: number; // the level that the role is associated with
      role: Discord.Role; // the role
      name: string; // the name of the role
    }

    interface UserBalance {
      cash: number; // the amount of cash the user has
      bank: number; // the amount of money in the bank the user has
      total: number; // the total amount of money that the user has
    }
}
