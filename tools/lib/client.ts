import { Client, type ClientOptions } from "discord.js";

import env from "$shared/env";

export default async function createClient(
	options?: ClientOptions,
): Promise<Client> {
	const client = new Client(options ?? { intents: [] });
	await client.login(env.token);

	return client;
}
