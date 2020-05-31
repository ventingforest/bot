import * as Discord from 'discord.js';

export default {
	name: 'asexual',
	description: 'Overlay an asexual pride flag over your profile picture!',
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'asexual')))
} as Command;
