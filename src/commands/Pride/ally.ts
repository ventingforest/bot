import * as Discord from 'discord.js';

export default {
	name: 'ally',
	description: 'Overlay a straight ally pride flag over your profile picture!',
	aliases: ['straightally'],
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'ally')))
} as Command;
