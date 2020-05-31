import * as Discord from 'discord.js';

export default {
	name: 'genderqueer',
	description: 'Overlay a genderqueer pride flag over your profile picture!',
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'genderqueer')))
} as Command;
