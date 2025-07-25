// eslint-disable-next-line import-x/no-unassigned-import
import "./_load";

import { SapphireClient } from "@sapphire/framework";
import {
	type FetchMessagesOptions,
	GatewayIntentBits,
	type GuildTextBasedChannel,
} from "discord.js";

import { anonConf } from "$lib/data";
import Logger from "$lib/logger";
import token from "$shared/token";

const client = new SapphireClient({
	baseUserDirectory: null,
	intents: [
		// read messages
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,

		// see guild members
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
	],
	loadMessageCommandListeners: true,
	logger: {
		instance: new Logger(),
	},
});

await client.login(token);

// cache anon vent messages
const anonVent = (await client.channels.fetch(
	anonConf.channelId,
)) as GuildTextBasedChannel;
let lastId: string | undefined;
let fetched = 0;

const fetchBatch = async () => {
	const options: FetchMessagesOptions = { limit: 100 };
	if (lastId) options.before = lastId;
	const messages = await anonVent.messages.fetch(options);
	fetched = messages.size;
	if (fetched > 0) {
		lastId = messages.last()?.id;
		if (fetched === 100) {
			await fetchBatch();
		}
	}
};

await fetchBatch();
