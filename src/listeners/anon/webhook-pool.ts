import { type Client, type TextChannel } from "discord.js";

import { anonWebhooks, channelId, webhookPoolSize } from "$lib/anon";
import { config, Events, Listener, load } from "$listener";

@config(Events.ClientReady)
class WebhookPool extends Listener<typeof Events.ClientReady> {
	override async run(client: Client<true>) {
		// delete old webhooks
		const channel = (await client.channels.fetch(channelId)) as TextChannel;
		const webhooks = await channel.fetchWebhooks();
		const deletePromises = webhooks.map(async webhook => {
			// only delete webhooks that are owned by the bot
			if (webhook.owner?.id !== client.user.id) return;
			await webhook.delete("pool cleanup");
		});

		// create new webhooks
		const createPromises = Array.from({ length: webhookPoolSize }).map(
			async (_, i) => {
				const webhook = await channel.createWebhook({
					name: `Anonymous Vent ${i + 1}`,
					reason: "pool creation",
				});
				anonWebhooks.set(webhook.id, webhook.token);
			},
		);

		// run all promises concurrently
		await Promise.all([...deletePromises, ...createPromises]);
		this.container.logger.info("Initialised the anonymous webhook pool");
	}
}

await load(WebhookPool);
