import * as Discord from 'discord.js';
import Client from '../Client';
import User from '../models/user';

export default async (tvf: Client, _guild: Discord.Guild, user: Discord.User) => {
	if (tvf.isProduction) {
		// delete doc from database
		User.findOneAndDelete({ id: user.id }).then(() =>
			tvf.logger.info(`Removed ${user.tag} from the database.`),
		);

		// send the ban message
    if (tvf.config.botbanner && user.bot) {
      const general = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: false })
        .setThumbnail(user.avatarURL())
        .setTitle('Begone Bot!')
        .setDescription(`${user.tag} was banned from the server! Stinky bot!`);

			const staff = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: false })
				.setThumbnail(user.avatarURL())
				.setTitle('Begone Bot!')
				.setDescription(`${user.tag} was banned from the server. This is because TVF Bot's bot banner is enabled. To toggle this, an administrator must run the \`tvf botban\` command! Remember to turn it back on afterwards when you're done adding bots!`)

			tvf.channels.general.send(general);
			tvf.channels.fk.send(staff);
		} else {
			tvf.channels.general.send(`**${user.tag}** has been banned from the Forest.`);
		}
	}
};
