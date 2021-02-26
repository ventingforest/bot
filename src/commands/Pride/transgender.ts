import * as Discord from 'discord.js';

export default {
	name: 'transgender',
	description: 'Overlay a trans pride flag over your profile picture!',
	aliases: ['trans'],
	run: async (tvf, msg, args) => {
		const opacity = (parseInt(args[0]) / 100) || 0.5;

		if (opacity > 1) {
			return msg.channel.send(tvf.emojiMessage(tvf.const.emojis.cross, 'The provided opacity has to be below 100!'));
		}

		msg.channel.send(new Discord.MessageAttachment(await tvf.pridePfp(msg.author, 'transgender', opacity)));
	}
} as Command;
