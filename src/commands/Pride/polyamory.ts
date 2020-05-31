import * as Discord from 'discord.js';

export default {
	name: 'polyamory',
	description: 'Overlay a polyamory pride flag over your profile picture!',
	aliases: ['poly'],
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'polyamory')))
} as Command;
