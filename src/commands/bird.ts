import * as Discord from 'discord.js';

const bird: Command = {
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment((await tvf.ksoft.images.random('birb', { nsfw: false })).url)),
	config: {
		name: 'bird',
		description: 'Get a picture of a bird ^w^',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default bird;