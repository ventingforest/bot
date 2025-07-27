// eslint-disable-next-line import-x/no-unassigned-import
import "./_load";

import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits, type GuildTextBasedChannel } from "discord.js";

import forceCacheChannel from "$lib/cache";
import { anonConf } from "$lib/data";
import Logger from "$lib/logger";
import env from "$shared/env";

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

await client.login(env.token);

// cache anon vent messages for query
const anonVent = (await client.channels.fetch(
	anonConf.channelId,
)) as GuildTextBasedChannel;
await forceCacheChannel(anonVent);
