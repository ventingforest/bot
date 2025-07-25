import type { User } from "$prisma";

export * from "$shared/level";

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
