import {
  ApplicationCommandRegistry,
  Args,
  Command as SapphireCommand,
} from "@sapphire/framework";
import type { SlashCommandBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { guildId } from "$lib/data";

type SlashCommandOptions = (builder: SlashCommandBuilder) => void;

export function Config(
  options: Omit<Command.Options, "slashOptions">,
  slashOptions: SlashCommandOptions = () => {},
) {
  return ApplyOptions<Command.Options>({ ...options, slashOptions });
}

export class ChatInput extends SapphireCommand<Args, Command.Options> {
  override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    const { options } = this;
    registry.registerChatInputCommand(
      builder => {
        const command = builder
          .setName(this.name)
          .setDescription(this.description);
        options.slashOptions(command);
      },
      { idHints: options.idHints, guildIds: [guildId] },
    );
  }
}

export namespace Command {
  export type Options = SapphireCommand.Options & {
    name: string;
    description: string;
    idHints?: string[];
    slashOptions: SlashCommandOptions;
  };
}
