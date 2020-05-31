import * as Discord from 'discord.js';

export default {
	name: 'progress',
	description: 'Overlay a progress gay pride flag over your profile picture!',
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'progress')))
} as Command;
