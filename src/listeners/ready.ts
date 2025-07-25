import { ActivityType, type Client } from "discord.js";

import { isProduction } from "$lib/data";
import { synchroniseGuild } from "$lib/db";
import { config, Events, Listener, load } from "$listener";

@config(Events.ClientReady, {
	once: true,
})
class Ready extends Listener<typeof Events.ClientReady> {
	override async run(client: Client<true>) {
		client.user.setActivity("over you :]", { type: ActivityType.Watching });
		this.container.logger.info(`Logged in as ${client.user?.tag}`);

		if (isProduction) {
			await synchroniseGuild();
			this.container.logger.info("guild synchronisation complete");
		}
	}
}

await load(Ready);
