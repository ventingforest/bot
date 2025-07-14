import {
  ApplicationCommandRegistry,
  Command,
  type Awaitable,
  type ChatInputCommand,
} from "@sapphire/framework";
import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { isMessageInstance } from "@sapphire/discord.js-utilities";

export class PingCommand extends Command {
  override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      builder => builder.setName("ping").setDescription("check response times"),
      { idHints: ["1394099133106753597"] },
    );
  }

  override async chatInputRun(
    interaction: ChatInputCommandInteraction,
    _: ChatInputCommand.RunContext,
  ) {
    const { resource } = await interaction.reply({
      content: "ping?",
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });
    const msg = resource?.message;

    if (msg && isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(
        `pong! round trip took: \`${diff}ms\` ${ping !== -1 ? `heartbeat: \`${ping}ms\`` : ""}`,
      );
    }

    return interaction.editReply("pong!");
  }
}
