import { levelConf } from "$lib/data";
import type { User } from "$prisma";

export function levelForXp(xp: number): number {
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

export function roleIdForLevel(level: number): string {
	let bestId = "0";
	for (const reward of levelConf.rewards) {
		if (level >= reward.level) bestId = reward.id;
		else break;
	}

	return bestId;
}
