import * as Discord from 'discord.js';
import Client from '../Client';

declare global {
    type Module = 'Core' | 'Fun' | 'Music' | 'Admin' | 'Mod' | 'FK' | 'Venting';
    type StaffRole = 'fk' | 'mod' | 'admin';
    type EmbedOptions = {
        colour: string; // the colour of the embed. can be any hex.
        timestamp?: boolean; // whether the timestamp appears on the embed - defaults to false
        thumbnail?: boolean; // whether the thumbnail is automatically set to the server's icon - defaults to true
    }

    interface Command {
      run(taiga: Client, msg: Discord.Message, args: string[]): void; // method containing the command's code
      name: string; // the name of the command
      description?: string; // a description of what the command does
      module: Module; // the module the command belongs in
      aliases?: string[]; // other names for the command
      permissions?: Discord.PermissionResolvable[]; // required permissions to run the command
      args?: boolean; // whether the command requires arguments
      usage: string; // shows how the command is supposed to be used, listing all arguments
      examples: string[]; // examples of how the command should be run - usage but with dummy arguments filled in
      allowGeneral?: boolean; // whether the command can be run in general
    }
}
