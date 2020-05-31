import * as Discord from 'discord.js';

export default {
	name: 'genderfluid',
	description: 'Overlay a genderfluid pride flag over your profile picture!',
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment(await tvf.prideImage(msg.author, 'genderfluid')))
} as Command;
