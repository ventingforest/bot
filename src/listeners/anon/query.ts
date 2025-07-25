import {
	type GuildTextBasedChannel,
	type MessageReaction,
	type MessageReactionEventDetails,
	type PartialMessageReaction,
	type PartialUser,
	type User,
} from "discord.js";

import { anonConf, guildId, staff } from "$lib/data";
import { config, Events, Listener, load } from "$listener";

@config(Events.MessageReactionAdd)
class Query extends Listener<typeof Events.MessageReactionAdd> {
	override async run(
		reaction: MessageReaction | PartialMessageReaction,
		user: User | PartialUser,
		_: MessageReactionEventDetails,
	) {
		if (reaction.emoji.name !== anonConf.queryReaction) return; // only handle specific reaction
		if (reaction.message.guildId !== guildId) return; // only handle reactions in the guild
		const guild = await this.container.client.guilds.fetch(guildId);
		const member = await guild.members.fetch(user.id);
		if (!member.roles.cache.has(staff.roleId)) return; // ignore reactions from non-staff members
		await reaction.remove();

		// lookup the message
		const data = await this.container.db.anonVent.findUnique({
			where: { message: reaction.message.id },
		});
		if (!data) return; // no data found for this message
		const target = await this.container.client.users.fetch(data.user);

		// send a message to the staff channel
		const channel = (await this.container.client.channels.fetch(
			staff.channelId,
		)) as GuildTextBasedChannel;
		await channel.send(
			`${user.toString()}, that [anonymous vent](${reaction.message.url}) was made by ${target.toString()}.`,
		);
	}
}

await load(Query);
