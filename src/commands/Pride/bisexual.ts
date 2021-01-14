import * as Discord from 'discord.js';

export default {
	name: 'bisexual',
	description: 'Overlay a bisexual pride flag over your profile picture!',
	aliases: ['bi'],
	run: async (tvf, msg, args) => {
		const opacity = (parseInt(args[0]) / 100) || 0.5;

		if (opacity > 1) {
			return msg.channel.send(`**${tvf.const.cross}  |**  The provided opacity has to be below 100!`);
		}

		msg.channel.send(new Discord.MessageAttachment(await tvf.pridePfp(msg.author, 'bisexual', opacity)));
	}
} as Command;
