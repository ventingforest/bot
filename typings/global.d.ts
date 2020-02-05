import * as Discord from 'discord.js';
import Client from '../src/structures/TVFClient';

declare global {
    type Module = 'Core' | 'Fun' | 'Music' | 'Admin' | 'Mod' | 'FK';

    type CommandConfig = {
        name: string; // the name of the command
        description?: string; // a description of what the command does
        module: Module; // the module that the command is in
        args?: boolean; // whether the command requires arguments
        usage?: string; // an example of how to use the command
        dm?: boolean; // whether the command responds in dms
        allowGeneral: boolean; // whether the command can be run in the general channels
    };

    interface Command {
        run(client: Client, msg: Discord.Message, args: string[]): void;
        config: CommandConfig;
    }
}
