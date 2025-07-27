import { container } from "@sapphire/framework";
import type { InteractionUpdateOptions } from "discord.js";

import { Leaderboard } from "$lib/leaderboard";
import { levelForXp, rankInGuild } from "$lib/level";
import { progressStats } from "$lib/level/canvas";

export default class PlainLeaderboard extends Leaderboard {
	override pageLength = 5;

	override async render(page: number): Promise<InteractionUpdateOptions> {
		const lines = [`**Page ${page}/${this.pageCount}**\n`];
		const users = this.usersOnPage(page);
		const discordUsers = users.map(async ({ id }) =>
			container.client.users.fetch(id),
		);
		const resolvedUsers = await Promise.all(discordUsers);

		for (const [i, { id, xp }] of users.entries()) {
			const rank = rankInGuild(this.users, id);
			const user = resolvedUsers[i]!;
			const username = user.username ?? "Unknown";
			const level = levelForXp(xp);
			const stats = progressStats(xp);
			const progress = ((stats.xpInLevel / stats.xpNeeded) * 100).toFixed(1);
			const isUser = id === this.interaction.user.id;

			let medal: string;
			switch (rank) {
				case 1: {
					medal = "🥇";
					break;
				}

				case 2: {
					medal = "🥈";
					break;
				}

				case 3: {
					medal = "🥉";
					break;
				}

				default: {
					medal = `#${rank}`;
				}
			}

			const barLength = 10;
			const filled = Math.round((stats.xpInLevel / stats.xpNeeded) * barLength);
			const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

			lines.push(
				`${medal} **${username}** — Level ${level}${isUser ? " 👤" : ""}\n[${bar}] ${progress}%\n`,
			);
		}

		return {
			components: [this.getButtons(page)],
			content: lines.join("\n"),
		};
	}
}
