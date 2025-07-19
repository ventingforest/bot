import {
  ApplicationCommandRegistry,
  Args,
  Command as SapphireCommand,
} from "@sapphire/framework";
import { ApplicationCommandType, type SlashCommandBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { guildId } from "$lib/data";

type SlashCommandOptions = (builder: SlashCommandBuilder) => void;

export function Config(options: Command.Options) {
  return ApplyOptions<Command.Options>(options);
}

export class Command extends SapphireCommand<Args, Command.Options> {
  override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    const {
      options: { slash, contextMenu },
    } = this;
    const guildIds = [guildId];

    if (slash) {
      registry.registerChatInputCommand(
        builder => {
          const command = builder
            .setName(slash.name)
            .setDescription(slash.description);

          if (slash.options) {
            slash.options(command);
          }
        },
        { idHints: slash.idHints, guildIds },
      );
    }

    if (contextMenu) {
      registry.registerContextMenuCommand(
        builder => {
          builder
            .setName(contextMenu.name)
            .setType(ApplicationCommandType.User);
        },
        { idHints: contextMenu.idHints, guildIds },
      );
    }
  }
}

export namespace Command {
  interface SubOptions {
    name: string;
    idHints?: string[];
  }

  export type Options = SapphireCommand.Options & {
    slash?: SubOptions & {
      description: string;
      options?: SlashCommandOptions;
    };
    contextMenu?: SubOptions;
  };
}
