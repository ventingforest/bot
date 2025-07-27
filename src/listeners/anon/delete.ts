import {
	type Message,
	type OmitPartialGroupDMChannel,
	type PartialMessage,
} from "discord.js";

import { anonConf } from "$lib/data";
import { config, Events, Listener, load } from "$listener";

@config(Events.MessageDelete)
class Delete extends Listener<typeof Events.MessageDelete> {
	override async run(
		message: OmitPartialGroupDMChannel<Message | PartialMessage>,
	) {
		if (!message.webhookId) return; // only listen to webhook messages
		if (message.channelId !== anonConf.channelId) return; // only handle messages in the anonymous vent channel
		await this.container.db.anon.delete({ where: { message: message.id } });
	}
}

await load(Delete);
