import { container } from "@sapphire/framework";
import type { InteractionUpdateOptions } from "discord.js";

import { calculateLevel, rankInGuild } from "$lib/level";
import { progressStats } from "$lib/level/canvas/progress";
import type { User as DbUser } from "$prisma";

export async function getTextPage<U extends Pick<DbUser, "id" | "xp">>(
	allUsers: U[],
	pageUsers: U[],
): Promise<InteractionUpdateOptions> {
	const lines: string[] = [];
	const users = allUsers.map(async ({ id }) =>
		container.client.users.fetch(id),
	);
	const resolvedUsers = await Promise.all(users);

	for (const [i, { id, xp }] of pageUsers.entries()) {
		const rank = rankInGuild(allUsers, id);
		const user = resolvedUsers[i]!;
		const username = user.username ?? "Unknown";
		const level = calculateLevel(xp);
		const stats = progressStats(xp);
		const progress = ((stats.xpInLevel / stats.xpNeeded) * 100).toFixed(1);

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
			`${medal} **${username}** — Level ${level}\n[${bar}] ${progress}%\n`,
		);
	}

	return {
		content: lines.join("\n"),
	};
}
