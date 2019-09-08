import * as Discord from 'discord.js';
import Client from '../src/structures/TVFClient';

declare global {
    type Module = 'Core' | 'Fun' | 'Admin' | 'Mod' | 'FK';

    type CommandConfig = {
        name: string;
        description?: string;
        module: Module;
        args?: boolean;
        usage?: string;
        dm?: boolean;
    };

    interface Command {
        run(client: Client, msg: Discord.Message, args: string[]): void;
        config: CommandConfig;
    }
}
