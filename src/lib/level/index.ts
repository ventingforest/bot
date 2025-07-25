import type { User } from "$prisma";
import { getLevelRole, levelForXp, levelRoles } from "$shared/level";

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

export function nextLevelRole(xp: number): { id: string; xpAway: number } {
	const currentLevel = levelForXp(xp);
	const currentRoleId = getLevelRole(currentLevel);
	const currentRoleIndex = levelRoles.findIndex(
		role => role.id === currentRoleId,
	);
	const nextRole = levelRoles[currentRoleIndex + 1];
	const nextRoleXp = xpForLevel(nextRole?.level ?? currentLevel + 1);
	return { id: nextRole?.id ?? currentRoleId, xpAway: nextRoleXp - xp };
}
