import { Client, type ClientOptions } from "discord.js";

import { token } from "$shared/data";

export default async function createClient(
	options?: ClientOptions,
): Promise<Client> {
	const client = new Client(options ?? { intents: [] });
	await client.login(token);

	return client;
}
