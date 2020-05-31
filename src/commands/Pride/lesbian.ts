import * as Discord from 'discord.js';

export default {
	name: 'lesbian',
	description: 'Overlay a lesbian pride flag over your profile picture!',
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'lesbian')))
} as Command;
