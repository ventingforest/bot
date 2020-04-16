import * as Discord from 'discord.js';
import Client from '../Client';

export default async (tvf: Client, user: Discord.User) => {
	if (tvf.isProduction) {
		// send ban removal message
		tvf.sendToChannel(tvf.channels.general, `**${user.tag}** has been unbanned from the Forest.`);
	}
};
