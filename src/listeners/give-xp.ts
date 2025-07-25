import type { Message, OmitPartialGroupDMChannel } from "discord.js";

import { isProduction, levelConf } from "$lib/data";
import { levelForXp, roleIdForLevel } from "$lib/level";
import { config, Events, Listener, load } from "$listener";

@config(Events.MessageCreate)
class GiveXp extends Listener<typeof Events.MessageCreate> {
	override async run(message: OmitPartialGroupDMChannel<Message>) {
		if (message.author.bot) return; // ignore bot messages
		if (!message.guild) return; // ensure it's a guild message

		// compute message xp
		const messageXp = computeXp(message);
		if (messageXp === 0) return; // no xp to give
		this.container.logger.debug(
			`giving ${messageXp} XP to ${message.author.username}`,
		);

		if (isProduction) {
			// add it to the user's xp
			const user = (await this.container.db.user.findUnique({
				where: { id: message.author.id },
			}))!;
			const oldLevel = levelForXp(user.xp);
			const newXp = user.xp + messageXp;
			const newLevel = levelForXp(newXp);

			// handle level up
			if (newLevel > oldLevel) {
				const oldRole = roleIdForLevel(oldLevel);
				const newRole = roleIdForLevel(newLevel);
				await message.member?.roles.add(newRole, "level up");
				await message.member?.roles.remove(oldRole, "level up");
			}

			// write to database
			await this.container.db.user.update({
				data: { xp: newXp },
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

	if (time - last < levelConf.cooldown) {
		// within cooldown period, no XP
		return 0;
	}

	lastTime.set(id, time);

	const points = Math.floor(length / levelConf.charsPerPoint);
	return Math.min(levelConf.minimum + points, levelConf.maximum);
}
