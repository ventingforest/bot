import type { Message, OmitPartialGroupDMChannel } from "discord.js";

import { isProduction, xp } from "$lib/data";
import { config, Events, Listener, load } from "$listener";

@config(Events.MessageCreate)
class GiveXp extends Listener<typeof Events.MessageCreate> {
	override async run(message: OmitPartialGroupDMChannel<Message>) {
		if (message.author.bot) return; // ignore bot messages
		if (!message.guild) return; // ensure it's a guild message

		const xp = computeXp(message);
		if (xp === 0) return; // no xp to give
		this.container.logger.debug(
			`giving ${xp} XP to ${message.author.username}`,
		);

		if (isProduction) {
			await this.container.db.user.update({
				data: { xp: { increment: xp } },
				where: { id: message.author.id },
			});
		}
	}
}

await load(GiveXp);

// keeps the last time a user sent a message
const lastTime = new Map<string, number>();

function computeXp({
	author: { id },
	createdTimestamp: time,
	content: { length },
}: Message): number {
	const last = lastTime.get(id) ?? 0;

	if (time - last < xp.cooldown) {
		// within cooldown period, no XP
		return 0;
	}

	lastTime.set(id, time);

	const points = Math.floor(length / xp.charsPerPoint);
	return Math.min(xp.minimum + points, xp.maximum);
}
