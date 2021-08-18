import * as Discord from 'discord.js';
import * as winston from 'winston';
import { PastebinClient } from '@catte_/pastebin.js';
import TVFConstants from '../Constants';
import TVFRoles from '../TVFRoles';
import TVFChannels from '../TVFChannels';
import TVFSocial from '../struct/TVFSocial';
import TVFUtils from '../struct/TVFUtils';
import { PrismaClient } from '@prisma/client';

declare module 'discord-akairo' {
    interface AkairoClient {
        production: boolean;
        logger: Logger;
        server: Discord.Guild;
        commands: CommandHandler;
        listenerHandler: ListenerHandler;
        inhibitors: InhibitorHandler;
        pastebin: PastebinClient;
        constants: typeof TVFConstants;
        tvfRoles: ReturnType<typeof TVFRoles>;
        tvfChannels: ReturnType<typeof TVFChannels>;
        db: PrismaClient;
        social: TVFSocial;
        utils: TVFUtils;
        prefix: string;
        botBanner: boolean;

        userLogCompiler(u: Discord.User): string;
    }

    interface Command {
        usage?: string;
        examples?: string[];
        allowGeneral?: boolean;
    }
}

declare global {
    type MessageContent =
        | Discord.APIMessageContentResolvable
        | (Discord.MessageOptions & { split?: false })
        | Discord.MessageAdditions;
    type Channels =
        | Discord.TextChannel
        | Discord.DMChannel
        | Discord.NewsChannel;
    type StaffRole = 'Support' | 'Moderation' | 'Admin' | 'Staff';
    type LogType = 'user' | 'guild' | 'channel';
    type Optional<T> = {
        [P in keyof T]?: T[P];
    };

    interface Logger extends winston.Logger {
        command: winston.LeveledLogMethod;
        db: winston.LeveledLogMethod;
    }

    interface LevelReward {
        level: number;
        roleID: string;
        name: string;
    }
}
