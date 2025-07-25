import { container } from "@sapphire/framework";
import type { Role } from "discord.js";

import { guildId, levelConf } from "$lib/data";
import type { User } from "$prisma";

export function calculateLevel(xp: number): number {
	return Math.floor(Math.sqrt(xp / 120));
}

export function xpForLevel(level: number): number {
	return 120 * level * level;
}

export function rankInGuild(
	users: Array<Pick<User, "id" | "xp">>,
	id: string,
): number {
	const sortedUsers = users.sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));
	return sortedUsers.findIndex(u => u.id === id) + 1;
}

export async function roleForXp(xp: number): Promise<Role | undefined> {
	const level = calculateLevel(xp);
	let bestId;
	for (const reward of levelConf.rewards) {
		if (level >= reward.level) bestId = reward.id;
		else break;
	}

	if (!bestId) return undefined;
	const guild = await container.client.guilds.fetch(guildId);
	const role = await guild.roles.fetch(bestId);
	return role ?? undefined;
}
