import { type ChatInputCommand } from "@sapphire/framework";
import { type ChatInputCommandInteraction, MessageFlags } from "discord.js";

import { Command, config, load } from "$command";
import type { Leaderboard } from "$lib/leaderboard";
import PlainLeaderboard from "$lib/leaderboard/plain";
import PrettyLeaderboard from "$lib/leaderboard/pretty";

// interaction id: leaderboard
export const activeLeaderboards = new Map<string, Leaderboard>();

@config({
	slash: {
		description: "view the server leaderboard",
		idHints: {
			dev: "1398851570006753403",
			prod: "435894444101861408",
		},
		name: "leaderboard",
		options(builder) {
			builder
				.addNumberOption(option =>
					option
						.setName("page")
						.setDescription("the page of the leaderboard to start at")
						.setMinValue(1),
				)
				.addBooleanOption(option =>
					option
						.setName("present")
						.setDescription(
							"only show users that are currently members of the server",
						),
				)
				.addBooleanOption(option =>
					option
						.setName("plain")
						.setDescription(
							"use a text-only leaderboard instead of the graphical one",
						),
				);
		},
	},
})
class LeaderboardCommand extends Command {
	override async chatInputRun(
		interaction: ChatInputCommandInteraction,
		_: ChatInputCommand.RunContext,
	) {
		// parse options
		const page = interaction.options.getNumber("page") ?? 1;
		const present = interaction.options.getBoolean("present") ?? true;
		const plain = interaction.options.getBoolean("plain");

		// create the leaderboard
		const users = await this.container.db.user.findMany({
			orderBy: { xp: "desc" },
			select: { id: true, present: true, xp: true },
			where: present ? { present: true } : undefined,
		});
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const ChosenLeaderboard = plain ? PlainLeaderboard : PrettyLeaderboard;
		const leaderboard: Leaderboard = new ChosenLeaderboard(
			users,
			interaction,
			present,
		);
		activeLeaderboards.set(interaction.id, leaderboard);

		// this interaction will expire in 15 minutes
		setTimeout(
			() => {
				activeLeaderboards.delete(interaction.id);
			},
			15 * 60 * 1000,
		);

		// don't allow invalid pages
		if (page < 1 || page > leaderboard.pageCount) {
			await interaction.reply({
				content: `Page ${page} does not exist. Please choose a page between 1 and ${leaderboard.pageCount}.`,
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await interaction.reply({
			...((await leaderboard.render(page)) as any),
			flags: MessageFlags.Ephemeral,
		});
	}
}

await load(LeaderboardCommand);
