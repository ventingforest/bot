import {
  ApplicationCommandRegistry,
  Args,
  Command as SapphireCommand,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { guildId } from "./data";

export function Config(options: Command.Options) {
  return ApplyOptions<Command.Options>(options);
}

export class ChatInput extends SapphireCommand<Args, Command.Options> {
  override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      builder => builder.setName(this.name).setDescription(this.description),
      { idHints: this.options.idHints, guildIds: [guildId] },
    );
  }
}

export namespace Command {
  export type Options = SapphireCommand.Options & {
    name: string;
    description: string;
    idHints?: string[];
  };
}
