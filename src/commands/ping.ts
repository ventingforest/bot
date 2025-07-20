import { isMessageInstance } from "@sapphire/discord.js-utilities";
import type { ChatInputCommand } from "@sapphire/framework";
import { type ChatInputCommandInteraction, MessageFlags } from "discord.js";

import { Command, config } from "$command";

@config({
	slash: {
		description: "check response times",
		idHints: ["1396170990228213781"],
		name: "ping",
	},
})
export class Ping extends Command {
	override async chatInputRun(
		interaction: ChatInputCommandInteraction,
		_: ChatInputCommand.RunContext,
	) {
		const { resource } = await interaction.reply({
			content: "ping?",
			flags: MessageFlags.Ephemeral,
			withResponse: true,
		});
		const message = resource?.message;

		if (message && isMessageInstance(message)) {
			const diff = message.createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);
			return interaction.editReply(
				`pong! round trip took: \`${diff}ms\` ${ping === -1 ? "" : `heartbeat: \`${ping}ms\``}`,
			);
		}

		return interaction.editReply("pong!");
	}
}
