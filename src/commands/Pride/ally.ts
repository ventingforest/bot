import * as Discord from 'discord.js';

export default {
	name: 'ally',
	description: 'Overlay a straight ally pride flag over your profile picture!',
	aliases: ['straightally'],
	run: async (tvf, msg, args) => {
		const opacity = (parseInt(args[0]) / 100) || 0.5;

		if (opacity > 1) {
			return msg.channel.send(`**${tvf.emojis.cross}  |**  The provided opacity has to be below 100!`);
		}

		msg.channel.send(new Discord.MessageAttachment(await tvf.pridePfp(msg.author, 'agender', opacity)));
	}
} as Command;
