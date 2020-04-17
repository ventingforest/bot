import * as Discord from 'discord.js';
import Client from '../Client';
import User from '../models/user';
import moment from 'moment';

export default async (tvf: Client, member: Discord.GuildMember) => {
	if (tvf.isProduction) {
		// ban auditor bots
		if (member.user.bot && moment(member.joinedAt).diff(Date.now(), 'second') <= 3) {
			tvf.channels.general.send('**Begone, bot!**');
			return tvf.server.members.ban(member.user.id, { reason: `Auditor bot. `});
		}

		// delete user from database
		User.findOneAndDelete({ id: member.user.id }).then(() =>
			tvf.logger.info(`Removed ${member.user.tag} from the database.`),
		);

		// send goodbye message
		tvf.channels.general.send(`**${member.user.tag}** has exited the Forest.`);
	}
};
