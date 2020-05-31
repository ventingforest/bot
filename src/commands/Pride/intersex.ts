import * as Discord from 'discord.js';

export default {
	name: 'intersex',
	description: 'Overlay an intersex pride flag over your profile picture!',
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'intersex')))
} as Command;
