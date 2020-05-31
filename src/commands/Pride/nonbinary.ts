import * as Discord from 'discord.js';

export default {
	name: 'nonbinary',
	description: 'Overlay a nonbinary pride flag over your profile picture!',
	aliases: ['nb'],
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'nonbinary')))
} as Command;
