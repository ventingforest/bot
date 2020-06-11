import * as Discord from 'discord.js';
import Client from '../Client';
import User from '../models/user';
import * as timeout from 'timeout';

export default async (tvf: Client, member: Discord.GuildMember) => {
	if (tvf.isProduction) {
		// get the user's document
		const doc = await tvf.userDoc(member.user.id);

		// if the user has a pending venting session, clear the expiry timeout
		if (doc.private.requested) {
			timeout.timeout(doc.private.id, null);
			timeout.timeout(`${doc.private.id}1`, null);
			timeout.timeout(`${doc.private.id}2`, null);
			timeout.timeout(`${doc.private.id}3`, null);
			timeout.timeout(`${doc.private.id}4`, null);
			timeout.timeout(`${doc.private.id}5`, null);
		}

		// delete user from database
		User.findOneAndDelete({ id: member.user.id }).then(() =>
			tvf.logger.info(`Removed ${member.user.tag} from the database.`),
		);

		// send goodbye message
		tvf.channels.general.send(`**${member.user.tag}** has exited the Forest.`);
	}
};
