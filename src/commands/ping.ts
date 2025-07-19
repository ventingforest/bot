import { type ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import type { ChatInputCommand } from "@sapphire/framework";
import { ChatInput, Config } from "$command";

@Config({
  name: "ping",
  description: "check response times",
  idHints: ["1395199919865856110"],
})
export class Ping extends ChatInput {
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
