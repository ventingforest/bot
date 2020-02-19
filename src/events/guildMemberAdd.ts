import * as Discord from 'discord.js';
import User from '../models/user';
import Client from '../structures/TVFClient';
import * as moment from 'moment';
import { Ban } from 'ksoft.js';

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

	// ksoft.si ban api
	// if the user is in the ban list
	if (await tvf.ksoft.bans.check(member.id)) {
		// get information about the user's ban
		// @ts-ignore
		const data: Ban = await tvf.ksoft.bans.info(member.id);

		// if the ban is unappealable
		if (!data.appealable) {
			// ban the user
			await member.ban({
				reason: 'Unappealable ban on ksoft.si',
			});

			// explain the ban
			return tvf.sendToChannel(tvf.channels.GENERAL, `${member.user.tag} was banned for having an unappealable ban on ksoft.si`);
		}
		else {
			// send an alert to the forest keepers channel
			const embed = tvf.createEmbed('red')
				.setTitle('A globally banned member has joined the server!')
				.setDescription(`Reason: ${data.reason}`)
				.addField('Tag', member.user.tag, true)
				.addField('User ID', member.id, true)
				.addField('Proof', data.proof);

			return tvf.sendToChannel(tvf.channels.FK, `<@&${tvf.roles.FK}>`, embed);
		}
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
