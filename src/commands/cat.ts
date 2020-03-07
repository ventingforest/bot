import * as Discord from 'discord.js';

const cat: Command = {
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment((await tvf.ksoft.images.random('cat', { nsfw: false })).url)),
	config: {
		name: 'cat',
		description: 'Get a picture of a cat ^w^',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default cat;