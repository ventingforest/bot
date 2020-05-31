import * as Discord from 'discord.js';

export default {
	name: 'transgender',
	description: 'Overlay a trans pride flag over your profile picture!',
	aliases: ['trans'],
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'transgender')))
} as Command;
