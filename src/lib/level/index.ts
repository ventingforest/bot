import { container } from "@sapphire/framework";
import type { User } from "discord.js";

/**
 * How many users to show on a page of the leaderboard.
 */
export const pageLength = 5;

export function calculateLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 120));
}

export function xpForLevel(level: number) {
  return 120 * level * level;
}

export async function rankInGuild(user: User): Promise<number> {
  const users = await container.db.user.findMany({ where: { present: true } });
  const sortedUsers = users.sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));
  return sortedUsers.findIndex(u => u.id === user.id) + 1;
}
