import * as Discord from 'discord.js';

export default {
	name: 'demisexual',
	description: 'Overlay a demisexual pride flag over your profile picture!',
	aliases: ['demi'],
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'demisexual')))
} as Command;
