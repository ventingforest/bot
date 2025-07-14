import type { GuildTextBasedChannel, Message } from "discord.js";
import { channelLimiters, globalLimiter } from "./limiter";
import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

import type { Guild } from "discord.js";

export default async function processGuild(
  guild: Guild,
  logger: (msg: string) => Promise<void> = async () => {},
) {
  await logger(`processing guild: ${guild.name} (${guild.id})`);
  let totalCount = 0;
  const userStats: Map<string, { xp: number; username: string; present: boolean }> = new Map();

  // get all text channels in the guild (only those with messages)
  const channels = guild.channels.cache.filter(
    (ch): ch is GuildTextBasedChannel =>
      ch.isTextBased() &&
      !ch.isThread() &&
      typeof (ch as GuildTextBasedChannel).messages?.fetch === "function",
  );

  // process channels concurrently
  await Promise.all(
    Array.from(channels.values()).map(async (channel) => {
      const textChannel = channel as GuildTextBasedChannel;
      await logger(`processing channel: #${textChannel.name} (${textChannel.id})`);
      let before: string | undefined = undefined;
      const limiter = channelLimiters.key(textChannel.id);
      const allMessages: Message[] = [];
      let fetchCount = 0;
      const fetchStart = Date.now();

      // fetch all messages in the channel, with periodic updates
      while (true) {
        try {
          const messages = await limiter.schedule(() =>
            globalLimiter.schedule(() =>
              textChannel.messages.fetch({ limit: 100, before }),
            ),
          );
          if (!messages?.size) break;
          allMessages.push(...messages.values());
          before = messages.last?.()?.id;
          fetchCount += messages.size;
          if (fetchCount % 500 === 0) {
            await logger(`still fetching #${textChannel.name} (${textChannel.id}): ${fetchCount} messages so far...`);
          }
          if (!before) break;
        } catch (err) {
          await logger(`failed to process #${textChannel.name} (${textChannel.id}): ${err}`);
          break;
        }
      }
      const fetchEnd = Date.now();

      let count = 0;
      const processStart = Date.now();
      for (const msg of allMessages.reverse()) {
        const { author, createdTimestamp: time, content } = msg;
        // skip bots and deleted users
        if (!author || author.bot || author.username.startsWith("Deleted User")) continue;
        count++;
        const xp = xpForMessage(author.id, time, content.length);
        const prev = userStats.get(author.id);
        // check if user is currently present in the guild
        const member = guild.members.cache.get(author.id);
        userStats.set(author.id, {
          xp: (prev?.xp || 0) + (xp > 0 ? xp : 0),
          username: author.username,
          present: !!member,
        });
        if (count % 1000 === 0) {
          await logger(`still processing #${textChannel.name} (${textChannel.id}): ${count} messages processed...`);
        }
      }
      const processEnd = Date.now();
      totalCount += count;
      const fetchTime = ((fetchEnd - fetchStart) / 1000).toFixed(2);
      const processTime = ((processEnd - processStart) / 1000).toFixed(2);
      const avgTimePerMsg = count ? (Number(processTime) / count).toFixed(4) : "0";
      await logger(`processed ${count} messages from #${textChannel.name} (${textChannel.id})`);
      await logger(`timing for #${textChannel.name}: fetch ${fetchTime}s, process ${processTime}s, avg ${avgTimePerMsg}s/msg`);
    })
  );

  // update database in a single transaction for better SQLite performance
  // update database in a single transaction for better sqlite performance
  await prisma.$transaction(
    Array.from(userStats.entries()).map(([id, { xp, username, present }]) =>
      prisma.user.upsert({
        where: { id },
        update: { xp: { increment: xp }, username, present },
        create: { id, xp, username, present },
      })
    )
  );

  await logger(
    `processed ${totalCount} messages from guild ${guild.name} (${guild.id})`,
  );

  // return summary statistics
  const totalXp = Array.from(userStats.values()).reduce((a, b) => a + b.xp, 0);
  return {
    guildName: guild.name,
    guildId: guild.id,
    messageCount: totalCount,
    userCount: userStats.size,
    totalXp,
  };
}

const cooldown = 1000 * 10; // 10 seconds

// keeps the last time a user sent a message during computation
const lastTime = new Map<string, number>();

function xpForMessage(id: string, time: number, length: number): number {
  const last = lastTime.get(id) || 0;
  if (time - last < cooldown) {
    // within cooldown period, no xp
    return 0;
  }
  lastTime.set(id, time);
  const points = Math.floor(length / 20);
  return Math.min(5 + points, 10);
}
