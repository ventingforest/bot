import * as Discord from 'discord.js';

export default {
	name: 'aromantic',
	description: 'Overlay an aromantic pride flag over your profile picture!',
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'aromantic')))
} as Command;
