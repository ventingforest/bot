import {
  ApplicationCommandRegistry,
  Args,
  Command as SapphireCommand,
  type ChatInputCommand as SapphireChatInputCommand,
} from "@sapphire/framework";
import type { ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

export function Config(options: Command.Options) {
  return ApplyOptions<Command.Options>(options);
}

export class ChatInput extends SapphireCommand<Args, Command.Options> {
  override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      builder => builder.setName(this.name).setDescription(this.description),
      { idHints: this.options.idHints },
    );
  }
}

export namespace Command {
  export type Options = SapphireCommand.Options & {
    idHints?: string[];
  };
}

export namespace ChatInput {
  export type Interaction = ChatInputCommandInteraction;
  export type RunContext = SapphireChatInputCommand.RunContext;
}
