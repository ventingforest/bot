import type { GuildTextBasedChannel } from "discord.js";
import { channelLimiters, globalLimiter } from "./limiter";
import { PrismaClient } from "./generated/prisma";

// --- processing ---
const prisma = new PrismaClient();
const batchSize = 5;

export default async function processChannel(channel: GuildTextBasedChannel) {
  console.log(`processing channel: #${channel.name} (${channel.id})`);
  let done = false;
  let before: string | undefined = undefined;
  let count = 0;
  const limiter = channelLimiters.key(channel.id);
  const userXpMap = new Map<string, number>();

  while (!done) {
    try {
      const messages = await limiter.schedule(() =>
        globalLimiter.schedule(() =>
          channel.messages.fetch({ limit: 100, before }),
        ),
      );
      if (messages.size === 0) break; // no more messages to process

      for (const {
        author,
        createdTimestamp: time,
        content: { length },
      } of messages.values()) {
        count++;
        if (!author) {
          console.log(`skipped message: missing author`);
          continue;
        }
        if (author.username.startsWith("Deleted User")) {
          console.log(`skipped message: deleted user (${author.id})`);
          continue;
        }
        if (author.bot) {
          // no bots
          continue;
        }
        const { id } = author;

        const xp = xpForMessage(id, time, length);
        if (xp > 0) {
          userXpMap.set(id, (userXpMap.get(id) || 0) + xp);
          console.log(
            `awarded ${xp} XP to user ${id} for message (${length} chars)`,
          );
        } else {
          console.log(`no XP for user ${id}: cooldown (${length} chars)`);
        }
      }

      before = messages.last()?.id;
      if (!before) done = true; // no more messages to fetch
    } catch (err) {
      console.log(`failed to process #${channel.name} (${channel.id}):`, err);
      done = true;
    }
  }

  // update database in small batches to avoid overwhelming SQLite
  const entries = Array.from(userXpMap.entries());
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    console.log(`writing batch to database:`, batch);
    await Promise.all(
      batch.map(([id, xp]) =>
        prisma.user.upsert({
          where: { id },
          update: { xp: { increment: xp } },
          create: { id, xp },
        }),
      ),
    );
  }

  console.log(
    `processed ${count} messages from #${channel.name} (${channel.id})`,
  );

  // return summary statistics
  const totalXp = Array.from(userXpMap.values()).reduce((a, b) => a + b, 0);
  return {
    channelName: channel.name,
    channelId: channel.id,
    messageCount: count,
    userCount: userXpMap.size,
    totalXp,
  };
}

// --- xp ---
const cooldown = 1000 * 10; // 10 seconds

// keeps the last time a user sent a message during computation
const lastTime = new Map<string, number>();

function xpForMessage(id: string, time: number, length: number): number {
  const last = lastTime.get(id) || 0;

  if (time - last < cooldown) {
    // within cooldown period, no XP
    return 0;
  }
  lastTime.set(id, time);

  const points = Math.floor(length / 20);
  return Math.min(5 + points, 10);
}
