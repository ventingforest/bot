import * as Discord from 'discord.js';

export default {
	name: 'pansexual',
	description: 'Overlay a pansexual pride flag over your profile picture!',
	aliases: ['pan'],
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'pansexual')))
} as Command;
