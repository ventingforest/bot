import * as Discord from 'discord.js';

const dog: Command = {
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment((await tvf.ksoft.images.random('dog', { nsfw: false })).url)),
	config: {
		name: 'dog',
		description: 'Get a picture of a dog ^w^',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default dog;