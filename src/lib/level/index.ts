import { container } from "@sapphire/framework";

/**
 * How many users to show on a page of the leaderboard.
 */
export const pageLength = {
  pretty: 5,
  text: 10,
};

export function calculateLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 120));
}

export function xpForLevel(level: number) {
  return 120 * level * level;
}

export async function rankInGuild(
  id: string,
  current?: boolean,
): Promise<number> {
  const users = await container.db.user.findMany({
    where: current ? { present: true } : undefined,
  });
  const sortedUsers = users.sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));
  return sortedUsers.findIndex(u => u.id === id) + 1;
}
