import type { GuildTextBasedChannel } from "discord.js";
import { channelLimiters, globalLimiter } from "./limiter";

export interface MessageInfo {
  time: number;
  length: number;
}

export const userMessages: Map<string, MessageInfo[]> = new Map();

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
          channel.messages.fetch({ limit: 100, before })
        )
      );
      if (messages.size === 0) break; // no more messages to process

      messages.values().forEach((message) => {
        if (!message.author) return;
        if (message.author.bot || message.author.username.startsWith("Deleted User")) return;
        // store in userMessages
        const userId = message.author.id;
        const stored = userMessages.get(userId) || [];
        stored.push({
          time: message.createdTimestamp,
          length: message.content.length,
        });
        userMessages.set(userId, stored);
        count++;
      });

      before = messages.last()?.id;
      if (!before) done = true; // no more messages to fetch
    } catch (err) {
      console.log(`failed to process #${channel.name} (${channel.id}):`, err);
      done = true;
    }
  }

  console.log(
    `processed ${count} messages from #${channel.name} (${channel.id})`
  );
}
