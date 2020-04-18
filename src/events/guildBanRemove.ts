import * as Discord from 'discord.js';
import Client from '../Client';

export default async (tvf: Client, _guild: Discord.Guild, user: Discord.User) => {
	if (tvf.isProduction) {
		// send ban removal message
		tvf.channels.general.send(`**${user.tag}** has been unbanned from the Forest.`);
	}
};
