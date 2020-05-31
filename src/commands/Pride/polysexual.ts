import * as Discord from 'discord.js';

export default {
	name: 'polysexual',
	description: 'Overlay a polysexual pride flag over your profile picture!',
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'polysexual')))
} as Command;
