import * as Discord from 'discord.js';

export default {
	name: 'bisexual',
	description: 'Overlay a bisexual pride flag over your profile picture!',
	aliases: ['bi'],
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'bisexual')))
} as Command;
