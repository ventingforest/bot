import { isMessageInstance } from "@sapphire/discord.js-utilities";
import type { ChatInputCommand } from "@sapphire/framework";
import { type ChatInputCommandInteraction, MessageFlags } from "discord.js";

import { Command, config, load } from "$command";

@config({
	slash: {
		description: "check response times",
		idHints: {
			dev: "1398851571026231339",
			prod: "1398852594268504084",
		},
		name: "ping",
	},
})
class Ping extends Command {
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

await load(Ping);
