import { type Message, type OmitPartialGroupDMChannel } from "discord.js";

import { channelId } from "$lib/anon";
import { config, Events, Listener, load } from "$listener";

@config(Events.MessageCreate)
class Create extends Listener<typeof Events.MessageCreate> {
	override async run(message: OmitPartialGroupDMChannel<Message>) {
		if (message.author.bot || message.webhookId) return; // only listen to users
		if (message.channelId !== channelId) return; // only handle messages in the anonymous vent channel
		await message.delete(); // delete the message to keep it anonymous

		// todo: send the vent

		// await this.container.db.anonVent.create({ data: { message: newMessage.id, user: message.author.id } });
	}
}

await load(Create);
