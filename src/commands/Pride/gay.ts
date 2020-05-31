import * as Discord from 'discord.js';

export default {
	name: 'gay',
	description: 'Overlay a gay pride flag over your profile picture!',
	aliases: ['homosexual'],
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'gay')))
} as Command;
