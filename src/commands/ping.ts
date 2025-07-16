import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ChatInput, Config } from "$lib/command";
import { MessageFlags } from "discord.js";

@Config({
  name: "ping",
  description: "check response times",
  idHints: ["1394099133106753597"],
})
export class Ping extends ChatInput {
  override async chatInputRun(
    interaction: ChatInput.Interaction,
    _: ChatInput.RunContext,
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
