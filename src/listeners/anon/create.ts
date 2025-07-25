import { container } from "@sapphire/framework";
import {
	type Collection,
	type Message,
	type OmitPartialGroupDMChannel,
	type TextChannel,
	type Webhook,
	type WebhookType,
} from "discord.js";
import { animals, colors, uniqueNamesGenerator } from "unique-names-generator";

import { anonConf } from "$lib/data";
import { config, Events, Listener, load } from "$listener";

// user id -> session
type Session = { webhookId: string; lastActive: number; name: string };
const sessions = new Map<string, Session>();

const messageQueue: Array<OmitPartialGroupDMChannel<Message>> = [];

@config(Events.MessageCreate)
class Create extends Listener<typeof Events.MessageCreate> {
	override async run(message: OmitPartialGroupDMChannel<Message>) {
		if (message.author.bot || message.webhookId) return; // only listen to users
		if (message.channelId !== anonConf.channelId) return; // only handle messages in the anonymous vent channel
		await message.delete(); // delete the message to keep it anonymous
		await processMessage(message, await fetchWebhooks());
	}
}

await load(Create);

async function fetchWebhooks() {
	const channel = (await container.client.channels.fetch(
		anonConf.channelId,
	)) as TextChannel;
	return channel.fetchWebhooks();
}

async function processMessage(
	message: OmitPartialGroupDMChannel<Message>,
	webhooks: Collection<
		string,
		Webhook<WebhookType.Incoming | WebhookType.ChannelFollower>
	>,
	retry = false,
) {
	// find the session for this user or create a new one
	let session = sessions.get(message.author.id);
	const now = Date.now();

	if (!session || now - session.lastActive > anonConf.sessionTimeout) {
		const assigned = new Set([...sessions.values()].map(s => s.webhookId));

		const webhookId = [...webhooks.keys()].find(id => !assigned.has(id));
		if (!webhookId) {
			if (!retry) messageQueue.push(message); // if no webhook available, queue the message
			return;
		}

		const name = uniqueNamesGenerator({
			dictionaries: [colors, animals],
		})
			.split("_")
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join("");

		session = { lastActive: now, name, webhookId };
	} else {
		session.lastActive = now;
	}

	sessions.set(message.author.id, session);

	// send the message using the webhook
	const webhook = webhooks.get(session.webhookId)!;
	const newMessage = await webhook.send({
		content: message.content,
		username: session.name,
	});

	// store the identity of the user who sent the message
	await container.db.anonVent.create({
		data: { message: newMessage.id, user: message.author.id },
	});
}

setInterval(async () => {
	// periodic cleanup
	const now = Date.now();
	for (const [userId, { lastActive }] of sessions.entries()) {
		if (now - lastActive > anonConf.sessionTimeout) {
			sessions.delete(userId);
		}
	}

	// process queued messages
	const webhooks = await fetchWebhooks();
	await Promise.all(
		messageQueue.map(async message => {
			await processMessage(message, webhooks, true);
			messageQueue.splice(messageQueue.indexOf(message), 1);
		}),
	);
}, 1000 * 60); // every minute
