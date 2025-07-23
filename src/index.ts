// eslint-disable-next-line import-x/no-unassigned-import
import "./_load";

import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

import Logger from "$lib/logger";
import token from "$shared/token";

const client = new SapphireClient({
	baseUserDirectory: null,
	intents: [
		// read messages
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,

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
