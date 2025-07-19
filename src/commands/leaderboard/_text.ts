import { progressStats } from "$lib/level/canvas/progress";
import type { InteractionUpdateOptions } from "discord.js";
import { calculateLevel, rankInGuild } from "$lib/level";
import type { Props } from "$interactions/leaderboard";
import type { User as DbUser } from "$prisma";

export async function getTextPage(
  { current, page }: Props,
  maxPage: number,
  users: DbUser[],
): Promise<InteractionUpdateOptions> {
  let lines: string[] = [];

  for (const user of users) {
    const rank = await rankInGuild(user.id, current);
    const username = user.username ?? "Unknown";
    const level = calculateLevel(user.xp);
    const stats = progressStats(user);
    const progress = ((stats.xpInLevel / stats.xpNeeded) * 100).toFixed(1);

    let medal: string;
    if (rank === 1) medal = "🥇";
    else if (rank === 2) medal = "🥈";
    else if (rank === 3) medal = "🥉";
    else medal = `#${rank}`;

    const barLength = 10;
    const filled = Math.round((stats.xpInLevel / stats.xpNeeded) * barLength);
    const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

    lines.push(
      `${medal} **${username}** — Level ${level}\n[${bar}] ${progress}%\n`,
    );
  }

  const content = [
    `**Leaderboard — Page ${page} of ${maxPage}**\n`,
    ...lines,
  ].join("\n");

  return {
    content,
  };
}
