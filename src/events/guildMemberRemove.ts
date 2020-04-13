import * as Discord from 'discord.js';
import Client from '../structures/TVFClient';
import User from '../models/user';
import * as moment from 'moment';

const guildMemberRemove = async (tvf: Client, member: Discord.GuildMember) => {
	if (tvf.isProduction) {
		// ban auditor bots
		if (member.user.bot && moment(member.joinedAt).diff(Date.now(), 'second') <= 3) {
			tvf.sendToChannel(tvf.channels.GENERAL, '**Begone, bot!**');
			return member.ban({ reason: `Most likely an auditor bot. `});
		}

		// delete user from database
		User.findOneAndDelete({ id: member.user.id }).then(() =>
			tvf.logger.info(`Removed ${member.user.tag} from the database.`),
		);

		// send goodbye message
		const ban = await member.guild.fetchBan(member.user);

		if (ban.user === member.user) {
			tvf.sendToChannel(tvf.channels.GENERAL, `**${member.user.tag}** has been banned from the Forest`);
		} else {
			tvf.sendToChannel(tvf.channels.GENERAL, `**${member.user.tag}** has exited the Forest.`);
		}
	}
};

export default guildMemberRemove;
