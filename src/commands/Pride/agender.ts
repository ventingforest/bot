import * as Discord from 'discord.js';

export default {
	name: 'agender',
	description: 'Overlay an agender pride flag over your profile picture!',
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'agender')))
} as Command;
