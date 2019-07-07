import { Client, Collection, Message } from "discord.js";
import { IUser } from './models/user';
import { Model } from "mongoose";

declare global {
    type BotConfig = {
        // config
        prefix: string;
        restricted: RegExp;
        isolatedRole: string;
    
        // authentication
        token: string;
    }

    type CommandConfig = {
        name: string;
        description?: string;
        admin?: boolean;
        mod?: boolean;
        dm?: boolean;
        args?: boolean;
        usage?: string;
    }

    interface Command {
        run(client: BotClient, msg: Message, args: Array<string>): void;
        config: CommandConfig;
        [x: string]: any;
    }

    interface BotClient extends Client {
        config: BotConfig;
        commands: Collection<string, Command>;
        userDoc: Model<IUser>;
    }
}