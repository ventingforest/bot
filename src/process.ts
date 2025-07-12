import type { GuildTextBasedChannel } from "discord.js";
import { channelLimiters, globalLimiter } from "./limiter";

export default async function processChannel(channel: GuildTextBasedChannel): Promise<Map<string, number>> {
    console.log(`processing channel: #${channel.name} (${channel.id})`);
    let done = false;
    let before: string | undefined = undefined;
    const limiter = channelLimiters.key(channel.id);
    const counts = new Map<string, number>();

    while (!done) {
        try {
            const messages = await limiter.schedule(() => globalLimiter.schedule(() => channel.messages.fetch({ limit: 100, before })));
            if (messages.size === 0) break; // no more messages to process

            for (const message of messages.values()) {
                counts.set(message.author.id, (counts.get(message.author.id) || 0) + 1);   
            }

            console.log(counts);

            before = messages.last()?.id;
            if (!before) done = true; // no more messages to fetch
        } catch (err) {
            console.log(`failed to process #${channel.name} (${channel.id}):`, err);
            done = true;
        }
    }

    return counts;
}