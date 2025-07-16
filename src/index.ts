import { Message, type GuildTextBasedChannel } from "discord.js";
import Bottleneck from "bottleneck";
import { client, prisma } from "./ctx";
import type { User } from "./generated/prisma";
import logger from "./logger";

// global rate limit: 50 req/sec
const globalLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000 / 50,
});

// per channel rate limit: 5 req/sec
const channelLimiters = new Bottleneck.Group({
  maxConcurrent: 1,
  minTime: 1000 / 5,
});

const lastTime = new Map<string, number>();

function xpForMessage(id: string, time: number, length: number): number {
  const last = lastTime.get(id) || 0;
  // 10 seconds cooldown
  if (time - last < 1000 * 10) {
    // within cooldown period, no xp
    return 0;
  }
  lastTime.set(id, time);
  const points = Math.floor(length / 20);
  return Math.min(5 + points, 10);
}

client.once("ready", async () => {
  logger.info(`logged in as ${client.user?.tag}!`);
  const guild = await client.guilds.fetch(process.env.GUILD_ID!);

  // get all text channels in the guild (only those with messages)
  const channels = guild.channels.cache.filter(
    (ch): ch is GuildTextBasedChannel =>
      ch.isTextBased() &&
      !ch.isThread() &&
      typeof (ch as GuildTextBasedChannel).messages?.fetch === "function",
  );

  // collect all messages from all channels
  const allMessages: Message[] = [];
  await Promise.all(
    Array.from(channels.values()).map(async (channel) => {
      const textChannel = channel as GuildTextBasedChannel;
      logger.info(
        `processing channel: #${textChannel.name} (${textChannel.id})`,
      );
      let before: string | undefined = undefined;
      const limiter = channelLimiters.key(textChannel.id);
      let fetchCount = 0;

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
          if (fetchCount % 10000 === 0) {
            logger.debug(
              `still fetching #${textChannel.name} (${textChannel.id}): ${fetchCount} messages so far...`,
            );
          }
          if (!before) break;
        } catch (err) {
          logger.error(
            `failed to process #${textChannel.name} (${textChannel.id}): ${err}`,
          );
          break;
        }
      }
    }),
  );

  // sort messages (oldest first)
  allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  // process all messages in order
  let totalCount = 0;
  const stats = new Map();
  for (const msg of allMessages) {
    const { author, createdTimestamp: time, content } = msg;
    if (!author || author.bot || author.username.startsWith("Deleted User"))
      continue;
    totalCount++;
    const xp = xpForMessage(author.id, time, content.length);
    const prev = stats.get(author.id);
    const member = guild.members.cache.get(author.id);
    stats.set(author.id, {
      xp: (prev?.xp || 0) + (xp > 0 ? xp : 0),
      username: author.username,
      present: !!member,
    });
    if (totalCount % 1000 === 0) {
      logger.debug(`still processing: ${totalCount} messages processed...`);
    }
  }

  // update database in a single transaction for better sqlite performance
  await prisma.$transaction(
    Array.from(stats.entries()).map(([id, { xp, username, present }]) =>
      prisma.user.upsert({
        where: { id },
        update: { xp: { increment: xp }, username, present },
        create: { id, xp, username, present },
      }),
    ),
  );

  logger.info("done!");
  await client.destroy();
});

client.login(process.env.BOT_TOKEN!);
