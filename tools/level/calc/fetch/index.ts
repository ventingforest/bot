import { writeFile } from "node:fs/promises";

import { getLogger } from "@logtape/logtape";
import { encode } from "@msgpack/msgpack";
import Bottleneck from "bottleneck";
import type { Collection, GuildTextBasedChannel, Message } from "discord.js";

import { guildId, levelConf } from "$shared/data";
import configure from "$shared/logger";
import createClient from "$tools/client";

import { type MessageData, messagePath, readFile } from "../lib";

// read old messages and populate maps
const lastTime = new Map<string, number>(); // author id: timestamp
const latestMessage = new Map<string, string>(); // channel id: message id

const oldMessages: MessageData[] = [];

try {
	const messages = await readFile();
	oldMessages.push(...messages);

	for (const { authorId, channelId, time, id } of oldMessages) {
		lastTime.set(authorId, Math.max(lastTime.get(authorId) ?? 0, time));
		latestMessage.set(channelId, id);
	}
} catch {}

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

async function fetchAllMessages(
	channel: GuildTextBasedChannel,
): Promise<MessageData[]> {
	const limiter = channelLimiters.key(channel.id);
	let before: string | undefined;
	let after = latestMessage.get(channel.id);
	const allMessages: MessageData[] = [];
	let fetched: Collection<string, Message>;

	do {
		// fetch all of the messages in the channel
		// eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-loop-func
		fetched = await globalLimiter.schedule(async () =>
			limiter.schedule(async () =>
				channel.messages.fetch({
					limit: 100,
					...(after ? { after } : { before }),
				}),
			),
		);

		// strip down to relevant data
		const messages: MessageData[] = [...fetched.values()].map(
			({
				id,
				author: { id: authorId },
				content: { length },
				createdTimestamp: time,
			}) => ({
				authorId,
				channelId: channel.id,
				id,
				length,
				time,
			}),
		);

		// update message options
		if (after) after = messages.at(0)?.id;
		else before = messages.at(-1)?.id;

		allMessages.push(...messages);

		logger.debug(
			`fetched ${messages.length} messages from channel ${channel.name} (${channel.id})`,
		);
	} while (fetched.size > 0);

	return allMessages;
}

function shouldStoreMessage({ authorId, time }: MessageData): boolean {
	const last = lastTime.get(authorId) ?? 0;
	if (time - last < levelConf.cooldown) {
		// 10 second cooldown
		return false;
	}

	lastTime.set(authorId, time);
	return true;
}

await configure({
	loggers: [
		{
			category: "calc",
			lowestLevel: "debug",
			sinks: ["console"],
		},
	],
});

const logger = getLogger("calc");
const client = await createClient();

client.once("ready", async () => {
	const guild = await client.guilds.fetch(guildId);
	const allChannels = await guild.channels.fetch();
	const channels = allChannels
		.filter(channel => channel?.isTextBased())
		.map(channel => channel as GuildTextBasedChannel);

	// fetch all messages
	const fetchMessages = channels.map(async channel => {
		logger.info(
			`fetching messages from channel ${channel.name} (${channel.id})`,
		);
		return fetchAllMessages(channel);
	});
	const fetchResults = await Promise.all(fetchMessages);

	// write messages to file
	const newMessages = fetchResults
		.flat()
		.sort(({ time: a }, { time: b }) => a - b)
		.filter(message => shouldStoreMessage(message));

	const messages = [...newMessages, ...oldMessages];
	await writeFile(messagePath, encode(messages));

	await client.destroy();
});
