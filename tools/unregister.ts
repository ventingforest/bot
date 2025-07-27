import { REST } from "discord.js";

import { guildId, token } from "$shared/data";
import createClient from "$tools/client";

const client = await createClient();
await client.destroy(); // we only need the client to get the application ID

const rest = new REST({ version: "10" }).setToken(token);

// global
await rest.put(`/applications/${client.application!.id}/commands`, {
	body: [],
});

// guild
await rest.put(
	`/applications/${client.application!.id}/guilds/${guildId}/commands`,
	{ body: [] },
);
