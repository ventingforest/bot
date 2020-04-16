import * as Discord from 'discord.js';
import Client from '../Client';
import User from '../models/user';

export default async (tvf: Client, user: Discord.User) => {
	if (tvf.isProduction) {
		// delete user from database
		User.findOneAndDelete({ id: user.id }).then(() =>
			tvf.logger.info(`Removed ${user.tag} from the database.`),
		);

		// send ban message
		tvf.sendToChannel(tvf.channels.general, `**${user.tag}** has been banned from the Forest.`);
	}
};
