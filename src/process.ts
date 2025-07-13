import type { GuildTextBasedChannel } from "discord.js";
import { channelLimiters, globalLimiter } from "./limiter";
import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

// --- processing ---
export default async function processChannel(channel: GuildTextBasedChannel) {
  console.log(`processing channel: #${channel.name} (${channel.id})`);
  let done = false;
  let before: string | undefined = undefined;
  let count = 0;
  const limiter = channelLimiters.key(channel.id);

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
        // no deleted users
        if (
          !author ||
          author.username.startsWith("Deleted User")
        )
          continue;
        if (author.bot) continue; // no bots
        const { id } = author;

        await prisma.user.upsert({
          where: { id },
          update: { xp: { increment: xpForMessage(id, time, length) } },
          create: { id },
        });
      }

      before = messages.last()?.id;
      if (!before) done = true; // no more messages to fetch
    } catch (err) {
      console.log(`failed to process #${channel.name} (${channel.id}):`, err);
      done = true;
    }
  }

  console.log(
    `processed ${count} messages from #${channel.name} (${channel.id})`,
  );
}

// --- xp ---
const cooldown = 1000 * 10; // 10 seconds

// keeps the last time a user sent a message during computation
const lastMessageTime = new Map<string, number>();

function xpForMessage(id: string, time: number, length: number): number {
  const last = lastMessageTime.get(id) || 0;

  if (time - last < cooldown) {
    // within cooldown period, no XP
    return 0;
  }

  // compute xp
  // min 5 points
  // max 10 points
  // 20 chars ~= 1 point
  const xp = Math.min(10, Math.max(5, Math.floor(length / 20)));

  return xp;
}
