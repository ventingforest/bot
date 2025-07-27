import type { FetchMessagesOptions, GuildTextBasedChannel } from "discord.js";

export default async function forceCacheChannel(
	channel: GuildTextBasedChannel,
) {
	let lastId: string | undefined;
	let fetched = 0;

	async function fetchBatch() {
		const options: FetchMessagesOptions = { limit: 100 };
		if (lastId) options.before = lastId;
		const messages = await channel.messages.fetch(options);
		fetched = messages.size;
		if (fetched > 0) {
			lastId = messages.last()?.id;
			if (fetched === 100) {
				await fetchBatch();
			}
		}
	}

	await fetchBatch();
}
