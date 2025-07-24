import {
	type Message,
	type OmitPartialGroupDMChannel,
	type PartialMessage,
} from "discord.js";

import { anon } from "$lib/data";
import { config, Events, Listener, load } from "$listener";

@config(Events.MessageDelete)
class Delete extends Listener<typeof Events.MessageDelete> {
	override async run(
		message: OmitPartialGroupDMChannel<Message | PartialMessage>,
	) {
		if (!message.webhookId) return; // only listen to webhook messages
		if (message.channelId !== anon.channelId) return; // only handle messages in the anonymous vent channel

		await this.container.db.anonVent.delete({ where: { message: message.id } });
	}
}

await load(Delete);
