import * as Discord from 'discord.js';
import User from '../models/user';
import Client from '../structures/TVFClient';
import * as moment from 'moment';

const guildMemberAdd = async (tvf: Client, member: Discord.GuildMember) => {
	// bot detection
	const botRegex = /[A-Z][a-z]+[1-9]+/g;
	const now = moment(Date.now());
	const createdAt = moment(member.user.createdAt);

	if (
		botRegex.exec(member.user.username) !== null &&
        now.diff(createdAt, 'day') <= 2
	) {
		return member.ban({
			reason: 'Bot detected.',
		});
	}

	// welcome the user
	tvf.sendToChannel(tvf.channels.GENERAL, `Welcome ${tvf.bot.emojis.get(tvf.emojis.HAI).toString()}`);

	// database
	return User.create({
		tag: member.user.tag,
		id: member.user.id,
		isolation: {
			isolated: false,
			roles: [],
		},
	});
};

export default guildMemberAdd;
