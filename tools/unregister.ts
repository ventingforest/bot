import { guildId } from "$shared/data";
import createClient from "$tools/client";

const client = await createClient();

client.once("ready", async () => {
	// global
	await client.rest.put(`/applications/${client.application!.id}/commands`, {
		body: [],
	});

	// guild
	await client.rest.put(
		`/applications/${client.application!.id}/guilds/${guildId}/commands`,
		{ body: [] },
	);

	await client.destroy();
});
