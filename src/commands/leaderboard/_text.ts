import { progressStats } from "$lib/level/canvas/progress";
import type { InteractionUpdateOptions } from "discord.js";
import { calculateLevel, rankInGuild } from "$lib/level";
import type { User as DbUser } from "$prisma";

export async function getTextPage(
  allUsers: DbUser[],
  pageUsers: DbUser[],
): Promise<InteractionUpdateOptions> {
  let lines: string[] = [];

  for (const user of pageUsers) {
    const rank = rankInGuild(allUsers, user.id);
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

  return {
    content: lines.join("\n"),
  };
}
